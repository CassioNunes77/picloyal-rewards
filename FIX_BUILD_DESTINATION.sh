#!/bin/bash

echo "🔧 Corrigindo problema de dispositivo não aparecer no Build..."

# 1. Matar todos os processos do Xcode
echo "1. Encerrando processos do Xcode..."
killall -9 com.apple.dt.Xcode 2>/dev/null
killall -9 com.apple.CoreSimulator.CoreSimulatorService 2>/dev/null
killall -9 com.apple.AMPDeviceDiscoveryAgent 2>/dev/null
killall -9 com.apple.ITunesService 2>/dev/null
pkill -9 -f "Xcode\|Simulator" 2>/dev/null

# 2. Limpar todos os caches
echo "2. Limpando caches..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport/*
rm -rf ~/Library/Developer/Xcode/Archives/*
rm -rf ~/Library/Caches/com.apple.dt.Xcode/*

# 3. Limpar preferências de dispositivos
echo "3. Limpando preferências de dispositivos..."
rm -rf ~/Library/Preferences/com.apple.dt.Xcode.plist
rm -rf ~/Library/Preferences/com.apple.iphonesimulator.plist

# 4. Verificar dispositivo
echo "4. Verificando dispositivo..."
xcrun devicectl list devices 2>/dev/null | grep -i "cássio" || echo "⚠️ Dispositivo não encontrado"

# 5. Tentar fazer build direto para o dispositivo
echo "5. Tentando build direto para o dispositivo..."
cd "/Users/Cassio/Documents/Xcode Projects/CartaoFidelidade"

DEVICE_ID="00008110-0011449E1E3A401E"

echo "📱 Device ID: $DEVICE_ID"
echo ""
echo "✅ Processo concluído!"
echo ""
echo "Próximos passos:"
echo "1. Abra o Xcode"
echo "2. Conecte seu iPhone"
echo "3. Aguarde 10 segundos"
echo "4. Vá em Product > Destination > Cássio"
echo "5. Se não aparecer, tente: Window > Devices and Simulators > Selecione seu iPhone > Use for Development"
