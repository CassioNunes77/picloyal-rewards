/**
 * Serviço de assinatura Premium - Web
 *
 * Fluxo Web (Stripe):
 * 1. Frontend chama createPremiumCheckout() com userId e email
 * 2. Backend cria Stripe Checkout Session
 * 3. Redireciona para Stripe Checkout
 * 4. Webhook atualiza users/{uid}.plan = "premium"
 *
 * Fluxo iOS WebView (StoreKit):
 * 1. Frontend chama purchasePremiumNative(userId)
 * 2. Bridge envia para app nativo
 * 3. StoreKit processa compra
 * 4. Native atualiza Firestore
 */

import { auth } from "@/lib/firebase";
import { updateUserData } from "./usersService";
import { isIOSWebView, purchasePremiumNative, restorePurchasesNative } from "@/lib/nativeBridge";

const CHECKOUT_ENDPOINT = import.meta.env.VITE_STRIPE_CHECKOUT_ENDPOINT ?? "";

export type SubscriptionSource = "stripe" | "apple";

export interface CheckoutResult {
  url: string;
  sessionId?: string;
}

/**
 * Cria sessão de checkout Stripe e retorna URL para redirecionamento.
 * Requer backend que crie a Stripe Checkout Session.
 */
export async function createPremiumCheckout(): Promise<string> {
  const user = auth?.currentUser;
  if (!user) {
    throw new Error("Faça login para assinar Premium.");
  }

  if (!CHECKOUT_ENDPOINT) {
    throw new Error(
      "Checkout não configurado. Configure VITE_STRIPE_CHECKOUT_ENDPOINT no .env com a URL da Cloud Function ou API que cria a sessão Stripe."
    );
  }

  const successUrl = `${window.location.origin}/premium?success=true`;
  const cancelUrl = `${window.location.origin}/premium?canceled=true`;

  const response = await fetch(CHECKOUT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.uid,
      email: user.email ?? "",
      successUrl,
      cancelUrl,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Erro ao criar sessão de checkout.");
  }

  const data = (await response.json()) as { url?: string; checkoutUrl?: string };
  const url = data.url ?? data.checkoutUrl;
  if (!url || typeof url !== "string") {
    throw new Error("Resposta inválida do servidor.");
  }

  return url;
}

/**
 * Redireciona o usuário para o Stripe Checkout
 */
export async function redirectToCheckout(): Promise<void> {
  const url = await createPremiumCheckout();
  window.location.href = url;
}

/**
 * Atualiza o plano do usuário no Firestore (chamado após confirmação via webhook).
 * Para testes locais, pode ser chamado manualmente.
 */
export async function updatePremiumStatus(
  userId: string,
  plan: "free" | "premium",
  source?: SubscriptionSource
): Promise<void> {
  await updateUserData(userId, {
    plan,
    ...(source && { subscriptionSource: source }),
    ...(plan === "premium" && { subscriptionUpdatedAt: new Date() }),
  });
}

/**
 * Verifica se o checkout está configurado (Stripe)
 */
export function isCheckoutConfigured(): boolean {
  return !!CHECKOUT_ENDPOINT?.trim();
}

/**
 * Compra Premium - usa StoreKit no iOS WebView ou Stripe no web
 */
export async function purchasePremium(): Promise<void> {
  const user = auth?.currentUser;
  if (!user) throw new Error("Faça login para assinar Premium.");

  if (isIOSWebView()) {
    await purchasePremiumNative(user.uid);
    await updatePremiumStatus(user.uid, "premium", "apple");
    return;
  }
  await redirectToCheckout();
}

/**
 * Restaura compras - usa StoreKit no iOS WebView
 */
export async function restorePremium(): Promise<boolean> {
  const user = auth?.currentUser;
  if (!user) throw new Error("Faça login para restaurar compras.");

  if (isIOSWebView()) {
    const success = await restorePurchasesNative(user.uid);
    if (success) await updatePremiumStatus(user.uid, "premium", "apple");
    return success;
  }
  throw new Error("Restauração disponível apenas no app iOS.");
}

/**
 * Indica se está no app iOS (usa StoreKit)
 */
export function isNativePurchaseAvailable(): boolean {
  return isIOSWebView();
}
