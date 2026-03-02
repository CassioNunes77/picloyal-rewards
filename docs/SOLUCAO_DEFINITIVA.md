# 🔥 SOLUÇÃO DEFINITIVA: Dispositivo Connected mas não aparece no Build

## ✅ SDK iOS 18.0 ESTÁ INSTALADO

O SDK está OK. O problema é que o Xcode não está listando o dispositivo como destino válido.

## 🎯 SOLUÇÕES (Tente nesta ordem)

### SOLUÇÃO 1: Forçar Reconhecimento no Xcode

1. **Feche o Xcode completamente** (`Cmd + Q`)
2. **Desconecte** o iPhone
3. **Aguarde 5 segundos**
4. **Reconecte** o iPhone
5. **No iPhone:** Desbloqueie e confirme "Confiar" se aparecer
6. **Abra o Xcode**
7. **Aguarde 15 segundos** (deixe o Xcode detectar)
8. Vá em **Window** > **Devices and Simulators** (`Cmd + Shift + 2`)
9. Selecione seu iPhone "Cássio"
10. Clique com botão direito > **"Use for Development"** (se disponível)
11. **Agora** clique no dropdown de Run Destination

### SOLUÇÃO 2: Limpar e Rebuildar Scheme

1. No Xcode, vá em **Product** > **Scheme** > **Manage Schemes...**
2. Selecione **"CartaoFidelidade"**
3. Clique em **"Edit..."**
4. Vá na aba **"Run"**
5. Em **"Build Configuration"**, selecione **"Debug"**
6. Clique em **"Close"**
7. Feche o Xcode
8. Execute:
```bash
cd "/Users/Cassio/Documents/Xcode Projects/CartaoFidelidade"
rm -rf ~/Library/Developer/Xcode/DerivedData/*
xcodebuild -project CartaoFidelidade.xcodeproj -scheme CartaoFidelidade clean
```
9. Abra o Xcode novamente

### SOLUÇÃO 3: Verificar Target Device Family

1. No Xcode, selecione o projeto **CartaoFidelidade**
2. Selecione o **target** "CartaoFidelidade"
3. Vá em **"Build Settings"**
4. Procure por **"Targeted Device Family"**
5. Deve estar como **"iPhone, iPad"** ou **"1,2"**
6. Se estiver diferente, mude para **"1,2"**

### SOLUÇÃO 4: Build Manual via Terminal (Bypass)

Execute:

```bash
cd "/Users/Cassio/Documents/Xcode Projects/CartaoFidelidade"

# Verificar se dispositivo é válido
xcrun devicectl list devices

# Build direto
xcodebuild -project CartaoFidelidade.xcodeproj \
  -scheme CartaoFidelidade \
  -destination 'platform=iOS,id=00008110-0011449E1E3A401E' \
  -configuration Debug \
  clean build
```

Se isso funcionar, o problema é apenas visual no Xcode.

### SOLUÇÃO 5: Resetar Preferências do Xcode

```bash
# Fechar Xcode primeiro!
killall -9 com.apple.dt.Xcode

# Limpar preferências
rm -rf ~/Library/Preferences/com.apple.dt.Xcode.plist
rm -rf ~/Library/Preferences/com.apple.dt.Xcode.plist.lockfile
rm -rf ~/Library/Caches/com.apple.dt.Xcode/*

# Abrir Xcode novamente
open -a Xcode
```

### SOLUÇÃO 6: Verificar Signing

1. No Xcode, selecione o projeto
2. Selecione o target "CartaoFidelidade"
3. Vá em **"Signing & Capabilities"**
4. Verifique:
   - ✅ **"Automatically manage signing"** está marcado
   - ✅ **Team** está selecionado
   - ✅ Não há erros em vermelho
5. Se houver erro, clique em **"Try Again"**

### SOLUÇÃO 7: Usar Product > Destination Manualmente

1. No Xcode, vá em **Product** > **Destination**
2. Você deve ver uma lista de destinos
3. Procure por **"Cássio"** ou **"iPhone 13"**
4. Se aparecer lá, selecione
5. Depois disso, deve aparecer no dropdown também

## 🚨 ÚLTIMO RECURSO: Reinstalar Xcode Command Line Tools

```bash
sudo xcode-select --reset
xcode-select --install
```

Depois reinicie o Mac.

## 📱 VERIFICAÇÃO FINAL

Execute e me mostre o resultado:

```bash
xcrun devicectl list devices
xcodebuild -project CartaoFidelidade.xcodeproj -scheme CartaoFidelidade -showdestinations
```

---

**O problema mais provável é que o Xcode precisa ser "forçado" a reconhecer o dispositivo. Tente a SOLUÇÃO 1 primeiro.**
