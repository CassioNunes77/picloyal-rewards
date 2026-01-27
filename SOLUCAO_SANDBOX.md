# Solução para Erro de Sandbox Extension

## Problema

O erro "Could not create a sandbox extension" ocorre porque o projeto tinha configurações do macOS (App Sandbox e Hardened Runtime) que não são apropriadas para iOS.

## ✅ Correções Aplicadas

1. **Removido App Sandbox** dos entitlements (era para macOS)
2. **Removido Hardened Runtime** das configurações de build (era para macOS)
3. **Limpo DerivedData** para garantir build limpo

## 🔧 Próximos Passos

### 1. Limpar Build no Xcode
- **Product > Clean Build Folder** (Shift+Cmd+K)

### 2. Fechar e Reabrir o Xcode
- Isso garante que todas as configurações sejam recarregadas

### 3. Compilar Novamente
- **Product > Build** (Cmd+B)
- **Product > Run** (Cmd+R)

## ⚠️ Se o Erro Persistir

Se ainda houver problemas, tente:

1. **Remover completamente os entitlements** (se não forem necessários):
   - No Xcode, vá em **Target > Signing & Capabilities**
   - Remova a referência aos entitlements se não precisar de capabilities especiais

2. **Verificar se há outros problemas**:
   - Certifique-se de que está compilando para iOS, não macOS
   - Verifique o deployment target (deve ser iOS, não macOS)

3. **Usar o projeto gerado pelo Capacitor** (recomendado):
   ```bash
   cd web
   npm run build:ios
   npm run open:ios
   ```

## 📝 Nota

O projeto gerado pelo Capacitor (`web/ios/App/App.xcodeproj`) já está configurado corretamente e não tem esses problemas. É a opção mais confiável.
