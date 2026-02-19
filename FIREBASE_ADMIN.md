# Configuração do Painel Administrativo

O painel administrativo usa **Firebase Auth** (e-mail/senha) e a coleção **admins** no Firestore para controlar quem pode acessar.

## Passos para configurar o primeiro administrador

### 1. Criar usuário no Firebase Auth

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Vá em **Authentication** > **Users** > **Add user**
3. Crie um usuário com **e-mail** e **senha** (ex.: `admin@seudominio.com`)
4. **Copie o UID** do usuário criado (aparece na lista de usuários)

### 2. Adicionar à coleção admins no Firestore

1. No Firebase Console, vá em **Firestore Database**
2. Clique em **Start collection** (ou use a coleção existente)
3. **Collection ID**: `admins`
4. **Document ID**: use o **UID** do usuário criado no passo 1 (ex.: `abc123xyz`)
5. Adicione um campo (opcional): `email` (string) = e-mail do admin
6. Clique em **Save**

### 3. Fazer login no painel

1. Acesse o painel administrativo (ex.: `/sys-admin-panel-7x9k/login`)
2. Faça login com o **e-mail** e **senha** do usuário criado no Firebase Auth
3. Se o UID estiver na coleção `admins`, o acesso será liberado

## Adicionar mais administradores

Repita os passos 1 e 2 para cada novo admin: crie o usuário no Firebase Auth e adicione um documento em `admins` com o ID = UID do usuário.

## Deploy no Netlify

Não é necessário configurar variáveis de ambiente para o painel admin. O login é feito diretamente com as credenciais do Firebase Auth. Basta garantir que o Firebase está configurado (`VITE_FIREBASE_*`).

## Observação

As regras do Firestore permitem que um usuário autenticado leia apenas seu próprio documento em `admins` (para verificar se é admin). A criação de novos admins é feita manualmente via Firebase Console.
