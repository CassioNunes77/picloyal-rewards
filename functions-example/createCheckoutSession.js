/**
 * Exemplo de Cloud Function para criar Stripe Checkout Session
 *
 * Para usar:
 * 1. npm install stripe no diretório functions
 * 2. Configure STRIPE_SECRET_KEY nas variáveis de ambiente do Firebase
 * 3. Crie o produto/price no Stripe Dashboard
 * 4. Deploy: firebase deploy --only functions
 *
 * O frontend chama esta função via POST com:
 * { userId, email, successUrl, cancelUrl }
 *
 * Retorna: { url: "https://checkout.stripe.com/..." }
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

if (!admin.apps.length) {
  admin.initializeApp();
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret);

exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const { userId, email, successUrl, cancelUrl } = req.body || {};
    if (!userId || !email) {
      res.status(400).json({ error: "userId e email são obrigatórios" });
      return;
    }

    // ID do Price no Stripe (crie em Stripe Dashboard → Products)
    const PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || "price_xxx";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: userId,
      success_url: successUrl || `${req.headers.origin || ""}/premium?success=true`,
      cancel_url: cancelUrl || `${req.headers.origin || ""}/premium?canceled=true`,
      metadata: {
        userId,
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("Erro ao criar Checkout Session:", err);
    res.status(500).json({ error: err.message || "Erro interno" });
  }
});

/**
 * Webhook para atualizar Firestore quando o pagamento é confirmado
 * Configure em Stripe Dashboard → Webhooks → Add endpoint
 * URL: https://us-central1-SEU_PROJECT.cloudfunctions.net/stripeWebhook
 * Eventos: checkout.session.completed
 *
 * IMPORTANTE: Para Cloud Functions v1, use express.raw() para o webhook.
 * Para v2, use onRequest com { consume: true } ou adapte conforme a documentação.
 */
