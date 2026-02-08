#!/bin/bash

# Script para instalar manualmente o iOS Simulator Runtime no Xcode
# Solução para erro DVTDownloads.SimulatorRuntimeCryptexErrors error 3

echo "🔧 Instalação Manual do iOS Simulator Runtime"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Não execute este script como root/sudo${NC}"
   exit 1
fi

# Verificar se o Xcode está instalado
if [ ! -d "/Applications/Xcode.app" ]; then
    echo -e "${RED}❌ Xcode não encontrado em /Applications/Xcode.app${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Instruções:${NC}"
echo "   1. Baixe o iOS Simulator Runtime do site da Apple:"
echo "      https://developer.apple.com/download/all/"
echo "   2. O arquivo será um .dmg (ex: iOS_18.0_Simulator_Runtime.dmg)"
echo "   3. Coloque o arquivo na pasta Downloads"
echo ""
read -p "Pressione Enter quando tiver baixado o arquivo .dmg..."

# Procurar arquivo .dmg na pasta Downloads
DMG_FILE=$(find ~/Downloads -name "*Simulator_Runtime*.dmg" -o -name "*iOS*.dmg" | head -1)

if [ -z "$DMG_FILE" ]; then
    echo -e "${RED}❌ Arquivo .dmg não encontrado na pasta Downloads${NC}"
    echo "   Por favor, baixe o iOS Simulator Runtime e tente novamente"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo encontrado: $DMG_FILE${NC}"
echo ""

# Criar pasta de Runtimes se não existir
RUNTIMES_DIR="/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Library/Developer/CoreSimulator/Runtimes"
echo -e "${YELLOW}📁 Criando pasta de Runtimes...${NC}"
sudo mkdir -p "$RUNTIMES_DIR"
echo -e "${GREEN}✅ Pasta criada${NC}"
echo ""

# Montar o DMG
echo -e "${YELLOW}💿 Montando DMG...${NC}"
MOUNT_POINT=$(hdiutil attach "$DMG_FILE" | grep -o '/Volumes/.*' | head -1)

if [ -z "$MOUNT_POINT" ]; then
    echo -e "${RED}❌ Erro ao montar o DMG${NC}"
    exit 1
fi

echo -e "${GREEN}✅ DMG montado em: $MOUNT_POINT${NC}"
echo ""

# Procurar arquivo .simruntime
SIMRUNTIME=$(find "$MOUNT_POINT" -name "*.simruntime" -type d | head -1)

if [ -z "$SIMRUNTIME" ]; then
    echo -e "${RED}❌ Arquivo .simruntime não encontrado no DMG${NC}"
    hdiutil detach "$MOUNT_POINT"
    exit 1
fi

echo -e "${GREEN}✅ Runtime encontrado: $SIMRUNTIME${NC}"
echo ""

# Copiar para o Xcode
echo -e "${YELLOW}📦 Copiando runtime para o Xcode...${NC}"
RUNTIME_NAME=$(basename "$SIMRUNTIME")
sudo cp -R "$SIMRUNTIME" "$RUNTIMES_DIR/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Runtime copiado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao copiar runtime${NC}"
    hdiutil detach "$MOUNT_POINT"
    exit 1
fi

# Desmontar DMG
echo -e "${YELLOW}💿 Desmontando DMG...${NC}"
hdiutil detach "$MOUNT_POINT"
echo -e "${GREEN}✅ DMG desmontado${NC}"
echo ""

# Verificar instalação
echo -e "${YELLOW}🔍 Verificando instalação...${NC}"
xcrun simctl runtime list
echo ""

echo -e "${GREEN}✅ Instalação concluída!${NC}"
echo ""
echo "📝 Próximos passos:"
echo "   1. Feche completamente o Xcode (Cmd + Q)"
echo "   2. Abra o Xcode novamente"
echo "   3. Vá em Window > Devices and Simulators"
echo "   4. Tente criar/executar um simulador"
echo ""
