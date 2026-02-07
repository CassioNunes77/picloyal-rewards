# Integração iOS com Capacitor

Este projeto usa Capacitor para integrar o app web React + Vite com iOS, garantindo que toda a lógica seja compartilhada entre web e iOS.

## Estrutura

- **web/**: Projeto React + Vite (PWA)
- **web/ios/**: Projeto iOS gerado pelo Capacitor (usar este projeto)
- **CartaoFidelidade/**: Projeto iOS original (pode ser usado como referência)

## Como funciona

1. O código web é desenvolvido em `web/src/`
2. Quando você faz `npm run build:ios`, o Vite compila o código e o Capacitor sincroniza com o projeto iOS
3. O app iOS carrega o código web compilado através de um WKWebView gerenciado pelo Capacitor
4. Qualquer alteração na lógica web é automaticamente refletida no app iOS após rebuild

## Workflow de Desenvolvimento

### Desenvolvimento Web
```bash
cd web
npm run dev
```

### Build e Sincronização com iOS
```bash
cd web
npm run build:ios
```

Este comando:
1. Compila o projeto web (`vite build`)
2. Sincroniza os arquivos com o projeto iOS (`npx cap sync ios`)

### Abrir no Xcode
```bash
cd web
npm run open:ios
```

Ou abra manualmente: `web/ios/App/App.xcodeproj`

## Configuração do Projeto iOS

O projeto iOS gerado pelo Capacitor já está configurado com:
- ✅ Capacitor integrado
- ✅ WKWebView configurado
- ✅ App Transport Security configurado
- ✅ Suporte a Universal Links
- ✅ Integração com SwiftUI (via CapacitorBridgeView)

## Diretrizes da Apple

O projeto segue as diretrizes da Apple:
- ✅ App Transport Security habilitado
- ✅ Privacy permissions configuradas
- ✅ Suporte a orientações portrait e landscape
- ✅ Status bar configurada corretamente
- ✅ Launch screen configurada

## Adicionando Plugins do Capacitor

Se precisar de funcionalidades nativas (câmera, geolocalização, etc.):

```bash
cd web
npm install @capacitor/camera  # exemplo
npx cap sync ios
```

## Troubleshooting

### O app não carrega o conteúdo web
1. Certifique-se de que fez `npm run build:ios`
2. Verifique se a pasta `web/ios/App/App/public` contém os arquivos compilados

### Erros de build no Xcode
1. Limpe o build: Product > Clean Build Folder (Shift+Cmd+K)
2. Rebuild: Product > Build (Cmd+B)

### Atualizar dependências do Capacitor
```bash
cd web
npm update @capacitor/core @capacitor/cli @capacitor/ios
npx cap sync ios
```
