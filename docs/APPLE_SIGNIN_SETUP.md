# Configuração do Entrar com Apple (iOS e Web)

## Pré-requisitos

- Conta no [Apple Developer Program](https://developer.apple.com/programs/)
- Projeto Firebase configurado

---

## iOS

### 1. Capability no Xcode

O projeto já possui a capability **Sign in with Apple** em `CartaoFidelidade.entitlements`:

```xml
<key>com.apple.developer.applesignin</key>
<array>
    <string>Default</string>
</array>
```

### 2. Firebase Console (iOS)

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. **Authentication** → **Sign-in method**
4. Clique em **Apple** e ative o provedor
5. Preencha:
   - **Service ID** (opcional para apps nativos iOS)
   - **Team ID** (Apple Developer)
   - **Key ID** e **Private Key** (crie em [Apple Developer → Keys](https://developer.apple.com/account/resources/authkeys/list))

> **Importante:** Sem habilitar o provedor Apple no Firebase, o login falhará com erro de credencial.

### 3. Fluxo implementado (iOS)

O `AppleSignInHelper`:

1. Gera um nonce aleatório (segurança contra replay)
2. Envia o hash SHA256 do nonce para a Apple
3. Obtém o `identityToken` da resposta da Apple
4. Cria credencial Firebase com `OAuthProvider.appleCredential(withIDToken:rawNonce:fullName:)`
5. Faz login no Firebase com `Auth.auth().signIn(with: credential)`

---

## Web

### 1. Apple Developer Console

1. Acesse [Apple Developer](https://developer.apple.com/account/resources)
2. **Certificates, Identifiers & Profiles** → **Identifiers** → **Services IDs**
3. Crie um **Service ID** (ex.: `com.corevo.coremais.web`)
4. Em **Sign In with Apple**, marque como habilitado
5. Configure o **Return URL**:
   ```
   https://SEU_PROJECT_ID.firebaseapp.com/__/auth/handler
   ```
   (Substitua `SEU_PROJECT_ID` pelo ID do projeto Firebase)
6. Anote o **Service ID** criado

### 2. Chave privada (Apple)

1. **Keys** → **+** para criar nova chave
2. Marque **Sign In with Apple**
3. Baixe o arquivo `.p8` (só pode baixar uma vez)
4. Anote o **Key ID**

### 3. Firebase Console (Web)

1. **Authentication** → **Sign-in method** → **Apple**
2. Ative o provedor
3. Preencha:
   - **Service ID**: o criado no passo 1
   - **Apple Team ID**: seu Team ID
   - **Key ID**: da chave criada
   - **Private Key**: conteúdo do arquivo `.p8`

### 4. Domínios autorizados

1. **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. Adicione o domínio do seu site (ex.: `cardcorevo.netlify.app`, `localhost` para testes)

### 5. Fluxo implementado (Web)

O `AuthContext` usa `OAuthProvider('apple.com')` com `signInWithPopup`:

- Scopes: `email`, `name`
- Locale: `pt-BR`
- Criação automática do usuário no Firestore via `createOrUpdateUser`

---

## Solução de problemas

| Problema | Solução |
|----------|---------|
| "Operação não completa" (iOS) | Verifique se o provedor Apple está habilitado no Firebase Console |
| "Audience does not match" (iOS) | Bundle ID do app deve coincidir com o registrado no Firebase |
| "auth/operation-not-allowed" (Web) | Ative o provedor Apple no Firebase e configure Service ID, Team ID, Key |
| "auth/unauthorized-domain" (Web) | Adicione o domínio em Firebase → Authentication → Authorized domains |
| Popup bloqueado (Web) | Permita popups para o site ou use outro navegador |
