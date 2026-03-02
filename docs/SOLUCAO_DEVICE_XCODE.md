# Solução: iPhone não aparece no Xcode

## ✅ Status Atual
Seu iPhone **está sendo detectado** pelo sistema:
- **Nome**: Cássio
- **Modelo**: iPhone 13
- **Estado**: Connected (conectado)
- **Serial**: 00008110-0011449E1E3A401E

## 🔧 Passos para Resolver

### 1. Verificar Confiança do Dispositivo

**No iPhone:**
1. Desbloqueie o iPhone
2. Quando aparecer a mensagem "Confiar neste computador?", toque em **"Confiar"**
3. Digite o código de desbloqueio se solicitado

**Se não aparecer a mensagem:**
- Desconecte e reconecte o cabo USB
- Tente uma porta USB diferente
- Use um cabo USB original da Apple (evite cabos de terceiros)

### 2. Ativar Developer Mode (iOS 16+)

**No iPhone:**
1. Vá em **Configurações** > **Privacidade e Segurança**
2. Role até o final e procure por **"Modo de Desenvolvedor"** ou **"Developer Mode"**
3. Ative o toggle
4. Reinicie o iPhone quando solicitado
5. Após reiniciar, confirme a ativação quando aparecer o aviso

**Nota**: Se não aparecer a opção "Modo de Desenvolvedor", você precisa conectar o dispositivo ao Xcode primeiro (pode aparecer depois).

### 3. Abrir Devices and Simulators no Xcode

1. No Xcode, vá em **Window** > **Devices and Simulators** (ou pressione `Cmd + Shift + 2`)
2. Na aba **"Devices"**, você deve ver seu iPhone listado
3. Se aparecer, selecione-o e verifique se está como **"Connected"**

### 4. Verificar Permissões do Xcode

1. Vá em **Configurações do Sistema** (macOS) > **Privacidade e Segurança**
2. Role até **"Acessibilidade"** ou **"Full Disk Access"**
3. Certifique-se de que o **Xcode** está listado e ativado
4. Se não estiver, adicione o Xcode manualmente

### 5. Limpar Cache do Xcode

Execute no Terminal:

```bash
# Limpar DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Limpar cache de dispositivos
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport/*

# Reiniciar serviços do Xcode
killall -9 com.apple.CoreSimulator.CoreSimulatorService
killall -9 com.apple.dt.Xcode
```

Depois, **reinicie o Xcode**.

### 6. Verificar Provisioning Profile

1. No Xcode, vá em **Xcode** > **Settings** (ou `Cmd + ,`)
2. Vá na aba **"Accounts"**
3. Selecione sua conta Apple Developer
4. Clique em **"Download Manual Profiles"**
5. Aguarde o download concluir

### 7. Verificar Deployment Target

1. No projeto Xcode, selecione o target **CartaoFidelidade**
2. Vá em **"General"** ou **"Build Settings"**
3. Verifique se **"iOS Deployment Target"** está compatível com seu iPhone
4. Seu iPhone está rodando iOS 26.2.1, então o deployment target deve ser ≤ 26.0

### 8. Tentar Build Diretamente

1. No Xcode, vá em **Product** > **Destination**
2. Procure por **"Cássio"** ou **"iPhone 13"**
3. Se aparecer, selecione e tente fazer build

### 9. Verificar Certificados

Execute no Terminal:

```bash
# Listar certificados instalados
security find-identity -v -p codesigning
```

Se não houver certificados válidos, você precisará:
1. Ir em **Xcode** > **Settings** > **Accounts**
2. Selecionar sua conta
3. Clicar em **"Manage Certificates"**
4. Adicionar um certificado de desenvolvimento

### 10. Solução Alternativa: Usar via Wi-Fi

Se o cabo USB não funcionar:

1. Conecte o iPhone via USB primeiro
2. No Xcode, vá em **Window** > **Devices and Simulators**
3. Selecione seu iPhone
4. Marque **"Connect via network"**
5. Depois pode desconectar o cabo e usar Wi-Fi

## 🚨 Se Nada Funcionar

### Verificar Logs do Xcode

1. Abra o **Console.app** (Aplicativos > Utilitários)
2. Filtre por "Xcode" ou "device"
3. Veja se há erros relacionados ao dispositivo

### Comandos Úteis para Diagnóstico

```bash
# Ver dispositivos conectados
xcrun devicectl list devices

# Ver informações detalhadas do dispositivo
xcrun devicectl device info -d 34B818F9-1F09-4246-88D4-C1150BFB2FD7

# Verificar se o dispositivo está confiável
idevice_id -l

# Instalar libimobiledevice se necessário
brew install libimobiledevice
```

### Último Recurso

1. **Desconecte** o iPhone completamente
2. **Reinicie** o Mac
3. **Reinicie** o iPhone
4. **Conecte** novamente
5. **Confie** no computador quando solicitado
6. **Abra** o Xcode novamente

## 📝 Checklist Rápido

- [ ] iPhone desbloqueado e confiando no computador
- [ ] Developer Mode ativado no iPhone
- [ ] Xcode atualizado para versão mais recente
- [ ] Cabo USB original da Apple
- [ ] Porta USB funcionando (testar outra porta)
- [ ] Devices and Simulators aberto (`Cmd + Shift + 2`)
- [ ] Provisioning profiles atualizados
- [ ] Xcode reiniciado após mudanças

## 💡 Dica Extra

Se você está usando **Xcode 16.0 beta**, pode haver bugs conhecidos. Tente:
- Usar uma versão estável do Xcode (15.x)
- Ou atualizar para a versão mais recente do beta

---

**Status do seu dispositivo:**
- ✅ Detectado pelo sistema
- ✅ Conectado via USB
- ⚠️ Não aparece no Xcode (precisa seguir os passos acima)
