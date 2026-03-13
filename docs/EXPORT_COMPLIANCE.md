# Conformidade de Exportação (Criptografia)

## Declaração

O app Core+ declara conformidade com as regulamentações de exportação de criptografia dos EUA através da chave `ITSAppUsesNonExemptEncryption` no Info.plist.

## Configuração

```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

## Significado

- **`false`** = O app **não** usa criptografia não isenta
- O app usa apenas:
  - **HTTPS/TLS** (Firebase, APIs, web)
  - **Criptografia do sistema** (Keychain, StoreKit, etc.)
  - **Autenticação padrão** (OAuth, Firebase Auth, Sign in with Apple/Google)

Todas essas formas são **isentas** de documentação de exportação.

## Referências

- [Complying with Encryption Export Regulations](https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations)
- [Export compliance overview](https://help.apple.com/app-store-connect/#/dev88f5c7bf9)
