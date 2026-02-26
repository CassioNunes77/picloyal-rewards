import { collection, addDoc, query, where, orderBy, limit, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { recordOfferRequested, recordOfferConfirmed } from "./userActivitiesService";

const REDEMPTIONS_COLLECTION = "offerRedemptions";

export type RedemptionStatus = "pending" | "confirmed";

export interface RedemptionData {
  id: string;
  offerId: string;
  offerTitle: string;
  storeId: string;
  storeName: string;
  merchantId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: RedemptionStatus;
  createdAt: Date;
}

function toDate(value: any): Date {
  if (!value) return new Date();
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  return new Date();
}

/**
 * Cria um resgate quando o usuário solicita usar uma oferta.
 * Não cria duplicata se já existir resgate pendente para o mesmo usuário+oferta.
 */
export async function createRedemption(
  offerId: string,
  offerTitle: string,
  storeId: string,
  storeName: string,
  merchantId: string,
  userId: string,
  userName: string,
  userEmail: string
): Promise<string> {
  if (!firestore) throw new Error("Firestore não está configurado");

  // Evitar duplicatas: se já existe resgate pendente, retornar o id existente
  const existing = await getUserRedemptionForOffer(userId, offerId);
  if (existing?.status === "pending") {
    return existing.id;
  }

  const ref = collection(firestore, REDEMPTIONS_COLLECTION);
  const docRef = await addDoc(ref, {
    offerId,
    offerTitle,
    storeId,
    storeName,
    merchantId,
    userId,
    userName,
    userEmail,
    status: "pending",
    createdAt: Timestamp.now(),
  });
  recordOfferRequested({
    userId,
    redemptionId: docRef.id,
    offerId,
    offerTitle,
    storeId,
    storeName,
    merchantId,
  }).catch(() => {});
  return docRef.id;
}

/**
 * Busca resgates recentes (para painel administrativo - atividades)
 * Requer regra Firestore que permita leitura por admin
 */
export async function getRecentRedemptions(limitCount: number = 50): Promise<RedemptionData[]> {
  if (!firestore) return [];

  try {
    const q = query(
      collection(firestore, REDEMPTIONS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        offerId: String(d?.offerId ?? ""),
        offerTitle: String(d?.offerTitle ?? ""),
        storeId: String(d?.storeId ?? ""),
        storeName: String(d?.storeName ?? ""),
        merchantId: String(d?.merchantId ?? ""),
        userId: String(d?.userId ?? ""),
        userName: String(d?.userName ?? ""),
        userEmail: String(d?.userEmail ?? ""),
        status: (d?.status as RedemptionStatus) ?? "pending",
        createdAt: toDate(d?.createdAt),
      };
    });
  } catch (error) {
    console.error("Erro ao buscar resgates recentes:", error);
    return [];
  }
}

/**
 * Busca resgates do merchant, opcionalmente filtrados por loja
 */
export async function getMerchantRedemptions(
  merchantId: string,
  storeId?: string | null
): Promise<RedemptionData[]> {
  if (!firestore) return [];

  try {
    let q = query(
      collection(firestore, REDEMPTIONS_COLLECTION),
      where("merchantId", "==", merchantId)
    );
    if (storeId && storeId.trim() !== "") {
      q = query(q, where("storeId", "==", storeId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        offerId: String(d?.offerId ?? ""),
        offerTitle: String(d?.offerTitle ?? ""),
        storeId: String(d?.storeId ?? ""),
        storeName: String(d?.storeName ?? ""),
        merchantId: String(d?.merchantId ?? ""),
        userId: String(d?.userId ?? ""),
        userName: String(d?.userName ?? ""),
        userEmail: String(d?.userEmail ?? ""),
        status: (d?.status as RedemptionStatus) ?? "pending",
        createdAt: toDate(d?.createdAt),
      };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Erro ao buscar resgates:", error);
    return [];
  }
}

/**
 * Retorna mapa offerId -> status dos resgates do usuário (para exibir na lista de ofertas).
 * Usa o resgate mais recente por oferta. Query sem orderBy para não exigir índice composto.
 */
export async function getUserRedemptionsMap(userId: string): Promise<Record<string, RedemptionStatus>> {
  if (!firestore) return {};
  try {
    const q = query(
      collection(firestore, REDEMPTIONS_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const byOffer: Array<{ offerId: string; status: RedemptionStatus; createdAt: Date }> = [];
    for (const docSnap of snapshot.docs) {
      const d = docSnap.data();
      const offerId = String(d?.offerId ?? "");
      if (!offerId) continue;
      const createdAt = d?.createdAt?.toDate?.() ?? new Date(0);
      byOffer.push({
        offerId,
        status: (d?.status as RedemptionStatus) ?? "pending",
        createdAt,
      });
    }
    byOffer.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const map: Record<string, RedemptionStatus> = {};
    for (const item of byOffer) {
      if (!(item.offerId in map)) map[item.offerId] = item.status;
    }
    return map;
  } catch (error) {
    console.error("Erro ao buscar resgates do usuário:", error);
    return {};
  }
}

/**
 * Busca resgates do usuário para histórico de atividades
 */
export async function getUserRedemptions(userId: string, limitCount = 100): Promise<RedemptionData[]> {
  if (!firestore) return [];
  try {
    const q = query(
      collection(firestore, REDEMPTIONS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        offerId: String(d?.offerId ?? ""),
        offerTitle: String(d?.offerTitle ?? ""),
        storeId: String(d?.storeId ?? ""),
        storeName: String(d?.storeName ?? ""),
        merchantId: String(d?.merchantId ?? ""),
        userId: String(d?.userId ?? ""),
        userName: String(d?.userName ?? ""),
        userEmail: String(d?.userEmail ?? ""),
        status: (d?.status as RedemptionStatus) ?? "pending",
        createdAt: toDate(d?.createdAt),
      };
    });
  } catch (error) {
    console.error("Erro ao buscar resgates do usuário:", error);
    return [];
  }
}

/**
 * Busca o resgate mais recente do usuário para uma oferta (para exibir status na tela de detalhes)
 */
export async function getUserRedemptionForOffer(
  userId: string,
  offerId: string
): Promise<RedemptionData | null> {
  if (!firestore) return null;
  try {
    const q = query(
      collection(firestore, REDEMPTIONS_COLLECTION),
      where("userId", "==", userId),
      where("offerId", "==", offerId),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    const docSnap = snapshot.docs[0];
    if (!docSnap) return null;
    const d = docSnap.data();
    return {
      id: docSnap.id,
      offerId: String(d?.offerId ?? ""),
      offerTitle: String(d?.offerTitle ?? ""),
      storeId: String(d?.storeId ?? ""),
      storeName: String(d?.storeName ?? ""),
      merchantId: String(d?.merchantId ?? ""),
      userId: String(d?.userId ?? ""),
      userName: String(d?.userName ?? ""),
      userEmail: String(d?.userEmail ?? ""),
      status: (d?.status as RedemptionStatus) ?? "pending",
      createdAt: toDate(d?.createdAt),
    };
  } catch (error) {
    console.error("Erro ao buscar resgate do usuário:", error);
    return null;
  }
}

/**
 * Confirma o resgate (lojista marca como atendido)
 */
export async function confirmRedemption(
  redemptionId: string,
  merchantId: string
): Promise<void> {
  if (!firestore) throw new Error("Firestore não está configurado");
  const ref = doc(firestore, REDEMPTIONS_COLLECTION, redemptionId);
  await updateDoc(ref, {
    status: "confirmed",
    confirmedAt: Timestamp.now(),
  });
  recordOfferConfirmed(redemptionId, merchantId).catch(() => {});
}
