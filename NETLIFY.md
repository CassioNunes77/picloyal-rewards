# Deploy no Netlify (cardcorevo.netlify.app)

Para a **tela de splash/login** aparecer ao abrir o site, configure assim:

## 1. Repositório

- Se o repositório for **este (com pasta web/ e arquivos na raiz)**:
  - **Base directory:** deixe **vazio** (build na raiz do repositório).
- Se o repositório for **só o app web** (sem pasta web/):
  - **Base directory:** vazio.

## 2. Build

- **Build command:** `npm run build`
- **Publish directory:** `dist`

## 3. Variáveis de ambiente (Firebase) — obrigatório para login

Sem essas variáveis o site mostra **"Firebase não configurado. Configure as variáveis no Netlify."** e o login (e-mail e Google) não funciona.

**Onde configurar no Netlify:**  
Site **cardcorevo** → **Site configuration** → **Environment variables** → **Add a variable** / **Add from .env**.

**Onde pegar os valores:**  
[Firebase Console](https://console.firebase.google.com/) → selecione o projeto → ícone de engrenagem **Project settings** → na seção **Your apps**, escolha o app Web (ou crie um). Os valores aparecem em **Firebase SDK snippet** → **config**.

| Nome no Netlify | Onde está no Firebase |
|-----------------|------------------------|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` (ex.: `seu-projeto.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` (ex.: `seu-projeto.appspot.com`) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

Adicione as **6 variáveis** com os valores do seu projeto. Depois faça um **novo deploy** (Deploys → Trigger deploy) para o build usar os valores novos.

## 4. Redirect SPA

O `netlify.toml` e o `public/_redirects` já estão no projeto. Eles fazem com que **qualquer URL** (incluindo `/`) sirva o `index.html`, para o React Router exibir a tela de splash/login.

## 5. Depois de alterar

- Faça **Deploy** (ou “Trigger deploy” no Netlify).
- Teste em aba anônima ou com cache limpo: https://cardcorevo.netlify.app/
