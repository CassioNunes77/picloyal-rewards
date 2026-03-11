# Provisioning Profile: In-App Purchase e Sign in with Apple

## Erro

> "Core+" requires a provisioning profile with the In-App Purchase and Sign in with Apple features. Select a provisioning profile in the Signing & Capabilities editor.

## Causa

O App ID (`com.corevo.coremais`) precisa ter as capabilities **In-App Purchase** e **Sign in with Apple** habilitadas no Apple Developer Portal. O provisioning profile é gerado a partir do App ID — se as capabilities não estiverem no App ID, o perfil não as incluirá.

## Solução (passo a passo)

### 1. Habilitar capabilities no App ID

1. Acesse [developer.apple.com](https://developer.apple.com) e faça login
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Localize o App ID **com.corevo.coremais** (ou crie se não existir)
4. Clique no App ID para editar
5. Em **Capabilities**, marque:
   - ✅ **In-App Purchase**
   - ✅ **Sign in with Apple**
6. Clique em **Save** (e confirme na tela seguinte, se houver)

### 2. Regenerar o provisioning profile no Xcode

1. **Xcode** → **Settings** (Cmd + ,) → **Accounts**
2. Selecione sua conta Apple
3. Clique em **Download Manual Profiles** (ou **Manage Certificates** → **Download All**)
4. Aguarde o download concluir

### 3. Limpar e reconstruir

1. No Xcode: **Product** → **Clean Build Folder** (Cmd + Shift + K)
2. Feche o Xcode
3. No Terminal:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```
4. Abra o Xcode novamente e faça o build

### 4. Conferir Signing & Capabilities

1. Selecione o projeto **Core+** no navegador
2. Selecione o target **CartaoFidelidade**
3. Aba **Signing & Capabilities**
4. Confirme:
   - ✅ **Automatically manage signing** marcado
   - ✅ **Team** selecionado (sua conta)
   - ✅ **Sign in with Apple** na lista de capabilities
   - ✅ **In-App Purchase** na lista de capabilities

Se **In-App Purchase** ou **Sign in with Apple** não aparecerem, clique em **+ Capability** e adicione.

---

**Nota:** O projeto já foi ajustado para usar **Automatic signing** em Debug e Release, com o Team configurado. Após habilitar as capabilities no portal e regenerar os perfis, o erro deve ser resolvido.
