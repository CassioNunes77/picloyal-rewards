import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

const USER_ACTIVITIES_COLLECTION = "userActivities";

export type ActivityType = "offer" | "reward" | "stamp" | "purchase" | "points";

export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  storeName: string;
  storeId?: string;
  offerId?: string;
  redemptionId?: string;
  merchantId?: string;
  points?: number;
  status?: "pending" | "confirmed";
  createdAt: Date;
}

function toDate(value: unknown): Date {
  if (!value) return new Date();
  const v = value as { toDate?: () => Date; seconds?: number };
  if (typeof v?.toDate === "function") return v.toDate();
  if (typeof v?.seconds === "number") return new Date(v.seconds * 1000);
  return new Date();
}

/**
 * Registra atividade quando o usuário solicita uso de oferta
 */
export async function recordOfferRequested(params: {
  userId: string;
  redemptionId: string;
  offerId: string;
  offerTitle: string;
  storeId: string;
  storeName: string;
  merchantId: string;
}): Promise<void> {
  if (!firestore) return;
  try {
    await addDoc(collection(firestore, USER_ACTIVITIES_COLLECTION), {
      userId: params.userId,
      type: "offer",
      title: "Oferta solicitada",
      description: params.offerTitle,
      storeName: params.storeName,
      storeId: params.storeId,
      offerId: params.offerId,
      redemptionId: params.redemptionId,
      merchantId: params.merchantId,
      status: "pending",
      createdAt: Timestamp.now(),
    });
  } catch (e) {
    console.warn("[userActivitiesService] Erro ao registrar atividade:", e);
  }
}

/**
 * Atualiza atividade quando o lojista confirma o resgate
 */
export async function recordOfferConfirmed(redemptionId: string, merchantId: string): Promise<void> {
  if (!firestore) return;
  try {
    const q = query(
      collection(firestore, USER_ACTIVITIES_COLLECTION),
      where("redemptionId", "==", redemptionId)
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await updateDoc(doc(firestore, USER_ACTIVITIES_COLLECTION, d.id), {
        status: "confirmed",
        title: "Oferta utilizada",
        updatedAt: Timestamp.now(),
      });
    }
  } catch (e) {
    console.warn("[userActivitiesService] Erro ao atualizar atividade:", e);
  }
}

/**
 * Busca atividades do usuário para a tela de histórico
 */
export async function getUserActivities(userId: string, limitCount = 50): Promise<UserActivity[]> {
  if (!firestore) return [];
  try {
    const q = query(
      collection(firestore, USER_ACTIVITIES_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: String(data?.userId ?? ""),
        type: (data?.type as ActivityType) ?? "offer",
        title: String(data?.title ?? ""),
        description: String(data?.description ?? ""),
        storeName: String(data?.storeName ?? ""),
        storeId: data?.storeId ? String(data.storeId) : undefined,
        offerId: data?.offerId ? String(data.offerId) : undefined,
        redemptionId: data?.redemptionId ? String(data.redemptionId) : undefined,
        merchantId: data?.merchantId ? String(data.merchantId) : undefined,
        points: data?.points != null ? Number(data.points) : undefined,
        status: data?.status as "pending" | "confirmed" | undefined,
        createdAt: toDate(data?.createdAt),
      };
    });
  } catch (e) {
    console.error("[userActivitiesService] Erro ao buscar atividades:", e);
    return [];
  }
}

/**
 * Mescla atividades com resgates (para incluir resgates antigos sem atividade)
 */
export function mergeActivitiesWithRedemptions(
  activities: UserActivity[],
  redemptions: Array<{
    id: string;
    offerTitle: string;
    storeName: string;
    status: string;
    createdAt: Date;
  }>
): UserActivity[] {
  const redemptionIds = new Set(activities.map((a) => a.redemptionId).filter(Boolean));
  const fromRedemptions: UserActivity[] = redemptions
    .filter((r) => !redemptionIds.has(r.id))
    .map((r) => ({
      id: r.id,
      userId: "",
      type: "offer" as ActivityType,
      title: r.status === "confirmed" ? "Oferta utilizada" : "Oferta solicitada",
      description: r.offerTitle,
      storeName: r.storeName,
      redemptionId: r.id,
      status: (r.status === "confirmed" ? "confirmed" : "pending") as "pending" | "confirmed",
      createdAt: r.createdAt,
    }));
  return [...activities, ...fromRedemptions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
