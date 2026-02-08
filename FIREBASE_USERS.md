# Firebase Firestore - Estrutura de Dados do Usuário

## Visão Geral

Este documento descreve a estrutura de dados dos usuários armazenados no Firestore. Quando um usuário faz login pela primeira vez (via e-mail/senha ou Google), seus dados são automaticamente persistidos na coleção `users` do Firestore.

## Coleção: `users`

### Estrutura do Documento

Cada documento na coleção `users` representa um usuário autenticado e possui a seguinte estrutura:

```typescript
{
  // Identificação
  uid: string;                    // ID do usuário (mesmo do Firebase Auth)
  
  // Dados básicos do Firebase Auth
  email: string | null;           // E-mail do usuário
  displayName: string | null;     // Nome de exibição
  photoURL: string | null;        // URL da foto de perfil
  phoneNumber: string | null;      // Número de telefone (do Firebase Auth)
  
  // Dados adicionais do perfil
  phone?: string;                 // Telefone adicional (pode ser diferente do phoneNumber)
  
  // Metadados
  createdAt: Timestamp;           // Data de criação do documento
  updatedAt: Timestamp;           // Data da última atualização
  lastLoginAt: Timestamp;         // Data do último login
}
```

### Exemplo de Documento

```json
{
  "uid": "abc123def456",
  "email": "usuario@exemplo.com",
  "displayName": "João Silva",
  "photoURL": "https://example.com/photo.jpg",
  "phoneNumber": "+5511999999999",
  "phone": "+5511999999999",
  "createdAt": "2026-01-27T10:00:00Z",
  "updatedAt": "2026-01-27T15:30:00Z",
  "lastLoginAt": "2026-01-27T15:30:00Z"
}
```

## Comportamento Automático

### Criação do Documento

Quando um usuário faz login pela primeira vez (via `signIn`, `signUp` ou `signInWithGoogle`), o sistema automaticamente:

1. Verifica se já existe um documento para o `uid` do usuário
2. Se não existir, cria um novo documento com todos os dados do Firebase Auth
3. Se já existir, atualiza apenas os campos que mudaram e o `lastLoginAt`

### Atualização Automática

O documento é atualizado automaticamente quando:
- O usuário faz login (atualiza `lastLoginAt` e `updatedAt`)
- Dados do Firebase Auth mudam (email, displayName, photoURL, phoneNumber)

## Adicionando Novos Campos

Para adicionar novos campos relacionados ao usuário, siga estes passos:

### 1. Atualizar a Interface TypeScript

Edite `src/services/usersService.ts` e adicione o novo campo na interface `UserData`:

```typescript
export interface UserData {
  // ... campos existentes ...
  
  // Novo campo
  points?: number;
  stamps?: number;
  favoriteStores?: string[];
  preferences?: {
    notifications?: boolean;
    darkMode?: boolean;
    language?: string;
  };
}
```

### 2. Atualizar as Funções de Conversão

Se necessário, atualize `firestoreToUserData` e `userDataToFirestore` para lidar com o novo campo.

### 3. Usar o Serviço para Atualizar

Use `updateUserData` do `usersService` para atualizar os novos campos:

```typescript
import { updateUserData } from "@/services/usersService";

// Exemplo: Adicionar pontos ao usuário
await updateUserData(user.uid, {
  points: 100,
});
```

### 4. Atualizar as Regras do Firestore (se necessário)

Se o novo campo precisar de validação específica nas regras de segurança, edite `firestore.rules`.

## Regras de Segurança

As regras atuais permitem que:
- Usuários leiam apenas seus próprios dados (`request.auth.uid == userId`)
- Usuários criem/atualizem apenas seus próprios dados
- Usuários não possam deletar seus próprios dados (apenas admin)

```javascript
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow create, update: if request.auth != null && request.auth.uid == userId;
  allow delete: if false;
}
```

## Serviço: `usersService.ts`

O serviço `usersService.ts` fornece as seguintes funções:

- `createOrUpdateUser(user: User)`: Cria ou atualiza o documento do usuário no Firestore
- `getUserData(userId: string)`: Busca dados do usuário no Firestore
- `updateUserData(userId: string, updates: Partial<UserData>)`: Atualiza campos específicos do usuário

## Integração com AuthContext

O `AuthContext` automaticamente chama `createOrUpdateUser` quando um usuário faz login, garantindo que todos os usuários autenticados tenham seus dados persistidos no Firestore.

## Compatibilidade iOS e Web

Este sistema funciona tanto no iOS (via Capacitor) quanto no Web, pois utiliza o mesmo código React/TypeScript compartilhado.
