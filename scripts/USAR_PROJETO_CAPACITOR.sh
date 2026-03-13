#!/bin/bash

# Script para usar o projeto iOS gerado pelo Capacitor
# Este projeto já está configurado corretamente e não tem problemas de sandbox

echo "🚀 Preparando projeto iOS do Capacitor..."

cd "$(dirname "$0")/web"

# Build e sincronização
echo "📦 Compilando web e sincronizando com iOS..."
npm run build:ios

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "📱 Abrindo projeto no Xcode..."
    npm run open:ios
    
    echo ""
    echo "✨ Pronto! O projeto está aberto no Xcode."
    echo ""
    echo "Próximos passos:"
    echo "1. Selecione um simulador ou dispositivo"
    echo "2. Pressione Cmd+R para executar"
    echo ""
    echo "💡 Dica: Sempre que alterar o código web, execute:"
    echo "   cd web && npm run build:ios"
else
    echo "❌ Erro ao compilar. Verifique os logs acima."
    exit 1
fi
