#!/bin/bash

# Script para resolver pacotes Swift Package Manager
# Execute este script para resolver os pacotes do Capacitor

echo "🔧 Resolvendo pacotes Swift Package Manager..."

cd "$(dirname "$0")"

# Resolver pacotes usando xcodebuild
xcodebuild -resolvePackageDependencies -project CartaoFidelidade.xcodeproj

if [ $? -eq 0 ]; then
    echo "✅ Pacotes resolvidos com sucesso!"
    echo ""
    echo "Agora você pode:"
    echo "1. Abrir o projeto no Xcode: open CartaoFidelidade.xcodeproj"
    echo "2. Compilar: Product > Build (Cmd+B)"
else
    echo "❌ Erro ao resolver pacotes"
    echo "Tente abrir o projeto no Xcode e resolver manualmente:"
    echo "File > Packages > Resolve Package Versions"
fi
