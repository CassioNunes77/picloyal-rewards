# Estrutura de Regiões no Firebase

Este documento explica onde e como as informações de regiões disponíveis para o app são armazenadas no Firebase Firestore.

## 📍 Localização no Firebase

As regiões são armazenadas na **coleção `regions`** no Firestore.

### Estrutura da Coleção

```
Firestore
└── regions (coleção)
    ├── {regionId1} (documento)
    │   ├── name: string
    │   ├── state: string (código UF, ex: "SP")
    │   ├── stateName: string (nome completo, ex: "São Paulo")
    │   ├── city: string
    │   ├── cityId: string (ID do IBGE)
    │   ├── country: string (sempre "Brasil")
    │   ├── active: boolean
    │   ├── storesCount: number
    │   ├── createdAt: Timestamp
    │   └── updatedAt: Timestamp
    ├── {regionId2} (documento)
    └── ...
```

## 📋 Estrutura do Documento

Cada documento na coleção `regions` possui os seguintes campos:

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `name` | string | Nome da região (geralmente "Cidade - Estado") | "São Paulo - São Paulo" |
| `state` | string | Código UF do estado (2 letras) | "SP" |
| `stateName` | string | Nome completo do estado | "São Paulo" |
| `city` | string | Nome da cidade | "São Paulo" |
| `cityId` | string | ID do IBGE da cidade | "3550308" |
| `country` | string | País (sempre "Brasil" por enquanto) | "Brasil" |
| `active` | boolean | Se a região está ativa e disponível | `true` |
| `storesCount` | number | Quantidade de lojas na região (será calculado dinamicamente) | `0` |
| `createdAt` | Timestamp | Data de criação do registro | `2026-01-27T10:30:00Z` |
| `updatedAt` | Timestamp | Data da última atualização | `2026-01-27T10:30:00Z` |

## 🔐 Regras de Segurança (Firestore Security Rules)

**IMPORTANTE**: Configure as regras de segurança no Firebase Console para proteger esta coleção.

### Regras Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regiões - Apenas leitura pública, escrita apenas para admins autenticados
    match /regions/{regionId} {
      // Qualquer usuário pode ler regiões ativas
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

As regiões ativas (`active: true`) serão usadas para:
- **Filtro de busca**: Usuários poderão filtrar lojas e ofertas por região
- **Cadastro de lojas**: Lojistas poderão selecionar a região ao cadastrar sua loja

### Para Administradores

Através do painel administrativo (`/sys-admin-panel-7x9k/locations`):
- ✅ Visualizar todas as regiões cadastradas
- ✅ Adicionar novas regiões (com autocomplete usando API do IBGE)
- ✅ Ativar/desativar regiões
- ✅ Excluir regiões
- ✅ Ver quantidade de lojas por região (quando implementado)

## 🔄 Sincronização em Tempo Real

A página administrativa usa `onSnapshot` do Firestore para atualizar automaticamente a lista de regiões quando há mudanças, sem necessidade de recarregar a página.

## 📊 Exemplo de Documento

```json
{
  "name": "São Paulo - São Paulo",
  "state": "SP",
  "stateName": "São Paulo",
  "city": "São Paulo",
  "cityId": "3550308",
  "country": "Brasil",
  "active": true,
  "storesCount": 0,
  "createdAt": "2026-01-27T10:30:00Z",
  "updatedAt": "2026-01-27T10:30:00Z"
}
```

## 🚀 Próximos Passos

1. **Implementar contagem de lojas**: Criar uma função que conta automaticamente quantas lojas existem em cada região
2. **Filtro por região**: Implementar filtro nas telas de lojas e ofertas
3. **Seleção de região no cadastro**: Permitir que lojistas selecionem a região ao cadastrar sua loja
4. **Regras de segurança**: Implementar verificação de admin no Firestore Security Rules

## 📝 Notas Técnicas

- A coleção `regions` é uma configuração de DEV/administrador para o app
- As regiões são criadas manualmente pelos administradores através do painel
- O país está fixo como "Brasil" por enquanto, mas a estrutura permite expansão futura
- Os IDs das cidades são do IBGE, permitindo integração futura com outras APIs governamentais
