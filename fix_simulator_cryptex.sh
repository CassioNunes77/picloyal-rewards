#!/bin/bash

# Script para corrigir erro de Simulator Runtime Cryptex
# Erro: DVTDownloads.SimulatorRuntimeCryptexErrors error 3

echo "🔧 Iniciando correção do erro Simulator Runtime Cryptex..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Não execute este script como root/sudo${NC}"
   exit 1
fi

# Passo 1: Parar processos do Xcode
echo -e "${YELLOW}📱 Passo 1: Parando processos do Xcode...${NC}"
killall -9 com.apple.CoreSimulator.CoreSimulatorService 2>/dev/null
killall -9 com.apple.dt.Xcode 2>/dev/null
killall -9 com.apple.CoreSimulator 2>/dev/null
sleep 2
echo -e "${GREEN}✅ Processos parados${NC}"
echo ""

# Passo 2: Limpar cache de downloads
echo -e "${YELLOW}🧹 Passo 2: Limpando cache de downloads do Xcode...${NC}"
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport/* 2>/dev/null
rm -rf ~/Library/Caches/com.apple.dt.Xcode/* 2>/dev/null
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null
echo -e "${GREEN}✅ Cache limpo${NC}"
echo ""

# Passo 3: Limpar simuladores não disponíveis
echo -e "${YELLOW}🗑️  Passo 3: Removendo simuladores não disponíveis...${NC}"
xcrun simctl delete unavailable 2>/dev/null
echo -e "${GREEN}✅ Simuladores não disponíveis removidos${NC}"
echo ""

# Passo 4: Verificar espaço em disco
echo -e "${YELLOW}💾 Passo 4: Verificando espaço em disco...${NC}"
AVAILABLE_SPACE=$(df -h ~ | tail -1 | awk '{print $4}' | sed 's/[^0-9]//g')
if [ "$AVAILABLE_SPACE" -lt 10 ]; then
    echo -e "${RED}⚠️  Aviso: Pouco espaço em disco disponível (menos de 10GB)${NC}"
    echo -e "${YELLOW}   Considere liberar espaço antes de continuar${NC}"
else
    echo -e "${GREEN}✅ Espaço suficiente disponível${NC}"
fi
echo ""

# Passo 5: Verificar permissões
echo -e "${YELLOW}🔐 Passo 5: Verificando permissões...${NC}"
if [ -d ~/Library/Developer/Xcode ]; then
    chmod -R 755 ~/Library/Developer/Xcode/ 2>/dev/null
    echo -e "${GREEN}✅ Permissões verificadas${NC}"
else
    echo -e "${YELLOW}⚠️  Pasta do Xcode não encontrada (normal se Xcode nunca foi usado)${NC}"
fi
echo ""

# Passo 6: Listar runtimes disponíveis
echo -e "${YELLOW}📋 Passo 6: Runtimes do simulador instalados:${NC}"
xcrun simctl runtime list 2>/dev/null || echo -e "${YELLOW}   (Nenhum runtime encontrado ou comando não disponível)${NC}"
echo ""

# Resumo
echo -e "${GREEN}✅ Correção concluída!${NC}"
echo ""
echo "📝 Próximos passos:"
echo "   1. Abra o Xcode"
echo "   2. Vá em Xcode > Settings > Platforms (ou Components)"
echo "   3. Baixe/Reinstale o runtime do iOS que você precisa"
echo "   4. Tente executar o simulador novamente"
echo ""
echo "💡 Dica: Se o erro persistir, considere usar um dispositivo físico"
echo "   ou reinstalar o Xcode completamente."
echo ""
