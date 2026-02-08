import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  type Firestore,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export interface Region {
  id: string;
  name: string;
  state: string; // Código UF (ex: "SP")
  stateName: string; // Nome completo do estado (ex: "São Paulo")
  city: string;
  cityId: string; // ID do IBGE da cidade
  country: string; // Sempre "Brasil"
  active: boolean;
  storesCount: number; // Será calculado dinamicamente no futuro
  createdAt: Date;
  updatedAt: Date;
}

export interface RegionData {
  name: string;
  state: string;
  stateName: string;
  city: string;
  cityId: string;
  country: string;
  active: boolean;
  storesCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const COLLECTION_NAME = "regions";

/**
 * Converte um documento do Firestore para o tipo Region
 */
function firestoreToRegion(docId: string, data: RegionData): Region {
  return {
    id: docId,
    name: data.name,
    state: data.state,
    stateName: data.stateName,
    city: data.city,
    cityId: data.cityId,
    country: data.country,
    active: data.active,
    storesCount: data.storesCount,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

/**
 * Converte um Region para o formato do Firestore
 */
function regionToFirestore(region: Omit<Region, "id" | "createdAt" | "updatedAt">): Omit<RegionData, "createdAt" | "updatedAt"> {
  return {
    name: region.name,
    state: region.state,
    stateName: region.stateName,
    city: region.city,
    cityId: region.cityId,
    country: region.country,
    active: region.active,
    storesCount: region.storesCount,
  };
}

/**
 * Busca todas as regiões disponíveis
 */
export async function getAllRegions(): Promise<Region[]> {
  if (!firestore) {
    console.error("❌ [regionsService] Firestore não está configurado");
    throw new Error("Firestore não está configurado");
  }

  try {
    console.log("🔍 [regionsService] Buscando todas as regiões...");
    const regionsRef = collection(firestore, COLLECTION_NAME);
    
    // Tentar com orderBy primeiro
    let querySnapshot;
    try {
      const q = query(regionsRef, orderBy("createdAt", "desc"));
      querySnapshot = await getDocs(q);
      console.log("✅ [regionsService] Query com orderBy funcionou:", querySnapshot.docs.length, "documentos");
    } catch (orderByError: any) {
      // Se orderBy falhar (pode precisar de índice), tenta sem orderBy
      console.warn("⚠️ [regionsService] Erro com orderBy, tentando sem ordenação:", orderByError.message);
      if (orderByError.code === "failed-precondition") {
        console.warn("⚠️ [regionsService] Índice necessário no Firestore. Criando query sem orderBy...");
      }
      querySnapshot = await getDocs(regionsRef);
      console.log("✅ [regionsService] Query sem orderBy funcionou:", querySnapshot.docs.length, "documentos");
    }

    const regions = querySnapshot.docs.map((doc) => {
      const data = doc.data() as RegionData;
      console.log("📄 [regionsService] Processando documento:", doc.id, "- Nome:", data.name);
      return firestoreToRegion(doc.id, data);
    });

    // Ordenar manualmente se não usou orderBy
    if (regions.length > 0 && !regions[0].createdAt) {
      console.warn("⚠️ [regionsService] Regiões sem createdAt, ordenando por nome");
      regions.sort((a, b) => a.name.localeCompare(b.name));
    } else if (regions.length > 0) {
      regions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    console.log("✅ [regionsService] Total de regiões retornadas:", regions.length);
    return regions;
  } catch (error) {
    console.error("❌ [regionsService] Erro ao buscar regiões:", error);
    throw error;
  }
}

/**
 * Busca apenas regiões ativas
 */
export async function getActiveRegions(): Promise<Region[]> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const regionsRef = collection(firestore, COLLECTION_NAME);
    const q = query(
      regionsRef,
      where("active", "==", true),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) =>
      firestoreToRegion(doc.id, doc.data() as RegionData)
    );
  } catch (error) {
    console.error("Erro ao buscar regiões ativas:", error);
    throw error;
  }
}

/**
 * Adiciona uma nova região
 */
export async function addRegion(
  region: Omit<Region, "id" | "createdAt" | "updatedAt" | "storesCount">
): Promise<string> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const now = Timestamp.now();
    const regionData: RegionData = {
      ...regionToFirestore({
        ...region,
        storesCount: 0,
      }),
      createdAt: now,
      updatedAt: now,
    };

    const regionsRef = collection(firestore, COLLECTION_NAME);
    const docRef = await addDoc(regionsRef, regionData);

    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar região:", error);
    throw error;
  }
}

/**
 * Atualiza uma região existente
 */
export async function updateRegion(
  regionId: string,
  updates: Partial<Omit<Region, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const regionRef = doc(firestore, COLLECTION_NAME, regionId);
    const updateData: Partial<RegionData> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(regionRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar região:", error);
    throw error;
  }
}

/**
 * Deleta uma região
 */
export async function deleteRegion(regionId: string): Promise<void> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const regionRef = doc(firestore, COLLECTION_NAME, regionId);
    await deleteDoc(regionRef);
  } catch (error) {
    console.error("Erro ao deletar região:", error);
    throw error;
  }
}

/**
 * Alterna o status ativo/inativo de uma região
 */
export async function toggleRegionActive(regionId: string, currentActive: boolean): Promise<void> {
  return updateRegion(regionId, { active: !currentActive });
}

/**
 * Escuta mudanças em tempo real nas regiões
 */
export function subscribeToRegions(
  callback: (regions: Region[]) => void,
  activeOnly: boolean = false
): () => void {
  if (!firestore) {
    console.error("❌ Firestore não está configurado");
    return () => {};
  }

  try {
    console.log("🔍 Configurando listener do Firestore para coleção:", COLLECTION_NAME);
    const regionsRef = collection(firestore, COLLECTION_NAME);
    
    // Tentar query com orderBy primeiro
    let q;
    try {
      q = activeOnly
        ? query(regionsRef, where("active", "==", true), orderBy("createdAt", "desc"))
        : query(regionsRef, orderBy("createdAt", "desc"));
    } catch (orderByError) {
      // Se orderBy falhar (pode precisar de índice), tenta sem orderBy
      console.warn("⚠️ Erro com orderBy, tentando sem ordenação:", orderByError);
      q = activeOnly
        ? query(regionsRef, where("active", "==", true))
        : query(regionsRef);
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        console.log("📥 Snapshot recebido:", querySnapshot.docs.length, "documentos");
        const regions = querySnapshot.docs.map((doc) => {
          const data = doc.data() as RegionData;
          console.log("📄 Documento:", doc.id, data);
          return firestoreToRegion(doc.id, data);
        });
        console.log("✅ Regiões processadas:", regions.length);
        callback(regions);
      },
      (error) => {
        console.error("❌ Erro ao escutar mudanças nas regiões:", error);
        console.error("Detalhes do erro:", {
          code: (error as any)?.code,
          message: (error as any)?.message,
          stack: (error as any)?.stack,
        });
        // Tenta callback com array vazio para não travar a UI
        callback([]);
      }
    );

    console.log("✅ Listener configurado com sucesso");
    return unsubscribe;
  } catch (error) {
    console.error("❌ Erro ao configurar listener de regiões:", error);
    callback([]); // Retorna array vazio em caso de erro
    return () => {};
  }
}
