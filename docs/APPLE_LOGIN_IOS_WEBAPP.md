# Login com Apple no iOS Web App – Core+

Documentação da implementação do Sign in with Apple na tela de login do app iOS (WKWebView), baseada no modelo Locus (APPLE_LOGIN_IOS_WEBAPP.md).

---

## 1. Visão Geral

O app usa o **SDK nativo `AuthenticationServices`** do iOS em vez do fluxo OAuth web dentro do WebView:

- Experiência nativa (sheet modal da Apple)
- Compatibilidade com as diretrizes da App Store
- Evita problemas de popup/redirect em WebViews
- O token JWT (`identityToken`) é obtido nativamente e repassado ao Web

**Fluxo:** Web detecta app nativo → solicita login via bridge `requestAppleSignIn` → Nativo exibe sheet → Usuário autentica → Nativo envia `idToken` via `window.__locusAppleSignInToken(idToken)` → Web usa `signInWithCredential`.

---

## 2. Implementação

### Native (Swift)
- **Handler:** `requestAppleSignIn`
- **AppleSignInDelegate:** `ASAuthorizationControllerDelegate` + `ASAuthorizationControllerPresentationContextProviding`
- **performAppleSignIn:** `request.requestedScopes = [.fullName, .email]`, sem nonce
- **Delay:** `DispatchQueue.main.asyncAfter(deadline: .now() + 0.15)` antes de `evaluateJavaScript`
- **Callbacks:** `window.__locusAppleSignInToken(idToken)` e `window.__locusAppleSignInError(message)`
- **Escape:** `\`, `'`, `\r`, `\n` no token

### Web (TypeScript)
- **loginWithAppleNative():** usa `requestAppleSignIn`, callbacks `__locusAppleSignInToken`/`__locusAppleSignInError`
- **Retorno:** `{ idToken }` (sem rawNonce)
- **AuthContext:** `OAuthProvider('apple.com').credential({ idToken })`

---

## 3. Configuração

- **Entitlements:** `com.apple.developer.applesignin` com `Default`
- **Capability:** Sign in with Apple no Xcode
- **Firebase:** Habilitar Apple em Authentication → Sign-in method
