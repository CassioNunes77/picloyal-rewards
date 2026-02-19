# Configuração do Painel Administrativo com Firebase

Para que o painel administrativo possa **adicionar regiões**, **categorias** e outras operações que exigem autenticação no Firestore, é necessário configurar uma conta de administrador no Firebase Auth.

## Passos

1. **Criar usuário no Firebase Auth**
   - Acesse o [Firebase Console](https://console.firebase.google.com)
   - Vá em **Authentication** > **Users** > **Add user**
   - Crie um usuário com **email** e **senha** (ex.: `admin@seudominio.com`)

2. **Configurar variáveis de ambiente**
   - Copie o `.env.example` para `.env` (se ainda não tiver)
   - Adicione as credenciais do admin:
   ```
   VITE_ADMIN_FIREBASE_EMAIL=admin@seudominio.com
   VITE_ADMIN_FIREBASE_PASSWORD=sua_senha_segura
   ```

3. **Reiniciar o servidor de desenvolvimento**
   - Após alterar o `.env`, reinicie o `npm run dev` ou `yarn dev`

4. **Fazer login no painel admin**
   - Acesse o painel administrativo e faça login com as credenciais do admin (usuário/senha do painel)
   - O sistema fará login automático no Firebase Auth com a conta configurada
   - Agora você poderá adicionar regiões, categorias, etc.

## Observação

As regras de segurança do Firestore exigem `request.auth != null` para operações de escrita em regiões e categorias. O painel admin usa autenticação própria (usuário/senha), mas as requisições ao Firestore precisam de um usuário autenticado no Firebase Auth. Por isso, ao fazer login no painel, o sistema também autentica no Firebase com a conta configurada em `VITE_ADMIN_FIREBASE_EMAIL` e `VITE_ADMIN_FIREBASE_PASSWORD`.
