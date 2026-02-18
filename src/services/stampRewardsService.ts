import { doc, collection, getDocs, addDoc, query, where, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { getStoreById } from "./merchantsService";

const STAMP_REWARDS_COLLECTION = "stampRewards";

export interface StampRewardData {
  id?: string;
  storeId: string;
  storeName?: string;
  merchantId: string;
  totalStamps: number;
  rewardTitle: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StampRewardDataFirestore {
  storeId: string;
  merchantId: string;
  totalStamps: number;
  rewardTitle: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Converte valor do Firestore (Timestamp ou objeto) para Date */
function toDate(value: any): Date {
  if (!value) return new Date();
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  if (typeof value?.toMillis === "function") return new Date(value.toMillis());
  if (value instanceof Date) return value;
  const t = new Date(value);
  return isNaN(t.getTime()) ? new Date() : t;
}

/**
 * Cria um novo programa de carimbo
 */
export async function createStampReward(
  storeId: string,
  merchantId: string,
  totalStamps: number,
  rewardTitle: string
): Promise<string> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const ref = collection(firestore, STAMP_REWARDS_COLLECTION);
    const data: StampRewardDataFirestore = {
      storeId,
      merchantId,
      totalStamps,
      rewardTitle: rewardTitle.trim(),
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(ref, data);
    console.log("✅ [stampRewardsService] Carimbo criado com sucesso:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("❌ [stampRewardsService] Erro ao criar carimbo:", error);
    throw error;
  }
}

/**
 * Busca todos os programas de carimbo ativos (para exibição na home do usuário)
 */
export async function getAllStampRewards(): Promise<StampRewardData[]> {
  if (!firestore) {
    console.error("❌ [stampRewardsService] Firestore não está configurado!");
    return [];
  }

  try {
    const ref = collection(firestore, STAMP_REWARDS_COLLECTION);
    const q = query(ref, where("active", "==", true));
    const snapshot = await getDocs(q);

    const rewards = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        storeId: String(data?.storeId ?? ""),
        merchantId: String(data?.merchantId ?? ""),
        totalStamps: Number(data?.totalStamps ?? 0),
        rewardTitle: String(data?.rewardTitle ?? ""),
        active: data?.active !== false,
        createdAt: toDate(data?.createdAt),
        updatedAt: toDate(data?.updatedAt),
      };
    });

    const withStoreNames = await Promise.all(
      rewards.map(async (r) => {
        const store = r.storeId ? await getStoreById(r.storeId) : null;
        return { ...r, storeName: store?.name ?? "" };
      })
    );
    return withStoreNames;
  } catch (error: any) {
    console.error("❌ [stampRewardsService] Erro ao buscar carimbos:", error);
    return [];
  }
}

/**
 * Busca programas de carimbo de uma loja
 */
export async function getStoreStampRewards(storeId: string): Promise<StampRewardData[]> {
  if (!firestore) {
    console.error("❌ [stampRewardsService] Firestore não está configurado!");
    return [];
  }

  try {
    const ref = collection(firestore, STAMP_REWARDS_COLLECTION);
    const q = query(ref, where("storeId", "==", storeId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        storeId: String(data?.storeId ?? ""),
        merchantId: String(data?.merchantId ?? ""),
        totalStamps: Number(data?.totalStamps ?? 0),
        rewardTitle: String(data?.rewardTitle ?? ""),
        active: data?.active !== false,
        createdAt: toDate(data?.createdAt),
        updatedAt: toDate(data?.updatedAt),
      };
    });
  } catch (error: any) {
    console.error("❌ [stampRewardsService] Erro ao buscar carimbos:", error);
    return [];
  }
}
