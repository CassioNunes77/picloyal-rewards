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
    throw new Error("Firestore não está configurado");
  }

  try {
    const regionsRef = collection(firestore, COLLECTION_NAME);
    const q = query(regionsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) =>
      firestoreToRegion(doc.id, doc.data() as RegionData)
    );
  } catch (error) {
    console.error("Erro ao buscar regiões:", error);
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
    console.error("Firestore não está configurado");
    return () => {};
  }

  try {
    const regionsRef = collection(firestore, COLLECTION_NAME);
    const q = activeOnly
      ? query(regionsRef, where("active", "==", true), orderBy("createdAt", "desc"))
      : query(regionsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const regions = querySnapshot.docs.map((doc) =>
          firestoreToRegion(doc.id, doc.data() as RegionData)
        );
        callback(regions);
      },
      (error) => {
        console.error("Erro ao escutar mudanças nas regiões:", error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Erro ao configurar listener de regiões:", error);
    return () => {};
  }
}
