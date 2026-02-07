# Solução Simples - WKWebView Puro (Sem Capacitor)

## ✅ Nova Abordagem

Criei uma solução **muito mais simples** que:
- ✅ **Não usa Capacitor** - elimina problemas de dependências
- ✅ **Não precisa de entitlements** - configuração mínima
- ✅ **Apenas WKWebView nativo** - sem complexidades
- ✅ **Carrega os arquivos web compilados** diretamente

## 🔧 O que foi feito

1. **Criado `SimpleWebView.swift`** - WKWebView puro em SwiftUI
2. **Atualizado `ContentView.swift`** - para usar a nova view
3. **Removido AppDelegate** - não é mais necessário
4. **Sem dependências externas** - apenas frameworks nativos do iOS

## 📦 Como copiar os arquivos web

### Opção 1: Script Automático

```bash
cd web
npm run build
./copiar_web_para_ios.sh
```

### Opção 2: Manual

1. Compile o web:
   ```bash
   cd web
   npm run build
   ```

2. Copie os arquivos:
   ```bash
   # Crie a pasta public no projeto iOS
   mkdir -p "CartaoFidelidade/public"
   
   # Copie os arquivos compilados
   cp -r web/dist/* "CartaoFidelidade/public/"
   ```

3. No Xcode:
   - Arraste a pasta `public` para o projeto
   - Certifique-se de que está marcada como "Create folder references" (não "Create groups")
   - Marque "Add to targets: CartaoFidelidade"

## 🚀 Como usar

1. **Compile o web:**
   ```bash
   cd web
   npm run build
   ```

2. **Copie os arquivos** (veja acima)

3. **Abra no Xcode:**
   ```bash
   open CartaoFidelidade.xcodeproj
   ```

4. **Compile e execute:**
   - Product > Build (Cmd+B)
   - Product > Run (Cmd+R)

## 🎯 Vantagens

1. **Zero dependências externas** - apenas frameworks nativos
2. **Sem problemas de sandbox** - configuração mínima
3. **Compatível com qualquer versão do Xcode** - usa apenas APIs nativas
4. **Fácil de manter** - código simples e direto

## 📝 Nota

Esta solução:
- ✅ Carrega os arquivos web do bundle do app
- ✅ Funciona offline (arquivos locais)
- ✅ Mantém toda a lógica web intacta
- ✅ Sincronização: apenas copiar arquivos após build

## 🔄 Workflow

1. **Desenvolver:** `cd web && npm run dev`
2. **Build:** `cd web && npm run build`
3. **Copiar:** Copiar `web/dist/*` para `CartaoFidelidade/public/`
4. **Executar:** Abrir no Xcode e rodar
