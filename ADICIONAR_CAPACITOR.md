# Adicionando Capacitor ao Projeto iOS Existente

O erro "No such module 'Capacitor'" ocorre porque o projeto iOS precisa ter o Capacitor adicionado como dependência Swift Package Manager.

## ✅ Solução Aplicada

Já adicionei o Capacitor como dependência no `project.pbxproj`. Agora você precisa:

### 1. Abrir o projeto no Xcode
```bash
open CartaoFidelidade.xcodeproj
```

### 2. Resolver as dependências do Swift Package Manager

No Xcode:
1. Vá em **File > Packages > Resolve Package Versions**
2. Ou **File > Packages > Update to Latest Package Versions**

Isso fará o Xcode baixar e integrar o Capacitor.

### 3. Verificar se funcionou

Após resolver os pacotes, tente compilar novamente:
- **Product > Build** (Cmd+B)

## 🔄 Alternativa: Usar o Projeto Gerado pelo Capacitor

Se preferir, você pode usar o projeto iOS já configurado pelo Capacitor:

```bash
cd web
npm run build:ios
npm run open:ios
```

Este projeto (`web/ios/App/App.xcodeproj`) já tem tudo configurado e pronto para uso.

## 📝 Nota

O projeto existente (`CartaoFidelidade.xcodeproj`) agora tem o Capacitor como dependência. Após resolver os pacotes no Xcode, o erro deve desaparecer.
