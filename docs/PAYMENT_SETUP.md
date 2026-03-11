# Configuração do Sistema de Pagamentos

O app suporta assinatura Premium em duas plataformas com sistemas de pagamento diferentes:

- **iOS**: Apple In-App Purchase (StoreKit 2)
- **Web**: Stripe Checkout

O status Premium é unificado no Firestore (`users/{uid}.plan = "premium"`), permitindo que o usuário acesse os benefícios em ambas as plataformas.

---

## iOS (Apple In-App Purchase)

### 1. App Store Connect

1. Acesse [App Store Connect](https://appstoreconnect.apple.com)
2. Seu app → In-App Purchases → Criar
3. Tipo: **Assinatura automática**
4. Crie um grupo de assinatura (ex: "Premium")
5. Crie o produto com ID: `com.coreplus.premium.monthly`
6. Configure preço (ex: R$ 19,90/mês)

### 2. Xcode

1. Abra o projeto no Xcode
2. Target → Signing & Capabilities → + Capability
3. Adicione **In-App Purchase**

### 3. Listener de transações (obrigatório)

O app inicia `Transaction.updates` no launch para não perder compras bem-sucedidas (recomendação Apple). Implementado em `StoreKitService.startTransactionListener()`.

### 4. App Store vs login do app

A assinatura usa o **sistema de pagamentos da App Store** (Apple ID). O usuário pode estar logado no app com **qualquer conta** (Google, e-mail, Apple) – a compra é feita com a **Apple ID da App Store**, que é independente. Se o iOS pedir para "Entrar" ou "Sign in", é para a App Store, não para o app.

### 5. Teste local (opcional)

O arquivo `CartaoFidelidade/Products.storekit` permite testar compras no simulador:

1. Xcode → Product → Scheme → Edit Scheme
2. Run → Options → StoreKit Configuration
3. Selecione `Products.storekit`

---

## Web (Stripe)

### 1. Stripe Dashboard

1. Crie conta em [stripe.com](https://stripe.com)
2. Products → Add product → "Premium Mensal"
3. Preço: R$ 19,90/mês (recorrente)
4. Copie o **Price ID** (ex: `price_xxx`)

### 2. Cloud Function (Backend)

O diretório `functions-example/` contém um exemplo de Cloud Function. Para usar:

1. Crie um projeto Firebase Functions (ou use o existente)
2. Copie e adapte `createCheckoutSession.js`
3. Configure variáveis:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PREMIUM_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET` (para o webhook)
4. Deploy: `firebase deploy --only functions`

### 3. Frontend (.env)

```env
VITE_STRIPE_CHECKOUT_ENDPOINT=https://us-central1-SEU_PROJECT.cloudfunctions.net/createCheckoutSession
```

### 4. Webhook Stripe

1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://us-central1-SEU_PROJECT.cloudfunctions.net/stripeWebhook`
3. Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copie o **Signing secret** e configure na Cloud Function

---

## Firestore

Os campos em `users/{uid}` usados para assinatura:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `plan` | string | `"free"` ou `"premium"` |
| `subscriptionSource` | string | `"apple"` ou `"stripe"` |
| `subscriptionUpdatedAt` | timestamp | Última atualização |

As regras atuais permitem que o usuário atualize seu próprio documento. O webhook Stripe usa Firebase Admin SDK (bypassa regras).
