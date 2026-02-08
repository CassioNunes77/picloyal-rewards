# Solução: Erro Simulator Runtime Cryptex (Error 3)

## ❌ Erro Reportado

```
The operation couldn't be completed. (DVTDownloads.SimulatorRuntimeCryptexErrors error 3.)
Domain: DVTDownloads.SimulatorRuntimeCryptexErrors
Code: 3
Failed to locate cryptex in asset folder.
```

## 🔍 Causa do Problema

Este erro ocorre quando:
- O runtime do simulador iOS está corrompido ou incompleto
- Os arquivos cryptex necessários para o simulador não foram baixados corretamente
- Há problemas com o cache de downloads do Xcode
- O Xcode não consegue localizar os arquivos do runtime do simulador

## ✅ Soluções (em ordem de prioridade)

### Solução 0: Solução Rápida (Xcode 16.0 Beta)

**Este é um bug conhecido do Xcode 16.0 beta.** Tente primeiro:

1. **Feche completamente o Xcode** (`Cmd + Q`)
2. **Reinicie o Mac** (Apple reconhece isso como solução para este bug)
3. **Abra o Xcode novamente** e tente usar o simulador

Se isso não funcionar, continue com as soluções abaixo.

### Solução 1: Limpar Cache de Downloads do Xcode

Execute no Terminal:

```bash
# Parar todos os processos do Xcode
killall -9 com.apple.CoreSimulator.CoreSimulatorService
killall -9 com.apple.dt.Xcode
killall -9 com.apple.CoreSimulator

# Limpar cache de downloads
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport/*
rm -rf ~/Library/Caches/com.apple.dt.Xcode/*
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Limpar cache de simuladores
xcrun simctl delete unavailable
xcrun simctl erase all
```

Depois, **reinicie o Xcode** e tente novamente.

### Solução 2: Instalação Manual do Runtime (Mais Robusta)

Esta solução instala o runtime diretamente no Xcode.app, evitando problemas de cryptex:

1. **Baixar o Runtime Manualmente:**
   - Acesse: https://developer.apple.com/download/all/
   - Faça login com sua conta Apple Developer
   - Baixe o arquivo `.dmg` do iOS Simulator Runtime (ex: `iOS_18.0_Simulator_Runtime.dmg`)

2. **Instalar via Terminal:**
   ```bash
   # Criar pasta de Runtimes se não existir
   sudo mkdir -p /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Library/Developer/CoreSimulator/Runtimes
   
   # Montar o DMG baixado (substitua pelo caminho do seu arquivo)
   hdiutil attach ~/Downloads/iOS_18.0_Simulator_Runtime.dmg
   
   # Copiar o arquivo .simruntime para a pasta do Xcode
   sudo cp -R "/Volumes/iOS 18.0 Simulator Runtime/iOS 18.0.simruntime" \
     /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Library/Developer/CoreSimulator/Runtimes/
   
   # Desmontar o DMG
   hdiutil detach "/Volumes/iOS 18.0 Simulator Runtime"
   
   # Reiniciar o Xcode
   killall -9 com.apple.dt.Xcode
   ```

3. **Ou usar xcrun (mais simples):**
   ```bash
   # Adicionar runtime diretamente do DMG
   xcrun simctl runtime add ~/Downloads/iOS_18.0_Simulator_Runtime.dmg
   ```

### Solução 3: Reinstalar o Runtime pelo Xcode

1. **No Xcode:**
   - Vá em **Xcode** > **Settings** (ou `Cmd + ,`)
   - Vá na aba **"Platforms"** ou **"Components"**
   - Procure pelo runtime do iOS que você precisa (iOS 18.0)
   - Clique com botão direito e selecione **"Delete"**
   - Depois, clique em **"Get"** ou **"Download"** para baixar novamente

2. **Ou via Terminal:**
   ```bash
   # Listar runtimes instalados
   xcrun simctl runtime list
   
   # Remover runtime específico (substitua VERSION pela versão)
   xcrun simctl runtime delete "iOS 18.0"
   
   # Depois baixe novamente pelo Xcode Settings
   ```

### Solução 4: Verificar e Corrigir Permissões

```bash
# Verificar permissões das pastas do Xcode
ls -la ~/Library/Developer/Xcode/

# Corrigir permissões se necessário
chmod -R 755 ~/Library/Developer/Xcode/
chown -R $(whoami) ~/Library/Developer/Xcode/
```

### Solução 5: Limpar e Reinstalar Simuladores

```bash
# Listar simuladores
xcrun simctl list devices

# Deletar todos os simuladores (CUIDADO: isso remove todos!)
xcrun simctl delete all

# Depois, no Xcode, vá em Window > Devices and Simulators
# E adicione novos simuladores manualmente
```

### Solução 6: Verificar Espaço em Disco

O erro pode ocorrer se não houver espaço suficiente:

```bash
# Verificar espaço disponível
df -h

# Limpar espaço se necessário
# - Limpar lixeira
# - Limpar Downloads antigos
# - Usar ferramentas de limpeza do macOS
```

### Solução 7: Reinstalar Xcode (Último Recurso)

Se nada funcionar:

1. **Fazer backup das configurações:**
   ```bash
   # Salvar preferências do Xcode
   cp -r ~/Library/Preferences/com.apple.dt.Xcode.plist ~/Desktop/
   ```

2. **Remover Xcode completamente:**
   ```bash
   # Remover aplicativo
   sudo rm -rf /Applications/Xcode.app
   
   # Remover dados do usuário
   rm -rf ~/Library/Developer/Xcode
   rm -rf ~/Library/Preferences/com.apple.dt.Xcode.plist
   rm -rf ~/Library/Caches/com.apple.dt.Xcode
   ```

3. **Baixar e instalar novamente:**
   - Baixe o Xcode do [Apple Developer](https://developer.apple.com/xcode/)
   - Ou use a App Store
   - Instale e configure novamente

## 🔧 Script Automático de Correção

Execute o script `fix_simulator_cryptex.sh` que está na raiz do projeto:

```bash
chmod +x fix_simulator_cryptex.sh
./fix_simulator_cryptex.sh
```

## 📋 Checklist de Verificação

- [ ] Cache do Xcode limpo
- [ ] Runtime do simulador reinstalado
- [ ] Permissões das pastas corretas
- [ ] Espaço em disco suficiente (>10GB livre)
- [ ] Xcode atualizado para versão mais recente
- [ ] macOS atualizado (compatível com Xcode 16.0)

## 🚨 Se o Erro Persistir

### Verificar Logs Detalhados

```bash
# Ver logs do Xcode
log show --predicate 'process == "Xcode"' --last 1h | grep -i cryptex

# Ver logs do simulador
log show --predicate 'process == "com.apple.CoreSimulator"' --last 1h
```

### Informações do Sistema

Seu sistema atual:
- **macOS**: 14.7.8 (Build 23H730)
- **Xcode**: 16.0 (23051) (Build 16A242d)

**Nota**: Xcode 16.0 é uma versão beta. Pode haver bugs conhecidos. Considere:
- Usar uma versão estável (Xcode 15.x)
- Ou atualizar para a versão mais recente do beta

## 💡 Dica Extra

Se você não precisa usar o simulador imediatamente:
- Use um **dispositivo físico** para desenvolvimento
- O erro do cryptex afeta apenas simuladores, não dispositivos físicos

---

**Última atualização**: 2026-02-08
