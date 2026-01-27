# Como Copiar Arquivos Web para o Projeto iOS

## ⚠️ IMPORTANTE: Este passo é essencial!

O app precisa dos arquivos web compilados no bundle para funcionar.

## 📋 Passo a Passo

### 1. Compilar o Web

```bash
cd web
npm run build
```

### 2. Copiar Arquivos

**Opção A: Script Automático**
```bash
cd web
./copiar_web_para_ios.sh
```

**Opção B: Manual**
```bash
# Na raiz do projeto
mkdir -p CartaoFidelidade/public
cp -r web/dist/* CartaoFidelidade/public/
```

### 3. Adicionar ao Xcode (CRÍTICO!)

1. **Abra o projeto no Xcode:**
   ```bash
   open CartaoFidelidade.xcodeproj
   ```

2. **Arraste a pasta `public` para o projeto:**
   - No Finder, vá até `CartaoFidelidade/public`
   - Arraste a pasta para o navegador de projetos no Xcode (lado esquerdo)
   - **IMPORTANTE**: Quando aparecer o diálogo:
     - ✅ Marque "Copy items if needed" (se ainda não copiou)
     - ✅ Selecione **"Create folder references"** (NÃO "Create groups")
     - ✅ Marque "Add to targets: CartaoFidelidade"

3. **Verificar:**
   - A pasta `public` deve aparecer em azul (folder reference)
   - Se aparecer em amarelo (group), está errado - delete e adicione novamente

### 4. Compilar e Executar

- **Product > Clean Build Folder** (Shift+Cmd+K)
- **Product > Build** (Cmd+B)
- **Product > Run** (Cmd+R)

## 🔍 Verificar se Funcionou

Se os arquivos estiverem corretos, você verá no console do Xcode:
```
✅ Carregando de: /path/to/index.html
```

Se não funcionar, você verá uma mensagem de erro na tela do app com instruções.

## 🔄 Workflow Completo

Sempre que alterar o código web:

1. ```bash
   cd web
   npm run build
   ```

2. ```bash
   ./copiar_web_para_ios.sh
   ```

3. No Xcode: **Product > Clean Build Folder** (Shift+Cmd+K)

4. **Product > Run** (Cmd+R)

## ⚠️ Problemas Comuns

### "Arquivo não encontrado"
- Verifique se a pasta `public` está no projeto como "folder reference" (azul)
- Verifique se os arquivos foram copiados: `ls CartaoFidelidade/public/`

### "Erro de sandbox"
- Certifique-se de que não há entitlements com App Sandbox
- Use apenas arquivos locais (não localhost)

### App mostra tela em branco
- Verifique o console do Xcode para mensagens de erro
- Certifique-se de que `index.html` existe em `CartaoFidelidade/public/`
