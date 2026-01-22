#!/bin/bash

# Script para copiar arquivos web compilados para o projeto iOS

echo "📦 Copiando arquivos web para iOS..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IOS_PUBLIC_DIR="$SCRIPT_DIR/../CartaoFidelidade/public"

# Verificar se o build foi feito
if [ ! -d "$SCRIPT_DIR/dist" ]; then
    echo "❌ Pasta dist não encontrada. Execute 'npm run build' primeiro."
    exit 1
fi

# Criar diretório se não existir
mkdir -p "$IOS_PUBLIC_DIR"

# Copiar arquivos
echo "📋 Copiando arquivos de $SCRIPT_DIR/dist para $IOS_PUBLIC_DIR..."
cp -r "$SCRIPT_DIR/dist/"* "$IOS_PUBLIC_DIR/"

if [ $? -eq 0 ]; then
    echo "✅ Arquivos copiados com sucesso!"
    echo ""
    echo "📱 Próximos passos:"
    echo "1. Abra o projeto no Xcode: open ../CartaoFidelidade.xcodeproj"
    echo "2. Se a pasta 'public' não aparecer no projeto:"
    echo "   - Arraste a pasta 'public' para o projeto"
    echo "   - Selecione 'Create folder references' (não 'Create groups')"
    echo "   - Marque 'Add to targets: CartaoFidelidade'"
    echo "3. Compile e execute: Product > Run (Cmd+R)"
else
    echo "❌ Erro ao copiar arquivos"
    exit 1
fi
