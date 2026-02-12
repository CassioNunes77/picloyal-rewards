import { doc, getDoc, setDoc, Timestamp, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

const MERCHANTS_COLLECTION = "merchants";
const STORES_COLLECTION = "stores";

/**
 * Interface para dados do lojista no Firestore
 */
export interface MerchantData {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  stores?: string[]; // IDs das lojas do lojista
}

/**
 * Interface para dados da loja no Firestore
 */
export interface StoreData {
  id?: string;
  merchantId: string; // ID do lojista (uid)
  name: string;
  cnpj: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  photoURL?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para dados do lojista no formato Firestore
 */
interface MerchantDataFirestore {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  stores?: string[];
}

/**
 * Interface para dados da loja no formato Firestore
 */
interface StoreDataFirestore {
  merchantId: string;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  photoURL?: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Converte dados do Firestore para MerchantData
 */
function firestoreToMerchantData(docId: string, data: any): MerchantData {
  return {
    uid: docId,
    email: data.email,
    displayName: data.displayName,
    phone: data.phone,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    stores: data.stores || [],
  };
}

/**
 * Converte MerchantData para formato Firestore
 */
function merchantDataToFirestore(merchantData: Partial<MerchantData>): Partial<MerchantDataFirestore> {
  const now = Timestamp.now();
  const result: Partial<MerchantDataFirestore> = {
    updatedAt: now,
  };
  
  if (merchantData.uid !== undefined) result.uid = merchantData.uid;
  if (merchantData.email !== undefined) result.email = merchantData.email;
  if (merchantData.displayName !== undefined) result.displayName = merchantData.displayName;
  if (merchantData.phone !== undefined) result.phone = merchantData.phone;
  if (merchantData.stores !== undefined) result.stores = merchantData.stores;
  if (merchantData.createdAt) {
    result.createdAt = merchantData.createdAt instanceof Timestamp 
      ? merchantData.createdAt 
      : Timestamp.fromDate(merchantData.createdAt);
  }
  
  return result;
}

/**
 * Converte dados do Firestore para StoreData
 */
function firestoreToStoreData(docId: string, data: any): StoreData {
  return {
    id: docId,
    merchantId: data.merchantId,
    name: data.name,
    cnpj: data.cnpj,
    address: data.address,
    city: data.city,
    phone: data.phone,
    hours: data.hours,
    photoURL: data.photoURL,
    active: data.active ?? true,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Converte StoreData para formato Firestore
 */
function storeDataToFirestore(storeData: Partial<StoreData>): Partial<StoreDataFirestore> {
  const now = Timestamp.now();
  const result: Partial<StoreDataFirestore> = {
    updatedAt: now,
    active: storeData.active ?? true,
  };
  
  if (storeData.merchantId !== undefined) result.merchantId = storeData.merchantId;
  if (storeData.name !== undefined) result.name = storeData.name;
  if (storeData.cnpj !== undefined) result.cnpj = storeData.cnpj;
  if (storeData.address !== undefined) result.address = storeData.address;
  if (storeData.city !== undefined) result.city = storeData.city;
  if (storeData.phone !== undefined) result.phone = storeData.phone;
  if (storeData.hours !== undefined) result.hours = storeData.hours;
  if (storeData.photoURL !== undefined) result.photoURL = storeData.photoURL;
  if (storeData.createdAt) {
    result.createdAt = storeData.createdAt instanceof Timestamp 
      ? storeData.createdAt 
      : Timestamp.fromDate(storeData.createdAt);
  }
  
  return result;
}

/**
 * Cria uma conta de lojista (Firebase Auth + Firestore)
 */
export async function createMerchantAccount(
  email: string,
  password: string,
  displayName?: string
): Promise<{ uid: string }> {
  if (!auth || !firestore) {
    throw new Error("Firebase não está configurado");
  }

  try {
    console.log("📝 [merchantsService] Iniciando criação de conta de lojista...");
    console.log("📝 [merchantsService] Email:", email);
    
    // 1. Criar conta no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("✅ [merchantsService] Conta criada no Firebase Auth. UID:", user.uid);

    try {
      // 2. Criar documento APENAS na coleção merchants (não criar em users)
      const merchantData: MerchantDataFirestore = {
        uid: user.uid,
        email: email,
        displayName: displayName,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        stores: [],
      };

      await setDoc(doc(firestore, MERCHANTS_COLLECTION, user.uid), merchantData);
      console.log("✅ [merchantsService] Documento 'merchants' criado com sucesso");
    } catch (merchantError: any) {
      console.error("❌ [merchantsService] Erro ao criar documento 'merchants':", merchantError);
      // Tentar deletar a conta do Auth se falhar
      try {
        await user.delete();
        console.log("⚠️ [merchantsService] Conta do Auth deletada devido a erro no Firestore");
      } catch (deleteError) {
        console.error("❌ [merchantsService] Erro ao deletar conta do Auth:", deleteError);
      }
      throw new Error("Erro ao salvar dados do lojista: " + (merchantError?.message || "Erro desconhecido"));
    }

    console.log("✅ [merchantsService] Conta de lojista criada com sucesso no Firestore. UID:", user.uid);
    return { uid: user.uid };
  } catch (error: any) {
    console.error("❌ [merchantsService] Erro ao criar conta de lojista:", error);
    console.error("❌ [merchantsService] Código do erro:", error?.code);
    console.error("❌ [merchantsService] Mensagem do erro:", error?.message);
    throw error;
  }
}

/**
 * Busca dados do lojista no Firestore
 */
export async function getMerchantData(merchantId: string): Promise<MerchantData | null> {
  if (!firestore) {
    console.error("❌ [merchantsService] Firestore não está configurado!");
    return null;
  }

  try {
    const merchantRef = doc(firestore, MERCHANTS_COLLECTION, merchantId);
    const merchantSnap = await getDoc(merchantRef);
    
    if (!merchantSnap.exists()) {
      console.log("ℹ️ [merchantsService] Lojista não encontrado:", merchantId);
      return null;
    }
    
    return firestoreToMerchantData(merchantSnap.id, merchantSnap.data());
  } catch (error: any) {
    console.error("❌ [merchantsService] Erro ao buscar dados do lojista:", error);
    return null;
  }
}

/**
 * Cria uma nova loja para um lojista
 */
export async function createStore(merchantId: string, storeData: Omit<StoreData, "id" | "merchantId" | "createdAt" | "updatedAt">): Promise<string> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const storeRef = doc(collection(firestore, STORES_COLLECTION));
    const storeFirestoreData: StoreDataFirestore = {
      merchantId,
      name: storeData.name,
      cnpj: storeData.cnpj,
      address: storeData.address,
      city: storeData.city,
      phone: storeData.phone,
      hours: storeData.hours,
      active: storeData.active ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Incluir photoURL apenas se estiver definido e não for undefined
    if (storeData.photoURL !== undefined && storeData.photoURL !== null) {
      storeFirestoreData.photoURL = storeData.photoURL;
    }

    await setDoc(storeRef, storeFirestoreData);

    // Atualizar lista de lojas do lojista
    const merchantRef = doc(firestore, MERCHANTS_COLLECTION, merchantId);
    const merchantSnap = await getDoc(merchantRef);
    if (merchantSnap.exists()) {
      const currentStores = merchantSnap.data().stores || [];
      await updateDoc(merchantRef, {
        stores: [...currentStores, storeRef.id],
        updatedAt: Timestamp.now(),
      });
    }

    console.log("✅ [merchantsService] Loja criada com sucesso:", storeRef.id);
    return storeRef.id;
  } catch (error: any) {
    console.error("❌ [merchantsService] Erro ao criar loja:", error);
    throw error;
  }
}

/**
 * Busca todas as lojas de um lojista
 */
export async function getMerchantStores(merchantId: string): Promise<StoreData[]> {
  if (!firestore) {
    console.error("❌ [merchantsService] Firestore não está configurado!");
    return [];
  }

  try {
    const storesRef = collection(firestore, STORES_COLLECTION);
    const q = query(storesRef, where("merchantId", "==", merchantId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => 
      firestoreToStoreData(doc.id, doc.data())
    );
  } catch (error: any) {
    console.error("❌ [merchantsService] Erro ao buscar lojas do lojista:", error);
    return [];
  }
}

/**
 * Verifica se o usuário existe na coleção merchants
 * Esta função é usada para validar login de lojistas
 */
export async function isMerchant(userId: string): Promise<boolean> {
  if (!firestore) {
    console.error("❌ [merchantsService] Firestore não está configurado!");
    return false;
  }
  
  try {
    console.log(`🔍 [merchantsService] Verificando se usuário ${userId} existe na coleção 'merchants'...`);
    const merchantRef = doc(firestore, MERCHANTS_COLLECTION, userId);
    const merchantSnap = await getDoc(merchantRef);
    const exists = merchantSnap.exists();
    
    if (exists) {
      console.log(`✅ [merchantsService] Usuário ${userId} encontrado na coleção 'merchants'`);
    } else {
      console.log(`⚠️ [merchantsService] Usuário ${userId} NÃO encontrado na coleção 'merchants'`);
    }
    
    return exists;
  } catch (error: any) {
    console.error("❌ [merchantsService] Erro ao verificar se é lojista:", error);
    console.error("❌ [merchantsService] Código do erro:", error?.code);
    console.error("❌ [merchantsService] Mensagem do erro:", error?.message);
    return false;
  }
}
