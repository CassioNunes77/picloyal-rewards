# Estrutura de Categorias no Firebase

Este documento explica onde e como as informações de categorias de produtos são armazenadas no Firebase Firestore.

## 📍 Localização no Firebase

As categorias são armazenadas na **coleção `categories`** no Firestore.

### Estrutura da Coleção

```
Firestore
└── categories (coleção)
    ├── {categoryId1} (documento)
    │   ├── name: string
    │   ├── icon: string (nome do ícone da Lucide React)
    │   ├── active: boolean
    │   ├── productsCount: number
    │   ├── createdAt: Timestamp
    │   └── updatedAt: Timestamp
    ├── {categoryId2} (documento)
    └── ...
```

## 📋 Estrutura do Documento

Cada documento na coleção `categories` possui os seguintes campos:

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `name` | string | Nome da categoria | "Bebidas" |
| `icon` | string | Nome do ícone da Lucide React | "Coffee" |
| `active` | boolean | Se a categoria está ativa e disponível | `true` |
| `productsCount` | number | Quantidade de produtos na categoria (será calculado dinamicamente) | `0` |
| `createdAt` | Timestamp | Data de criação do registro | `2026-02-08T10:30:00Z` |
| `updatedAt` | Timestamp | Data da última atualização | `2026-02-08T10:30:00Z` |

## 🎨 Ícones Disponíveis

Os ícones são da biblioteca **Lucide React** e estão organizados por categoria:

### Compras
- ShoppingCart (Carrinho)
- ShoppingBag (Sacola)
- Store (Loja)
- Package (Pacote)

### Comida
- Pizza (Pizza)
- Coffee (Café)
- Utensils (Talheres)
- Apple (Maçã)

### Saúde
- Heart (Coração)
- Activity (Atividade)
- Pill (Remédio)
- Stethoscope (Estetoscópio)

### Serviço
- Wrench (Chave)
- Settings (Configurações)
- Briefcase (Maleta)
- Grid (Serviços)

### Geral
- Tag (Tag)
- Package (Pacote)
- Award (Geral)

### Brindes
- Gift (Presente)
- Sparkles (Brilho)
- Award (Prêmio)

## 🔐 Regras de Segurança (Firestore Security Rules)

**IMPORTANTE**: Configure as regras de segurança no Firebase Console para proteger esta coleção.

### Regras Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Categorias - Apenas leitura pública, escrita apenas para admins autenticados
    match /categories/{categoryId} {
      // Qualquer usuário pode ler categorias ativas
      allow read: if request.resource.data.active == true || 
                     request.auth != null;
      
      // Apenas admins podem criar, atualizar ou deletar
      allow create, update, delete: if request.auth != null && 
                                       // Adicione aqui a verificação de admin
                                       // Por exemplo: get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
                                       false; // Por enquanto, desabilitado até implementar verificação de admin
    }
  }
}
```

**Nota**: Por enquanto, as operações de escrita devem ser feitas apenas através do painel administrativo que já possui autenticação própria.

## 🎯 Uso no App

### Para Usuários Finais

As categorias ativas (`active: true`) serão usadas para:
- **Filtro de busca**: Usuários poderão filtrar produtos e ofertas por categoria
- **Organização**: Produtos serão organizados por categoria nas lojas

### Para Administradores

Através do painel administrativo (`/sys-admin-panel-7x9k/categories`):
- ✅ Visualizar todas as categorias cadastradas
- ✅ Adicionar novas categorias (com seletor visual de ícones Lucide React)
- ✅ Ativar/desativar categorias
- ✅ Excluir categorias
- ✅ Ver quantidade de produtos por categoria (quando implementado)

## 🔄 Sincronização em Tempo Real

A página administrativa usa `onSnapshot` do Firestore para atualizar automaticamente a lista de categorias quando há mudanças, sem necessidade de recarregar a página.

## 📊 Exemplo de Documento

```json
{
  "name": "Bebidas",
  "icon": "Coffee",
  "active": true,
  "productsCount": 0,
  "createdAt": "2026-02-08T10:30:00Z",
  "updatedAt": "2026-02-08T10:30:00Z"
}
```

## 🚀 Próximos Passos

1. **Implementar contagem de produtos**: Criar uma função que conta automaticamente quantos produtos existem em cada categoria
2. **Filtro por categoria**: Implementar filtro nas telas de produtos e ofertas
3. **Seleção de categoria no cadastro**: Permitir que lojistas selecionem a categoria ao cadastrar produtos
4. **Regras de segurança**: Implementar verificação de admin no Firestore Security Rules

## 📝 Notas Técnicas

- A coleção `categories` é uma configuração de DEV/administrador para o app
- As categorias são criadas manualmente pelos administradores através do painel
- Os ícones são armazenados como strings (nome do componente da Lucide React)
- O campo `productsCount` será atualizado dinamicamente no futuro quando houver integração com produtos
