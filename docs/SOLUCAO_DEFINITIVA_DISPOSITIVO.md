# Solução DEFINITIVA: iPhone não aparece no Build Destination

## 🔴 PROBLEMA IDENTIFICADO

Seu iPhone **ESTÁ CONECTADO** e detectado pelo sistema, mas:
- ❌ **0 Provisioning Profiles** encontrados
- ✅ Certificados instalados (2 certificados OK)
- ✅ Dispositivo detectado pelo sistema

**O problema principal é a falta de Provisioning Profiles!**

## ✅ SOLUÇÃO IMEDIATA (FAÇA ISSO AGORA)

### Passo 1: NO XCODE (CRÍTICO!)

1. **Abra o Xcode** (se não estiver aberto)

2. **Vá em Xcode > Settings** (ou pressione `Cmd + ,`)

3. **Aba "Accounts"**:
   - Selecione sua conta Apple Developer
   - Clique em **"Download Manual Profiles"** (ou "Manage Certificates" > "Download All")
   - **AGUARDE** o download terminar (pode demorar alguns minutos)

4. **Ainda na aba "Accounts"**:
   - Clique em **"Manage Certificates..."**
   - Verifique se há um certificado "Apple Development" ou "iPhone Developer"
   - Se não houver, clique em **"+"** e adicione **"Apple Development"**

### Passo 2: VERIFICAR SIGNING NO PROJETO

1. **No Xcode**, selecione o projeto **CartaoFidelidade** no navegador (lado esquerdo)

2. **Selecione o target "CartaoFidelidade"**

3. **Vá na aba "Signing & Capabilities"**:

   - ✅ Marque **"Automatically manage signing"**
   - ✅ Selecione seu **Team** (sua conta Apple Developer)
   - ✅ Verifique se o **Bundle Identifier** está correto: `corevo.CartaoFidelidade`

4. **Se aparecer erro de signing**:
   - Clique em **"Try Again"** ou **"Fix Issue"**
   - O Xcode vai criar automaticamente um Provisioning Profile

### Passo 3: FORÇAR RECONHECIMENTO DO DISPOSITIVO

1. **Feche completamente o Xcode** (`Cmd + Q`)

2. **No iPhone**:
   - Desbloqueie o iPhone
   - Desconecte o cabo USB
   - Aguarde 5 segundos
   - Reconecte o cabo USB
   - Quando aparecer **"Confiar neste computador?"**, toque em **CONFIAR**
   - Digite o código de desbloqueio se solicitado

3. **Abra o Xcode novamente**

4. **Vá em Window > Devices and Simulators** (`Cmd + Shift + 2`)

5. **Na aba "Devices"**, verifique se seu iPhone aparece:
   - Se aparecer, selecione-o
   - Verifique se está como **"Connected"**
   - Se aparecer algum aviso, clique em **"Use for Development"**

### Passo 4: VERIFICAR BUILD DESTINATION

1. **No Xcode**, no topo da janela, ao lado do botão Play (▶️)

2. **Clique no dropdown de destino** (onde normalmente aparece "Any iOS Device" ou nome do simulador)

3. **Procure por "Cássio" ou "iPhone 13"**

4. **Se aparecer**, selecione e tente fazer build (`Cmd + B`)

## 🚨 SE AINDA NÃO FUNCIONAR

### Solução Agressiva 1: Limpar e Recriar Tudo

Execute no Terminal:

```bash
# Parar Xcode
killall -9 com.apple.dt.Xcode

# Limpar TUDO
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport/*
rm -rf ~/Library/MobileDevice/Provisioning\ Profiles/*
rm -rf ~/Library/Preferences/com.apple.dt.Xcode.plist

# Reiniciar serviços
killall -9 com.apple.AMPDeviceDiscoveryAgent
killall -9 com.apple.AMPDevicesAgent
```

Depois:
1. Reinicie o Mac
2. Reconecte o iPhone
3. Abra o Xcode
4. Siga os Passos 1-4 acima novamente

### Solução Agressiva 2: Verificar Permissões do macOS

1. **Abra Configurações do Sistema** (macOS)

2. **Privacidade e Segurança**:
   - **Acessibilidade**: Certifique-se que **Xcode** está listado e **ATIVADO**
   - **Acesso Completo ao Disco**: Certifique-se que **Xcode** está listado e **ATIVADO**

3. Se o Xcode não estiver listado:
   - Clique no **"+"** ou **"Adicionar"**
   - Navegue até `/Applications/Xcode.app`
   - Adicione e ative

4. **Reinicie o Xcode**

### Solução Agressiva 3: Developer Mode no iPhone

**No iPhone:**

1. **Configurações** > **Privacidade e Segurança**

2. Role até o final e procure por **"Modo de Desenvolvedor"** ou **"Developer Mode"**

3. **Ative o toggle**

4. **Reinicie o iPhone** quando solicitado

5. Após reiniciar, **confirme a ativação** quando aparecer o aviso

**Nota**: Se não aparecer a opção "Modo de Desenvolvedor", conecte o iPhone ao Xcode primeiro (pode aparecer depois).

## 📋 CHECKLIST COMPLETO

Execute este checklist na ordem:

- [ ] **Xcode Settings > Accounts > Download Manual Profiles** (FEITO?)
- [ ] **Xcode Settings > Accounts > Manage Certificates** (tem certificado?)
- [ ] **Projeto > Signing & Capabilities > Automatically manage signing** (ATIVADO?)
- [ ] **Projeto > Signing & Capabilities > Team** (selecionado?)
- [ ] **iPhone desbloqueado e confiando no computador** (FEITO?)
- [ ] **Developer Mode ativado no iPhone** (ATIVADO?)
- [ ] **macOS > Privacidade > Acessibilidade > Xcode** (ATIVADO?)
- [ ] **macOS > Privacidade > Acesso Completo ao Disco > Xcode** (ATIVADO?)
- [ ] **Window > Devices and Simulators** (iPhone aparece?)
- [ ] **Build Destination dropdown** (iPhone aparece?)

## 💡 DICA CRÍTICA

O problema mais comum é que o **Xcode não consegue criar o Provisioning Profile automaticamente** porque:

1. **Não há certificado válido** → Solução: Adicionar certificado em Settings > Accounts
2. **Team não está selecionado** → Solução: Selecionar Team em Signing & Capabilities
3. **Bundle Identifier já está em uso** → Solução: Mudar o Bundle ID ou usar outra conta

## 🔧 COMANDOS ÚTEIS PARA DIAGNÓSTICO

```bash
# Ver dispositivos conectados
xcrun devicectl list devices

# Ver certificados
security find-identity -v -p codesigning

# Ver provisioning profiles
ls -la ~/Library/MobileDevice/Provisioning\ Profiles/

# Ver DeviceSupport instalado
ls -la ~/Library/Developer/Xcode/iOS\ DeviceSupport/
```

---

**Última atualização**: 2026-02-08

**Status atual**:
- ✅ Dispositivo detectado pelo sistema
- ✅ Certificados instalados (2)
- ❌ Provisioning Profiles: 0 (PROBLEMA PRINCIPAL)
- ❌ Não aparece no Build Destination
