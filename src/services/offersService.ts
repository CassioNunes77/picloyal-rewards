import { doc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

const OFFERS_COLLECTION = "offers";

export interface OfferData {
  id?: string;
  storeId: string;
  merchantId: string;
  title: string;
  description: string;
  discount?: string;
  category: string;
  validUntil: Date;
  pointsRequired?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferDataFirestore {
  storeId: string;
  merchantId: string;
  title: string;
  description: string;
  discount?: string;
  category: string;
  validUntil: Timestamp;
  pointsRequired?: number;
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
 * Converte dados do Firestore para OfferData (conversão defensiva)
 */
function firestoreToOfferData(docId: string, data: any): OfferData {
  return {
    id: docId,
    storeId: String(data?.storeId ?? ""),
    merchantId: String(data?.merchantId ?? ""),
    title: String(data?.title ?? ""),
    description: String(data?.description ?? ""),
    discount: data?.discount != null ? String(data.discount) : undefined,
    category: String(data?.category ?? "geral"),
    validUntil: toDate(data?.validUntil),
    pointsRequired: typeof data?.pointsRequired === "number" ? data.pointsRequired : undefined,
    active: data?.active !== false,
    createdAt: toDate(data?.createdAt),
    updatedAt: toDate(data?.updatedAt),
  };
}

/**
 * Cria uma nova oferta
 */
export async function createOffer(
  storeId: string,
  merchantId: string,
  offerData: Omit<OfferData, "id" | "storeId" | "merchantId" | "createdAt" | "updatedAt">
): Promise<string> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const offersRef = collection(firestore, OFFERS_COLLECTION);
    const offerFirestoreData: OfferDataFirestore = {
      storeId,
      merchantId,
      title: offerData.title,
      description: offerData.description,
      category: offerData.category,
      validUntil: Timestamp.fromDate(offerData.validUntil),
      active: offerData.active ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (offerData.discount !== undefined) {
      offerFirestoreData.discount = offerData.discount;
    }
    if (offerData.pointsRequired !== undefined) {
      offerFirestoreData.pointsRequired = offerData.pointsRequired;
    }

    const docRef = await addDoc(offersRef, offerFirestoreData);
    console.log("✅ [offersService] Oferta criada com sucesso:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("❌ [offersService] Erro ao criar oferta:", error);
    throw error;
  }
}

/**
 * Busca todas as ofertas de uma loja
 */
export async function getStoreOffers(storeId: string): Promise<OfferData[]> {
  if (!firestore) {
    console.error("❌ [offersService] Firestore não está configurado!");
    return [];
  }

  try {
    const offersRef = collection(firestore, OFFERS_COLLECTION);
    const q = query(offersRef, where("storeId", "==", String(storeId)));
    const querySnapshot = await getDocs(q);

    const offers = querySnapshot.docs.map((d) => firestoreToOfferData(d.id, d.data()));
    offers.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    return offers;
  } catch (error: any) {
    console.error("❌ [offersService] Erro ao buscar ofertas da loja:", error);
    return [];
  }
}

/**
 * Atualiza uma oferta existente
 */
export async function updateOffer(
  offerId: string,
  merchantId: string,
  offerData: Partial<Omit<OfferData, "id" | "storeId" | "merchantId" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const offerRef = doc(firestore, OFFERS_COLLECTION, offerId);
    const updateData: Partial<OfferDataFirestore> = {
      updatedAt: Timestamp.now(),
    };

    if (offerData.title !== undefined) updateData.title = offerData.title;
    if (offerData.description !== undefined) updateData.description = offerData.description;
    if (offerData.discount !== undefined) updateData.discount = offerData.discount;
    if (offerData.category !== undefined) updateData.category = offerData.category;
    if (offerData.validUntil !== undefined) updateData.validUntil = Timestamp.fromDate(offerData.validUntil);
    if (offerData.pointsRequired !== undefined) updateData.pointsRequired = offerData.pointsRequired;
    if (offerData.active !== undefined) updateData.active = offerData.active;

    await updateDoc(offerRef, updateData);
    console.log("✅ [offersService] Oferta atualizada com sucesso:", offerId);
  } catch (error: any) {
    console.error("❌ [offersService] Erro ao atualizar oferta:", error);
    throw error;
  }
}

/**
 * Deleta uma oferta
 */
export async function deleteOffer(offerId: string, merchantId: string): Promise<void> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const offerRef = doc(firestore, OFFERS_COLLECTION, offerId);
    await deleteDoc(offerRef);
    console.log("✅ [offersService] Oferta deletada com sucesso:", offerId);
  } catch (error: any) {
    console.error("❌ [offersService] Erro ao deletar oferta:", error);
    throw error;
  }
}
