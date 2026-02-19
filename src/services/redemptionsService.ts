import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

const REDEMPTIONS_COLLECTION = "offerRedemptions";

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
  createdAt: Date;
}

function toDate(value: any): Date {
  if (!value) return new Date();
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  return new Date();
}

/**
 * Cria um resgate quando o usuário solicita usar uma oferta
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
    createdAt: Timestamp.now(),
  });
  return docRef.id;
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
    return snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        offerId: String(d?.offerId ?? ""),
        offerTitle: String(d?.offerTitle ?? ""),
        storeId: String(d?.storeId ?? ""),
        storeName: String(d?.storeName ?? ""),
        merchantId: String(d?.merchantId ?? ""),
        userId: String(d?.userId ?? ""),
        userName: String(d?.userName ?? ""),
        userEmail: String(d?.userEmail ?? ""),
        createdAt: toDate(d?.createdAt),
      };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Erro ao buscar resgates:", error);
    return [];
  }
}
