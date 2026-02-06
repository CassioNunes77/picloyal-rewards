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

## 3. Variáveis de ambiente (Firebase)

Em **Site settings → Environment variables** adicione:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Sem essas variáveis a tela de login **ainda aparece**, mas login/cadastro não funcionam até configurar.

## 4. Redirect SPA

O `netlify.toml` e o `public/_redirects` já estão no projeto. Eles fazem com que **qualquer URL** (incluindo `/`) sirva o `index.html`, para o React Router exibir a tela de splash/login.

## 5. Depois de alterar

- Faça **Deploy** (ou “Trigger deploy” no Netlify).
- Teste em aba anônima ou com cache limpo: https://cardcorevo.netlify.app/
