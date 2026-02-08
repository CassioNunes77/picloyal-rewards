#!/bin/bash

echo "🔧 Script para Reinstalar Xcode 16.0"
echo "======================================"
echo ""
echo "⚠️  ATENÇÃO: Este script vai REMOVER o Xcode atual!"
echo "   Certifique-se de ter feito backup dos seus projetos."
echo ""
read -p "Continuar? (s/n): " resposta

if [ "$resposta" != "s" ] && [ "$resposta" != "S" ]; then
    echo "Cancelado."
    exit 0
fi

echo ""
echo "1. Fechando Xcode..."
killall -9 com.apple.dt.Xcode 2>/dev/null
sleep 2

echo "2. Removendo Xcode atual..."
sudo rm -rf /Applications/Xcode.app

if [ $? -eq 0 ]; then
    echo "   ✅ Xcode removido com sucesso"
else
    echo "   ⚠️  Erro ao remover. Tente manualmente: sudo rm -rf /Applications/Xcode.app"
fi

echo ""
echo "3. Limpando caches..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Caches/com.apple.dt.Xcode/*
echo "   ✅ Caches limpos"

echo ""
echo "4. Abrindo App Store..."
open "macappstore://apps.apple.com/app/xcode/id497799835"

echo ""
echo "======================================"
echo "✅ Processo concluído!"
echo ""
echo "Próximos passos:"
echo "1. Na App Store, clique em 'Obter' ou 'Download'"
echo "2. Aguarde o download (30-60 minutos)"
echo "3. Após instalar, abra o Xcode"
echo "4. Aceite os termos de licença"
echo "5. Instale componentes adicionais se solicitado"
echo "6. Conecte seu iPhone"
echo "7. Vá em Window > Devices and Simulators (Cmd+Shift+2)"
echo "8. Selecione seu iPhone - o DeviceSupport vai baixar automaticamente"
echo ""
echo "OU"
echo ""
echo "Baixe manualmente do Apple Developer:"
echo "https://developer.apple.com/download/all/"
echo "Procure por 'Xcode 16.0'"
