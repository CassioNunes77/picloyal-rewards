# Regras de Segurança do Firebase Firestore

Este documento contém as regras de segurança recomendadas para o Firebase Firestore do projeto Core+.

## 📋 Regras Implementadas

### 1. Regiões (Localização) - `/regions/{regionId}`

**Leitura:**
- ✅ Usuários autenticados: podem ler todas as regiões
- ✅ Usuários não autenticados: podem ler apenas regiões ativas (`active == true`)

**Escrita:**
- ✅ Apenas usuários autenticados podem criar, atualizar ou deletar
- ✅ Validação de campos obrigatórios: `name`, `state`, `city`, `country`, `active`
- ✅ Validação de tipos de dados
- ✅ Validação de timestamps (`createdAt`, `updatedAt`)

### 2. Categorias - `/categories/{categoryId}`

**Leitura:**
- ✅ Usuários autenticados: podem ler todas as categorias
- ✅ Usuários não autenticados: podem ler apenas categorias ativas (`active == true`)

**Escrita:**
- ✅ Apenas usuários autenticados podem criar, atualizar ou deletar
- ✅ Validação de campos obrigatórios: `name`, `icon`, `active`, `productsCount`
- ✅ Validação de tipos de dados
- ✅ Validação de valores (ex: `productsCount >= 0`)
- ✅ Validação de timestamps (`createdAt`, `updatedAt`)

### 3. Usuários - `/users/{userId}`

**Leitura:**
- ✅ Usuários podem ler apenas seus próprios dados (`request.auth.uid == userId`)

**Escrita:**
- ✅ Usuários podem criar/atualizar apenas seus próprios dados
- ✅ Usuários não podem deletar seus próprios dados (apenas admin)

### 4. Outras Coleções

- ❌ Por padrão, acesso negado a outras coleções não especificadas

## 🔧 Como Aplicar as Regras

### Opção 1: Via Firebase Console (Recomendado)

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto
3. Vá em **Firestore Database** > **Rules**
4. Cole o conteúdo do arquivo `firestore.rules`
5. Clique em **"Publish"**

### Opção 2: Via Firebase CLI

```bash
# Instalar Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Fazer login
firebase login

# Inicializar Firebase (se ainda não tiver)
firebase init firestore

# Deploy das regras
firebase deploy --only firestore:rules
```

## 🔐 Regras de Produção (Recomendado)

Para produção, adicione verificação de admin. Exemplo:

```javascript
// Função helper para verificar se é admin
function isAdmin() {
  return request.auth != null && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}

// Usar nas regras
allow create, update, delete: if isAdmin();
```

### Estrutura de Usuário Admin

No documento do usuário (`/users/{userId}`), adicione o campo:

```json
{
  "isAdmin": true,
  // ... outros campos
}
```

## ⚠️ Regras Temporárias para Desenvolvimento

Se precisar testar sem autenticação, use temporariamente:

```javascript
// ⚠️ ATENÇÃO: Remover em produção!
match /regions/{regionId} {
  allow read, write: if true;
}

match /categories/{categoryId} {
  allow read, write: if true;
}
```

**IMPORTANTE**: Nunca deixe essas regras em produção!

## 📝 Validações Implementadas

### Regiões

- ✅ Campos obrigatórios presentes
- ✅ Tipos corretos (string, bool, timestamp)
- ✅ Timestamps sempre atualizados em updates
- ✅ Campos não podem ser removidos em updates

### Categorias

- ✅ Campos obrigatórios presentes
- ✅ Tipos corretos (string, bool, int, timestamp)
- ✅ Validação de valores (`productsCount >= 0`)
- ✅ Validação de strings não vazias
- ✅ Timestamps sempre atualizados em updates

## 🚀 Próximos Passos

1. **Aplicar as regras no Firebase Console**
2. **Testar criação/leitura de regiões e categorias**
3. **Implementar verificação de admin** (quando necessário)
4. **Adicionar regras para outras coleções** (lojas, produtos, etc.)

## 📚 Documentação Adicional

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Regras de Segurança - Guia Completo](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Validação de Dados](https://firebase.google.com/docs/firestore/security/rules-conditions#data_validation)
