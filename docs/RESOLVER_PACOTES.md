# Resolver Pacotes Swift Package Manager

## Problema

Os pacotes `Capacitor` e `Cordova` não foram resolvidos pelo Xcode.

## ✅ Solução Rápida (Linha de Comando)

Execute o script fornecido:

```bash
./resolver_pacotes.sh
```

Ou execute diretamente:

```bash
xcodebuild -resolvePackageDependencies -project CartaoFidelidade.xcodeproj
```

Isso resolve os pacotes automaticamente. Depois abra o projeto no Xcode.

## ✅ Solução Manual (Xcode)

### 1. Abrir o Projeto no Xcode

```bash
open CartaoFidelidade.xcodeproj
```

### 2. Resolver os Pacotes

No Xcode, siga estes passos:

#### Opção A: Resolver Automaticamente
1. Vá em **File > Packages > Resolve Package Versions**
2. Aguarde o Xcode baixar e resolver os pacotes
3. Você verá um indicador de progresso no topo do Xcode

#### Opção B: Se a Opção A não funcionar
1. Vá em **File > Packages > Reset Package Caches**
2. Depois **File > Packages > Resolve Package Versions**
3. Aguarde a resolução

#### Opção C: Verificar Configuração Manual
1. No navegador de projetos (lado esquerdo), clique no projeto (ícone azul no topo)
2. Selecione o target **CartaoFidelidade**
3. Vá na aba **Package Dependencies**
4. Verifique se aparece: `capacitor-swift-pm` (https://github.com/ionic-team/capacitor-swift-pm.git)
5. Se não aparecer, clique no botão **+** e adicione:
   - URL: `https://github.com/ionic-team/capacitor-swift-pm.git`
   - Version: `Up to Next Major Version` com `6.0.0`

### 3. Adicionar os Produtos ao Target

Após resolver os pacotes:

1. No navegador de projetos, clique no projeto
2. Selecione o target **CartaoFidelidade**
3. Vá na aba **General**
4. Role até **Frameworks, Libraries, and Embedded Content**
5. Clique no botão **+**
6. Adicione:
   - **Capacitor**
   - **Cordova**
7. Certifique-se de que ambos estão configurados como **Do Not Embed**

### 4. Limpar e Compilar

1. **Product > Clean Build Folder** (Shift+Cmd+K)
2. **Product > Build** (Cmd+B)

## 🔄 Alternativa: Usar Projeto Gerado pelo Capacitor

Se continuar com problemas, use o projeto gerado pelo Capacitor que já está configurado:

```bash
cd web
npm run build:ios
npm run open:ios
```

Este projeto (`web/ios/App/App.xcodeproj`) já tem tudo configurado e funcionando.

## ⚠️ Nota sobre Versões

O projeto está configurado para usar Capacitor 6.0.0+ (compatível com Swift 5.0 e Xcode 14.3.1).

Se você tiver Xcode 15 ou 16, pode usar Capacitor 8.0.1 atualizando a versão mínima no projeto.
