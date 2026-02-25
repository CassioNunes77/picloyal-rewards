import { addDoc, collection, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

const SHARE_EVENTS_COLLECTION = "offerShareEvents";

export type ShareType = "link" | "whatsapp" | "native";

/**
 * Retorna a URL base do app (para links compartilháveis)
 */
export function getAppBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://coreplus.app"; // fallback para SSR
}

/**
 * Gera URL compartilhável da oferta
 */
export function getOfferShareUrl(offerId: string): string {
  const base = getAppBaseUrl();
  return `${base}/offer/${offerId}`;
}

/**
 * Mensagem para compartilhar no WhatsApp
 */
export function getWhatsAppShareMessage(offerTitle: string, storeName: string, url: string): string {
  return `Confira esta oferta: ${offerTitle} em ${storeName}\n\n${url}`;
}

/**
 * URL do WhatsApp com mensagem pré-preenchida
 */
export function getWhatsAppShareUrl(text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://wa.me/?text=${encoded}`;
}

/**
 * Registra compartilhamento para analytics
 */
export async function trackOfferShare(params: {
  offerId: string;
  userId: string | null;
  shareType: ShareType;
  offerTitle?: string;
  storeId?: string;
}): Promise<void> {
  if (!firestore) return;
  try {
    await addDoc(collection(firestore, SHARE_EVENTS_COLLECTION), {
      offerId: params.offerId,
      userId: params.userId ?? null,
      shareType: params.shareType,
      offerTitle: params.offerTitle ?? "",
      storeId: params.storeId ?? "",
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.warn("Erro ao registrar compartilhamento:", error);
  }
}
