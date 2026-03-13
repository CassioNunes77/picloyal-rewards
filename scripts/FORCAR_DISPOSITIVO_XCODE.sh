#!/bin/bash

# Script para FORÇAR o reconhecimento do iPhone no Xcode
# Dispositivo detectado mas não aparece no build destination

echo "🔧 FORÇANDO reconhecimento do iPhone no Xcode..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DEVICE_ID="34B818F9-1F09-4246-88D4-C1150BFB2FD7"
DEVICE_NAME="Cássio"

echo -e "${BLUE}📱 Dispositivo detectado:${NC}"
echo "   Nome: $DEVICE_NAME"
echo "   ID: $DEVICE_ID"
echo ""

# Passo 1: Parar TODOS os processos relacionados
echo -e "${YELLOW}🛑 Passo 1: Parando todos os processos...${NC}"
killall -9 com.apple.dt.Xcode 2>/dev/null
killall -9 com.apple.CoreSimulator.CoreSimulatorService 2>/dev/null
killall -9 com.apple.CoreSimulator 2>/dev/null
killall -9 com.apple.AMPDeviceDiscoveryAgent 2>/dev/null
killall -9 com.apple.AMPDevicesAgent 2>/dev/null
killall -9 com.apple.AMPAuthAgent 2>/dev/null
killall -9 com.apple.AMPDeviceAgent 2>/dev/null
sleep 3
echo -e "${GREEN}✅ Processos parados${NC}"
echo ""

# Passo 2: Limpar TODOS os caches
echo -e "${YELLOW}🧹 Passo 2: Limpando TODOS os caches...${NC}"
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport/* 2>/dev/null
rm -rf ~/Library/Caches/com.apple.dt.Xcode/* 2>/dev/null
rm -rf ~/Library/Preferences/com.apple.dt.Xcode.plist 2>/dev/null
rm -rf ~/Library/Developer/CoreSimulator/Caches/* 2>/dev/null
echo -e "${GREEN}✅ Caches limpos${NC}"
echo ""

# Passo 3: Verificar informações do dispositivo
echo -e "${YELLOW}🔍 Passo 3: Verificando informações do dispositivo...${NC}"
xcrun devicectl device info -d "$DEVICE_ID" 2>&1 | head -30
echo ""

# Passo 4: Tentar forçar pairing
echo -e "${YELLOW}🔗 Passo 4: Tentando forçar pairing...${NC}"
xcrun devicectl device pair -d "$DEVICE_ID" 2>&1 || echo "Pairing já existe ou não necessário"
echo ""

# Passo 5: Verificar DeviceSupport para a versão do iOS
echo -e "${YELLOW}📦 Passo 5: Verificando DeviceSupport...${NC}"
DEVICE_INFO=$(xcrun devicectl device info -d "$DEVICE_ID" 2>&1)
IOS_VERSION=$(echo "$DEVICE_INFO" | grep -i "version\|iOS" | head -1 | grep -oE "[0-9]+\.[0-9]+" | head -1)

if [ ! -z "$IOS_VERSION" ]; then
    echo "   Versão iOS detectada: $IOS_VERSION"
    DEVICE_SUPPORT_DIR="$HOME/Library/Developer/Xcode/iOS DeviceSupport"
    mkdir -p "$DEVICE_SUPPORT_DIR"
    echo "   Pasta DeviceSupport: $DEVICE_SUPPORT_DIR"
    
    # Verificar se há DeviceSupport para esta versão
    if [ -d "$DEVICE_SUPPORT_DIR" ]; then
        echo "   Pastas existentes:"
        ls -la "$DEVICE_SUPPORT_DIR" | head -5
    fi
else
    echo -e "${YELLOW}   ⚠️ Não foi possível detectar a versão do iOS${NC}"
fi
echo ""

# Passo 6: Limpar e recriar preferências do Xcode
echo -e "${YELLOW}⚙️  Passo 6: Recriando preferências do Xcode...${NC}"
rm -rf ~/Library/Preferences/com.apple.dt.Xcode.plist 2>/dev/null
rm -rf ~/Library/Preferences/com.apple.DeveloperTools.plist 2>/dev/null
echo -e "${GREEN}✅ Preferências removidas (serão recriadas ao abrir o Xcode)${NC}"
echo ""

# Passo 7: Verificar certificados
echo -e "${YELLOW}🔐 Passo 7: Verificando certificados...${NC}"
CERT_COUNT=$(security find-identity -v -p codesigning 2>/dev/null | grep -c "iPhone Developer\|Apple Development")
if [ "$CERT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Certificados encontrados: $CERT_COUNT${NC}"
    security find-identity -v -p codesigning 2>/dev/null | grep "iPhone Developer\|Apple Development" | head -3
else
    echo -e "${RED}⚠️  Nenhum certificado de desenvolvimento encontrado${NC}"
    echo "   Você precisará adicionar um certificado no Xcode > Settings > Accounts"
fi
echo ""

# Passo 8: Verificar provisioning profiles
echo -e "${YELLOW}📋 Passo 8: Verificando provisioning profiles...${NC}"
PROFILES_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
if [ -d "$PROFILES_DIR" ]; then
    PROFILE_COUNT=$(ls -1 "$PROFILES_DIR" 2>/dev/null | wc -l)
    echo "   Profiles encontrados: $PROFILE_COUNT"
else
    echo -e "${YELLOW}   ⚠️  Pasta de profiles não existe${NC}"
fi
echo ""

# Resumo e próximos passos
echo -e "${GREEN}✅ Limpeza concluída!${NC}"
echo ""
echo -e "${BLUE}📝 PRÓXIMOS PASSOS CRÍTICOS:${NC}"
echo ""
echo "1. ${YELLOW}NO IPHONE:${NC}"
echo "   - Desbloqueie o iPhone"
echo "   - Desconecte e reconecte o cabo USB"
echo "   - Quando aparecer 'Confiar neste computador?', toque em CONFIAR"
echo "   - Digite o código de desbloqueio"
echo ""
echo "2. ${YELLOW}NO MAC:${NC}"
echo "   - Abra Configurações do Sistema > Privacidade e Segurança"
echo "   - Verifique se o Xcode tem permissão em 'Acessibilidade'"
echo "   - Verifique se o Xcode tem permissão em 'Acesso Completo ao Disco'"
echo ""
echo "3. ${YELLOW}NO XCODE:${NC}"
echo "   - Abra o Xcode"
echo "   - Vá em Xcode > Settings (Cmd + ,)"
echo "   - Aba 'Accounts' > Selecione sua conta > 'Download Manual Profiles'"
echo "   - Vá em Window > Devices and Simulators (Cmd + Shift + 2)"
echo "   - Verifique se o iPhone aparece na lista"
echo ""
echo "4. ${YELLOW}SE AINDA NÃO APARECER:${NC}"
echo "   - Feche o Xcode completamente (Cmd + Q)"
echo "   - Reinicie o Mac"
echo "   - Reconecte o iPhone após reiniciar"
echo "   - Abra o Xcode novamente"
echo ""
echo -e "${RED}⚠️  IMPORTANTE:${NC}"
echo "   Seu iPhone está rodando iOS 26.2.1"
echo "   Seu projeto está configurado para iOS 18.0"
echo "   O Xcode precisa ter DeviceSupport para iOS 26.2.1"
echo "   Isso pode ser baixado automaticamente quando você conectar"
echo ""
