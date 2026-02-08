# 🎯 PASSO A PASSO: Fazer iPhone Aparecer no Build

## ⚠️ PROBLEMA CONFIRMADO
- ✅ Dispositivo detectado
- ✅ Certificados OK (2 certificados)
- ❌ **0 Provisioning Profiles** ← ESTE É O PROBLEMA!

## 📝 FAÇA EXATAMENTE ISSO (NA ORDEM):

### 1️⃣ ABRIR XCODE E IR EM SETTINGS

1. Abra o Xcode
2. Pressione `Cmd + ,` (ou Xcode > Settings)
3. Clique na aba **"Accounts"** (no topo)

### 2️⃣ BAIXAR PROVISIONING PROFILES

1. Na lista de contas, **selecione sua conta Apple Developer**
2. Clique no botão **"Download Manual Profiles"** (ou "Manage Certificates..." > depois "Download All")
3. **AGUARDE** aparecer a mensagem de sucesso (pode demorar 1-2 minutos)
4. Você deve ver algo como "Downloaded X profiles"

### 3️⃣ VERIFICAR SIGNING DO PROJETO

1. **Feche a janela de Settings** (`Cmd + W`)

2. No navegador de projetos (lado esquerdo), **clique no projeto "CartaoFidelidade"** (ícone azul no topo)

3. No painel central, **selecione o target "CartaoFidelidade"** (deve estar selecionado por padrão)

4. Clique na aba **"Signing & Capabilities"** (no topo do painel)

5. **VERIFIQUE**:
   - ✅ **"Automatically manage signing"** está MARCADO
   - ✅ **"Team"** está selecionado (sua conta)
   - ✅ **Bundle Identifier**: `corevo.CartaoFidelidade`

6. **Se aparecer algum erro** (linha vermelha):
   - Clique em **"Try Again"** ou **"Fix Issue"**
   - O Xcode vai criar automaticamente um Provisioning Profile

### 4️⃣ RECONECTAR O IPHONE

1. **No iPhone**:
   - Desbloqueie
   - Desconecte o cabo USB
   - Aguarde 5 segundos
   - Reconecte o cabo

2. **Quando aparecer "Confiar neste computador?"**:
   - Toque em **"CONFIAR"**
   - Digite o código de desbloqueio

### 5️⃣ VERIFICAR DEVICES AND SIMULATORS

1. No Xcode, pressione `Cmd + Shift + 2` (ou Window > Devices and Simulators)

2. Na aba **"Devices"**, procure por **"Cássio"** ou **"iPhone 13"**

3. **Se aparecer**:
   - Selecione o dispositivo
   - Verifique se está como **"Connected"**
   - Se aparecer algum botão ou aviso, clique nele

4. **Se NÃO aparecer**:
   - Feche esta janela
   - Vá para o Passo 6

### 6️⃣ VERIFICAR BUILD DESTINATION

1. No topo da janela do Xcode, ao lado do botão Play (▶️), há um **dropdown**

2. **Clique neste dropdown**

3. **Procure por**:
   - "Cássio"
   - "iPhone 13"
   - "Any iOS Device (arm64)"

4. **Se aparecer**, selecione e tente fazer build (`Cmd + B`)

5. **Se NÃO aparecer**, continue para o Passo 7

### 7️⃣ SE AINDA NÃO APARECER - VERIFICAR PERMISSÕES

1. **Feche o Xcode** (`Cmd + Q`)

2. **Abra Configurações do Sistema** (macOS)

3. **Privacidade e Segurança**:
   - Role até **"Acessibilidade"**
   - Verifique se **Xcode** está listado e **ATIVADO**
   - Se não estiver, adicione (`+`) e ative

4. **Ainda em Privacidade e Segurança**:
   - Role até **"Acesso Completo ao Disco"**
   - Verifique se **Xcode** está listado e **ATIVADO**
   - Se não estiver, adicione (`+`) e ative

5. **Reinicie o Mac**

6. **Após reiniciar**:
   - Reconecte o iPhone
   - Abra o Xcode
   - Repita os Passos 1-6

### 8️⃣ DEVELOPER MODE NO IPHONE (SE NECESSÁRIO)

**No iPhone:**

1. **Configurações** > **Privacidade e Segurança**

2. Role até o final

3. Procure por **"Modo de Desenvolvedor"** ou **"Developer Mode"**

4. **Ative o toggle**

5. **Reinicie o iPhone** quando solicitado

6. Após reiniciar, **confirme a ativação**

**Nota**: Se não aparecer esta opção, conecte o iPhone ao Xcode primeiro (pode aparecer depois).

## ✅ VERIFICAÇÃO FINAL

Após seguir todos os passos, verifique:

```bash
# No Terminal, execute:
ls -la ~/Library/MobileDevice/Provisioning\ Profiles/
```

**Se aparecerem arquivos** (não apenas `.` e `..`), os profiles foram criados!

## 🚨 SE NADA FUNCIONAR

Execute este comando no Terminal e me envie o resultado:

```bash
# Verificar tudo
echo "=== DISPOSITIVOS ==="
xcrun devicectl list devices
echo ""
echo "=== CERTIFICADOS ==="
security find-identity -v -p codesigning | grep "iPhone Developer\|Apple Development"
echo ""
echo "=== PROFILES ==="
ls -la ~/Library/MobileDevice/Provisioning\ Profiles/ | wc -l
echo ""
echo "=== DEVICE SUPPORT ==="
ls -la ~/Library/Developer/Xcode/iOS\ DeviceSupport/
```

---

**IMPORTANTE**: O problema principal é a falta de Provisioning Profiles. O Passo 2 é CRÍTICO e deve resolver o problema na maioria dos casos.
