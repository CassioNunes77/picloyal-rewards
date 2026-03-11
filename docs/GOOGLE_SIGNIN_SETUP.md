# Configuração do Entrar com Google (iOS)

## 1. Pacote Google Sign-In

O projeto referencia o pacote **GoogleSignIn-iOS**. Se o Xcode mostrar "Missing package product":

1. **File → Add Package Dependencies…**
2. URL: `https://github.com/google/GoogleSignIn-iOS`
3. Adicione o produto **GoogleSignIn** ao target CartaoFidelidade.

(Se já estiver adicionado, use **File → Packages → Resolve Package Versions**.)

## 2. URL Scheme (obrigatório para o callback do Google)

1. No Xcode, selecione o **target CartaoFidelidade**.
2. Aba **Info** (ou **Signing & Capabilities**).
3. Em **URL Types**, clique em **+**.
4. Em **URL Schemes** coloque o valor de **REVERSED_CLIENT_ID** do seu `GoogleService-Info.plist`.  
   Exemplo (substitua pelo valor do seu plist):  
   `com.googleusercontent.apps.557856899178-0u1rgd95b3r3jlkioldv3hgbi9k9vsrv`
5. **Identifier**: pode deixar em branco ou usar `REVERSED_CLIENT_ID`.
6. **Role**: Editor.

Sem esse URL scheme, o app não recebe o retorno do login do Google.

## 3. Firebase

- O **GoogleService-Info.plist** já está na pasta do app.
- O Firebase é inicializado em `CartaoFidelidadeApp.init()` com `FirebaseApp.configure()`.
- No Firebase Console, ative o provedor **Google** em Authentication → Sign-in method.
