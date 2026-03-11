# Login com Google no iOS Web App – Core+

Documentação da implementação do login com Google na tela de login do app iOS (WKWebView), baseada no modelo Locus.

---

## 1. Visão Geral

O app é um **iOS Web App** (WKWebView) que carrega uma SPA React. O login com Google usa o **SDK nativo do Google Sign-In** no iOS em vez do fluxo OAuth dentro do WebView, para evitar o erro 403 (disallowed_useragent) que o Google retorna em WebViews.

**Fluxo resumido:**
1. Web (React) detecta que está no app nativo via `window.webkit?.messageHandlers`
2. Web solicita login ao nativo via bridge `requestGoogleSignIn`
3. Nativo executa `GIDSignIn.signIn(withPresenting:)` → alerta do sistema → navegador nativo
4. Nativo obtém o `idToken` e envia de volta ao Web via `window.__locusGoogleSignInToken(idToken)`
5. Web usa `signInWithCredential` do Firebase Auth com esse token

---

## 2. Arquitetura

| Camada | Tecnologia | Responsabilidade |
|--------|------------|------------------|
| **Web** | React + Firebase Auth | UI de login, chamada ao bridge, uso do token no Firebase |
| **Bridge** | WKScriptMessageHandler + postMessage | Comunicação bidirecional Web ↔ Nativo |
| **Nativo** | Swift + GoogleSignIn-iOS | Execução do fluxo OAuth nativo e obtenção do idToken |

---

## 3. Implementação Web

### 3.1 Detecção do App Nativo

```typescript
// src/lib/nativeBridge.ts
export function isIOSWebView(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.webkit?.messageHandlers;
}
```

### 3.2 Função loginWithGoogleNative

```typescript
// src/lib/nativeBridge.ts
export function loginWithGoogleNative(): Promise<{ idToken: string }> {
  return new Promise((resolve, reject) => {
    const handler = window.webkit?.messageHandlers?.requestGoogleSignIn;
    if (!handler) {
      reject(new Error("Bridge não disponível"));
      return;
    }
    window.__locusGoogleSignInToken = (idToken: string) => {
      window.__locusGoogleSignInToken = null;
      window.__locusGoogleSignInError = null;
      resolve({ idToken });
    };
    window.__locusGoogleSignInError = (msg: string) => {
      window.__locusGoogleSignInToken = null;
      window.__locusGoogleSignInError = null;
      reject(new Error(msg || "Login cancelado"));
    };
    handler.postMessage({});
  });
}
```

### 3.3 Handler no AuthContext

```typescript
// src/contexts/AuthContext.tsx
if (isIOSWebView()) {
  const { idToken } = await loginWithGoogleNative();
  const credential = GoogleAuthProvider.credential(idToken);
  userCredential = await signInWithCredential(auth, credential);
} else {
  userCredential = await signInWithPopup(auth, provider);
}
```

---

## 4. Implementação Nativa (Swift)

### 4.1 Handler e performGoogleSignIn

- **Arquivo:** `CartaoFidelidade/Views/WebAppView.swift`
- **Handler:** `requestGoogleSignIn`
- **Client ID:** `FirebaseApp.app()?.options.clientID` (do GoogleService-Info.plist)

### 4.2 onOpenURL

```swift
.onOpenURL { url in
    if url.host == "cardcorevo.netlify.app" {
        // Deep links do app
    } else {
        _ = GIDSignIn.sharedInstance.handle(url)
    }
}
```

### 4.3 Bridge Injetado

Após `didFinish`, o nativo injeta `window.__nativeBridge.requestGoogleSignIn`:

```javascript
window.__nativeBridge.requestGoogleSignIn = function() {
    if (window.webkit?.messageHandlers?.requestGoogleSignIn) {
        window.webkit.messageHandlers.requestGoogleSignIn.postMessage({});
    }
};
```

---

## 5. Configuração

### 5.1 URL Scheme (Info.plist)

O valor é o **Reversed Client ID** do `GoogleService-Info.plist`:

```xml
<key>CFBundleURLSchemes</key>
<array>
    <string>com.googleusercontent.apps.557856899178-0u1rgd95b3r3jlkioldv3hgbi9k9vsrv</string>
</array>
```

### 5.2 GoogleService-Info.plist

- `CLIENT_ID`: Client ID completo
- `REVERSED_CLIENT_ID`: usado como URL Scheme
- `BUNDLE_ID`: deve coincidir com o OAuth Client no Google Cloud

---

## 6. Checklist

### iOS (Swift)
- [x] Pacote `GoogleSignIn-iOS`
- [x] URL Scheme com Reversed Client ID no Info.plist
- [x] WKScriptMessageHandler para `requestGoogleSignIn`
- [x] `performGoogleSignIn` com `GIDSignIn.signIn(withPresenting:)`
- [x] `onOpenURL` → `GIDSignIn.handle(url)` para URLs do Google
- [x] Token/erro via `window.__locusGoogleSignInToken` / `__locusGoogleSignInError`

### Web (React/TypeScript)
- [x] Detecção `window.webkit?.messageHandlers`
- [x] `loginWithGoogleNative()` com callbacks
- [x] Handler: se nativo → `loginWithGoogleNative()` + `signInWithCredential`; se navegador → `signInWithPopup`

### Segurança
- [x] Escapar `\` e `'` no token antes de injetar em JavaScript
- [x] Verificar `typeof window.__locusGoogleSignInToken === 'function'` antes de chamar
- [x] Limpar callbacks após uso
