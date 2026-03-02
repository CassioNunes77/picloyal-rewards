# Debug: Regiões não aparecem no Firebase

## 🔍 Problema Identificado

Os logs mostram que:
- ✅ Firestore está configurado corretamente
- ✅ Query está funcionando
- ✅ Listener está configurado
- ❌ **0 documentos encontrados** na coleção `regions`

## 🔎 Possíveis Causas

### 1. Regras de Segurança do Firestore Bloqueando

**Verificar no Firebase Console:**
1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto
3. Vá em **Firestore Database** > **Rules**
4. Verifique se há regras bloqueando a coleção `regions`

**Regras Recomendadas (temporárias para debug):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORÁRIO: Permitir leitura/escrita para debug
    match /regions/{regionId} {
      allow read, write: if true; // ⚠️ REMOVER EM PRODUÇÃO!
    }
  }
}
```

**Depois de testar, use regras mais seguras:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /regions/{regionId} {
      // Qualquer usuário autenticado pode ler
      allow read: if request.auth != null;
      
      // Apenas admins podem escrever (ajustar conforme sua lógica de admin)
      allow write: if request.auth != null;
    }
  }
}
```

### 2. Erro Silencioso ao Salvar

**Verificar no Console do Navegador:**
Quando você tentar adicionar uma região, procure por:
- `❌ [regionsService] Erro ao adicionar região`
- `❌ [regionsService] Erro DURANTE addDoc`
- Mensagens de erro com código (ex: `permission-denied`, `unavailable`)

### 3. Coleção com Nome Diferente

**Verificar no Firebase Console:**
1. Acesse **Firestore Database** > **Data**
2. Procure pela coleção `regions`
3. Se não existir, crie manualmente um documento de teste
4. Verifique se o nome da coleção está exatamente como `regions` (minúsculas)

### 4. Projeto Firebase Diferente

**Verificar variáveis de ambiente:**
1. Verifique o arquivo `.env` ou `.env.local` na pasta `web/`
2. Confirme que `VITE_FIREBASE_PROJECT_ID` está correto
3. Confirme que todas as variáveis do Firebase estão configuradas

## 🧪 Teste Manual no Firebase Console

1. **Acesse o Firebase Console**
2. **Vá em Firestore Database > Data**
3. **Crie manualmente um documento de teste:**
   - Clique em "Start collection"
   - Collection ID: `regions`
   - Document ID: (deixe gerar automaticamente)
   - Adicione os campos:
     ```
     name: "São Paulo - São Paulo"
     state: "SP"
     stateName: "São Paulo"
     city: "São Paulo"
     cityId: "3550308"
     country: "Brasil"
     active: true
     storesCount: 0
     createdAt: [timestamp atual]
     updatedAt: [timestamp atual]
     ```
4. **Salve o documento**
5. **Recarregue a página administrativa**
6. **Verifique se o documento aparece na lista**

## 🔧 Logs Adicionados para Debug

Adicionei logs detalhados em `regionsService.ts`:
- ✅ Log antes de chamar `addDoc`
- ✅ Log após `addDoc` retornar
- ✅ Verificação se documento foi realmente salvo
- ✅ Logs de erro detalhados

## 📋 Checklist de Verificação

Execute este checklist:

- [ ] Firebase Console > Firestore > Rules: Regras permitem leitura/escrita?
- [ ] Firebase Console > Firestore > Data: Coleção `regions` existe?
- [ ] Console do navegador: Há erros ao tentar salvar?
- [ ] Variáveis de ambiente: `VITE_FIREBASE_PROJECT_ID` está correto?
- [ ] Teste manual: Criar documento manualmente funciona?
- [ ] Console do navegador: Logs mostram `✅ [regionsService] Região salva com sucesso!`?

## 🚨 Próximos Passos

1. **Tente adicionar uma região novamente**
2. **Observe os logs no console do navegador**
3. **Procure por mensagens de erro** (especialmente `permission-denied`)
4. **Se houver erro `permission-denied`**: Ajuste as regras do Firestore
5. **Se não houver erro mas não salvar**: Verifique se o projeto Firebase está correto

## 💡 Dica

Se você criar um documento manualmente no Firebase Console e ele aparecer na lista, significa que:
- ✅ A leitura está funcionando
- ❌ O problema está na escrita (salvamento)

Nesse caso, o problema é provavelmente nas **regras de segurança do Firestore**.
