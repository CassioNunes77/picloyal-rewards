#!/bin/bash

echo "🔧 Forçando reconhecimento do dispositivo no Xcode..."

# 1. Fechar tudo
echo "1. Fechando processos..."
killall -9 com.apple.dt.Xcode 2>/dev/null
killall -9 com.apple.CoreSimulator.CoreSimulatorService 2>/dev/null
killall -9 com.apple.AMPDeviceDiscoveryAgent 2>/dev/null

# 2. Limpar TUDO
echo "2. Limpando caches e preferências..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Preferences/com.apple.dt.Xcode.plist*
rm -rf ~/Library/Caches/com.apple.dt.Xcode/*

# 3. Verificar dispositivo
echo "3. Verificando dispositivo..."
xcrun devicectl list devices 2>/dev/null | grep -i "cássio"

# 4. Abrir Xcode
echo "4. Abrindo Xcode..."
open -a Xcode

echo ""
echo "✅ Pronto!"
echo ""
echo "Agora no Xcode:"
echo "1. Aguarde 15 segundos"
echo "2. Vá em Window > Devices and Simulators (Cmd+Shift+2)"
echo "3. Selecione seu iPhone 'Cássio'"
echo "4. O Xcode deve começar a baixar o DeviceSupport"
echo "5. Aguarde o download completar"
echo "6. Feche e reabra o Xcode"
echo "7. Seu iPhone deve aparecer no dropdown de Run Destination"
