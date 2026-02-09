# App iOS - Core+

Este app iOS é gerado e gerenciado pelo Capacitor, garantindo que toda a lógica seja compartilhada com o site web React + Vite.

## 🚀 Início Rápido

### 1. Build e Sincronização
```bash
cd web
npm run build:ios
```

Este comando:
- Compila o projeto web (`vite build`)
- Sincroniza os arquivos com o projeto iOS (`npx cap sync ios`)

### 2. Abrir no Xcode
```bash
cd web
npm run open:ios
```

Ou abra manualmente: `web/ios/App/App.xcodeproj`

### 3. Executar no Simulador/Dispositivo
- Selecione um simulador ou dispositivo no Xcode
- Pressione `Cmd + R` para executar

## 📁 Estrutura do Projeto iOS

```
web/ios/App/App/
├── AppDelegate.swift          # Delegate principal do app
├── Info.plist                 # Configurações do app (ATS, permissões, etc.)
├── CapacitorBridgeView.swift  # Bridge SwiftUI (opcional)
├── ContentView.swift          # View principal SwiftUI (opcional)
├── public/                    # Arquivos web compilados (gerado automaticamente)
└── Base.lproj/
    ├── Main.storyboard        # Storyboard principal (usa CAPBridgeViewController)
    └── LaunchScreen.storyboard # Tela de splash
```

## 🔄 Workflow de Desenvolvimento

### Desenvolvimento Web
1. Edite os arquivos em `web/src/`
2. Teste no navegador: `npm run dev`

### Atualizar App iOS
1. Compile e sincronize: `npm run build:ios`
2. Abra no Xcode: `npm run open:ios`
3. Execute no simulador/dispositivo

**Importante**: Sempre execute `npm run build:ios` após alterar o código web para que as mudanças apareçam no app iOS.

## ⚙️ Configurações

### App Transport Security
O `Info.plist` já está configurado com:
- ✅ ATS habilitado (apenas conexões HTTPS)
- ✅ Permissões para câmera, fotos e localização (quando necessário)

### Bundle Identifier
- **Atual**: `corevo.CorePlus`
- Configurado em `capacitor.config.ts` e no projeto Xcode

### Orientação
- ✅ Portrait (principal)
- ✅ Landscape Left/Right (suportado)

## 🔌 Plugins do Capacitor

Para adicionar funcionalidades nativas:

```bash
cd web
npm install @capacitor/camera  # exemplo: câmera
npx cap sync ios
```

Plugins úteis:
- `@capacitor/camera` - Acesso à câmera
- `@capacitor/geolocation` - Localização
- `@capacitor/status-bar` - Controle da status bar
- `@capacitor/splash-screen` - Tela de splash
- `@capacitor/keyboard` - Controle do teclado

## 🐛 Troubleshooting

### App não carrega conteúdo
1. Verifique se executou `npm run build:ios`
2. Confirme que `web/ios/App/App/public/index.html` existe
3. Limpe o build no Xcode: Product > Clean Build Folder

### Erros de build no Xcode
1. Limpe o build: Shift+Cmd+K
2. Feche e reabra o Xcode
3. Execute `npx cap sync ios` novamente

### Atualizar Capacitor
```bash
cd web
npm update @capacitor/core @capacitor/cli @capacitor/ios
npx cap sync ios
```

## 📱 Diretrizes da Apple

O projeto segue as diretrizes da Apple:
- ✅ App Transport Security configurado
- ✅ Privacy permissions documentadas
- ✅ Launch screen configurada
- ✅ Status bar configurada
- ✅ Orientação suportada

## 🔗 Links Úteis

- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
