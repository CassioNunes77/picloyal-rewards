# 🔄 Como Reinstalar o Xcode

## ⚠️ ANTES DE REINSTALAR - Tente isso primeiro:

### Solução Rápida (5 minutos):

1. **App Store** > Procure "Xcode"
2. Se aparecer botão **"Atualizar"**, clique (pode ter uma atualização que resolve)
3. Se não tiver atualização, continue com a reinstalação abaixo

## 🔄 REINSTALAÇÃO COMPLETA

### Opção 1: Via App Store (Mais Fácil)

1. **Feche o Xcode completamente** (`Cmd + Q`)
2. Abra a **App Store**
3. Procure por **"Xcode"**
4. Se já estiver instalado, você verá um botão **"Abrir"** ou **"Atualizar"**
5. Para reinstalar:
   - Clique com botão direito no Xcode na App Store
   - Selecione **"Remover App"** (isso só remove do Launchpad, não desinstala completamente)
   - OU vá em **Aplicativos** > Arraste o Xcode para a Lixeira
   - Depois baixe novamente da App Store

### Opção 2: Desinstalação Manual Completa (Mais Limpa)

Execute no Terminal:

```bash
# 1. Fechar Xcode
killall -9 com.apple.dt.Xcode

# 2. Remover Xcode completamente
sudo rm -rf /Applications/Xcode.app

# 3. Remover Command Line Tools
sudo rm -rf /Library/Developer/CommandLineTools

# 4. Remover dados do usuário
rm -rf ~/Library/Developer/Xcode
rm -rf ~/Library/Preferences/com.apple.dt.Xcode.plist*
rm -rf ~/Library/Caches/com.apple.dt.Xcode

# 5. Reinstalar Command Line Tools
xcode-select --install

# 6. Baixar Xcode novamente da App Store
open "macappstore://apps.apple.com/app/xcode/id497799835"
```

### Opção 3: Reinstalar Command Line Tools (Mais Rápido)

Se o problema for só com Command Line Tools:

```bash
# Remover
sudo rm -rf /Library/Developer/CommandLineTools

# Reinstalar
xcode-select --install
```

## ⏱️ TEMPO ESTIMADO

- **App Store**: 30-60 minutos (depende da velocidade da internet)
- **Desinstalação Manual**: 10 minutos + download
- **Command Line Tools**: 5-10 minutos

## ✅ APÓS REINSTALAR

1. Abra o Xcode
2. Aceite os termos de licença
3. Instale componentes adicionais se solicitado
4. Conecte seu iPhone
5. Vá em **Window** > **Devices and Simulators**
6. Selecione seu iPhone
7. O Xcode deve baixar o DeviceSupport automaticamente

## 💡 DICA

Se você tem **Time Machine** ou backup, pode restaurar apenas a pasta:
```
/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/DeviceSupport/
```

Isso pode ser mais rápido que reinstalar tudo.

## 🚨 ALTERNATIVA MAIS RÁPIDA

Antes de reinstalar, tente:

```bash
# Limpar e forçar download do DeviceSupport
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport/*
killall -9 com.apple.dt.Xcode
open -a Xcode
```

Depois vá em **Window** > **Devices and Simulators** e selecione seu iPhone. O Xcode pode baixar o DeviceSupport automaticamente.

---

**Recomendação:** Tente a alternativa rápida primeiro. Se não funcionar em 10 minutos, aí sim reinstale o Xcode.
