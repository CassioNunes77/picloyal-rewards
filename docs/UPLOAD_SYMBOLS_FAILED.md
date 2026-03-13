# Upload Symbols Failed – Firebase dSYM no Xcode 16

## O problema

Ao arquivar e enviar o app para a App Store, aparecem avisos como:

```
Upload Symbols Failed
The archive did not include a dSYM for the FirebaseFirestoreInternal.framework with the UUIDs [FCBFEB2A-5F4C-306F-B85C-0B750776AB3B]. Ensure that the archive's dSYM folder includes a DWARF file for FirebaseFirestoreInternal.framework with the expected UUIDs.
```

Frameworks afetados (Firebase via SPM):

- `FirebaseFirestoreInternal.framework`
- `absl.framework`
- `grpc.framework`
- `grpcpp.framework`
- `openssl_grpc.framework`

## Por que acontece

1. O Firebase distribui alguns frameworks como binários pré-compilados via Swift Package Manager.
2. O Xcode 16 passou a exigir dSYM para cada framework dinâmico.
3. Esses binários do Firebase não incluem dSYMs.
4. É um problema conhecido: [firebase/firebase-ios-sdk#13551](https://github.com/firebase/firebase-ios-sdk/issues/13551), [#13764](https://github.com/firebase/firebase-ios-sdk/issues/13764).

## Posição oficial

- **Apple**: o aviso pode ser ignorado para bibliotecas de terceiros sem dSYM ([Apple Forums](https://developer.apple.com/forums/thread/761589)).
- **Firebase**: o aviso não impede o envio; a correção depende do Xcode/Apple.

## Soluções

### 1. Ignorar o aviso (recomendado)

- O app pode ser enviado e aprovado normalmente.
- O aviso não bloqueia a distribuição.
- O dSYM do seu app continua sendo enviado; só faltam os dos frameworks do Firebase.

### 2. Usar o Transporter em vez do Xcode

Evita os avisos de upload de símbolos:

1. No Xcode: **Product → Archive**
2. No Organizer: **Distribute App**
3. Escolha **Custom** → **Next**
4. Selecione **App Store Connect** → **Export**
5. Salve o `.ipa` em disco
6. Abra o app **Transporter** (Mac App Store)
7. Arraste o `.ipa` para o Transporter e envie

### 3. Conferir o Scheme (Archive em Release)

Se o Archive estiver em Debug, pode gerar mais avisos:

1. **Product → Scheme → Edit Scheme…**
2. No menu à esquerda: **Archive**
3. Em **Build Configuration**, selecione **Release**
4. Feche e faça um novo Archive

### 4. Build Settings

O projeto já está com:

- `DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym"` em Release

Não é necessário alterar isso.

### 5. Migrar para CocoaPods (alternativa)

Alguns relatos indicam que, com CocoaPods, os dSYMs são incluídos corretamente. É uma mudança maior e só vale se você precisar de algo específico que o SPM não ofereça.

## Resumo

| Ação | Resultado |
|------|-----------|
| Ignorar o aviso | App pode ser enviado e aprovado normalmente |
| Usar Transporter | Evita os avisos de upload de símbolos |
| Archive em Release | Reduz avisos e garante build de produção |

## Referências

- [Firebase #13551 – Xcode 16 Fails to upload dSYM to ASC](https://github.com/firebase/firebase-ios-sdk/issues/13551)
- [Firebase #13764 – Validation Warnings](https://github.com/firebase/firebase-ios-sdk/issues/13764)
- [Apple Forums – Xcode 16 warning about missing symbols](https://developer.apple.com/forums/thread/761589)
