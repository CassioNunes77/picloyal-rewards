# Solução: Dispositivo aparece mas não aparece em Build

## 🔍 Problema Identificado

Seu iPhone "Cássio" está aparecendo na janela **Devices and Simulators**, mas **NÃO aparece** no dropdown de **Run Destination** do Xcode.

**Status atual:**
- ✅ Dispositivo detectado: Cássio (iPhone 13)
- ⚠️ Status: **"Connecting"** (não está totalmente conectado)
- ❌ Não aparece como opção de build

## 🔧 Solução Passo a Passo

### Passo 1: Confiar no Computador (CRÍTICO)

**No iPhone:**
1. **Desbloqueie** o iPhone completamente
2. Se aparecer a mensagem **"Confiar neste computador?"**, toque em **"Confiar"**
3. Digite o **código de desbloqueio** se solicitado
4. Aguarde alguns segundos

**Se não aparecer a mensagem:**
- Desconecte o cabo USB completamente
- Aguarde 5 segundos
- Reconecte o cabo
- Desbloqueie o iPhone novamente
- A mensagem deve aparecer

### Passo 2: Ativar Developer Mode (OBRIGATÓRIO para iOS 16+)

**No iPhone:**
1. Vá em **Configurações** > **Privacidade e Segurança**
2. Role até o final e procure por **"Modo de Desenvolvedor"** ou **"Developer Mode"**
3. **Ative o toggle**
4. O iPhone vai pedir para **reiniciar** - confirme
5. Após reiniciar, quando aparecer o aviso de Developer Mode, confirme novamente

**Importante:** Se não aparecer a opção "Modo de Desenvolvedor":
- Conecte o iPhone ao Mac
- Abra o Xcode
- Tente fazer build uma vez (mesmo que falhe)
- A opção deve aparecer depois

### Passo 3: Verificar Trust no Mac

Execute no Terminal:

```bash
# Verificar se o dispositivo está confiável
idevice_id -l
```

Se não aparecer nada ou der erro, instale:

```bash
brew install libimobiledevice
```

### Passo 4: Reiniciar Serviços do Xcode

Execute no Terminal:

```bash
# Matar processos do Xcode
killall -9 com.apple.dt.Xcode
killall -9 com.apple.CoreSimulator.CoreSimulatorService
killall -9 com.apple.AMPDeviceDiscoveryAgent

# Limpar cache
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

**Depois:**
1. Feche completamente o Xcode (Cmd + Q)
2. Aguarde 10 segundos
3. Abra o Xcode novamente
4. Conecte o iPhone novamente

### Passo 5: Verificar Signing no Xcode

1. No Xcode, selecione o projeto **CartaoFidelidade** no navegador
2. Selecione o **target** "CartaoFidelidade"
3. Vá na aba **"Signing & Capabilities"**
4. Verifique:
   - ✅ **"Automatically manage signing"** está marcado
   - ✅ **Team** está selecionado (sua conta Apple Developer)
   - ✅ **Bundle Identifier** está correto: `corevo.CartaoFidelidade`

**Se houver erro de signing:**
- Clique em **"Try Again"** ou **"Download Manual Profiles"**
- Vá em **Xcode** > **Settings** > **Accounts**
- Selecione sua conta
- Clique em **"Download Manual Profiles"**

### Passo 6: Verificar Deployment Target

1. No Xcode, selecione o target **CartaoFidelidade**
2. Vá em **"General"** ou **"Build Settings"**
3. Verifique **"iOS Deployment Target"**
4. Seu iPhone está rodando **iOS 26.2.1**, então o deployment target deve ser **≤ 26.0**

**Se estiver maior que 26.0:**
- Altere para **26.0** ou menor
- Faça Clean Build Folder (Shift + Cmd + K)

### Passo 7: Forçar Reconhecimento do Dispositivo

1. No Xcode, vá em **Window** > **Devices and Simulators** (Cmd + Shift + 2)
2. Selecione seu iPhone "Cássio"
3. Clique com botão direito no dispositivo
4. Selecione **"Unpair Device"** (se disponível)
5. Desconecte o cabo
6. Reconecte o cabo
7. Confie no computador novamente
8. Aguarde aparecer como "Connected" (não "Connecting")

### Passo 8: Verificar se Aparece no Dropdown

1. No Xcode, clique no dropdown de **Run Destination** (ao lado do botão Play)
2. Você deve ver:
   - **Cássio** ou **iPhone 13** listado
   - Não apenas "My Mac"

**Se ainda não aparecer:**
- Feche o Xcode completamente
- Desconecte e reconecte o iPhone
- Abra o Xcode novamente
- Aguarde alguns segundos para o Xcode detectar

### Passo 9: Solução Alternativa - Build Manual

Se ainda não aparecer, tente fazer build manualmente:

1. No Terminal, navegue até a pasta do projeto:
```bash
cd "/Users/Cassio/Documents/Xcode Projects/CartaoFidelidade"
```

2. Execute o build direto para o dispositivo:
```bash
xcodebuild -project CartaoFidelidade.xcodeproj \
  -scheme CartaoFidelidade \
  -destination 'platform=iOS,id=00008110-0011449E1E3A401E' \
  clean build
```

Isso pode forçar o Xcode a reconhecer o dispositivo.

## ✅ Checklist Final

Antes de tentar novamente, verifique:

- [ ] iPhone está **desbloqueado**
- [ ] Mensagem **"Confiar neste computador"** foi aceita
- [ ] **Developer Mode** está ativado no iPhone
- [ ] iPhone aparece como **"Connected"** (não "Connecting") em Devices and Simulators
- [ ] **Signing** está configurado corretamente no Xcode
- [ ] **Deployment Target** é compatível (≤ 26.0)
- [ ] Xcode foi **reiniciado** após todas as mudanças
- [ ] Cabo USB é **original da Apple** (ou de marca confiável)

## 🚨 Se Nada Funcionar

### Último Recurso - Reset Completo

1. **No Mac:**
```bash
# Limpar TUDO relacionado ao Xcode
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport/*
rm -rf ~/Library/Developer/Xcode/Archives/*
rm -rf ~/Library/Caches/com.apple.dt.Xcode/*
killall -9 com.apple.dt.Xcode
```

2. **No iPhone:**
- Vá em **Configurações** > **Geral** > **Transferir ou Redefinir iPhone**
- Toque em **"Redefinir"** > **"Redefinir Localização e Privacidade"**
- Isso vai resetar as configurações de confiança

3. **Reconectar:**
- Desconecte o cabo
- Reinicie o Mac
- Reinicie o iPhone
- Conecte novamente
- Confie no computador
- Ative Developer Mode novamente

## 📝 Comandos Úteis para Diagnóstico

```bash
# Ver dispositivos conectados
xcrun devicectl list devices

# Ver status detalhado
xcrun xctrace list devices

# Verificar certificados
security find-identity -v -p codesigning

# Verificar se dispositivo está confiável
idevice_id -l
```

---

**Status Atual do Seu Dispositivo:**
- Nome: Cássio
- Modelo: iPhone 13
- iOS: 26.2.1
- Status: **Connecting** ⚠️ (precisa mudar para "Connected")
- Serial: 00008110-0011449E1E3A401E

**O problema principal é que o dispositivo está em estado "Connecting" ao invés de "Connected". Siga os passos acima para resolver.**
