#!/bin/bash

# Script para verificar e reinstalar runtime do simulador

echo "🔍 Verificando status do runtime do simulador..."
echo ""

# Listar runtimes instalados
echo "📋 Runtimes instalados:"
xcrun simctl runtime list
echo ""

# Verificar simuladores disponíveis
echo "📱 Simuladores disponíveis:"
xcrun simctl list devices available
echo ""

# Verificar se há problemas com o runtime
echo "🔧 Para reinstalar o runtime:"
echo "   1. Abra o Xcode"
echo "   2. Vá em Xcode > Settings (Cmd + ,)"
echo "   3. Vá na aba 'Platforms' ou 'Components'"
echo "   4. Encontre o iOS Runtime que você precisa"
echo "   5. Clique com botão direito > Delete"
echo "   6. Depois clique em 'Get' ou 'Download' para baixar novamente"
echo ""
echo "💡 Se você precisa do iOS 18.0 (conforme seu deployment target):"
echo "   - Certifique-se de que o runtime iOS 18.0 está instalado"
echo "   - Se não estiver, baixe-o pelo Xcode Settings"
echo ""
