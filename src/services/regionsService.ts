import {
  collection,
  doc,
  getDocs,
  getDoc,
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
function firestoreToRegion(docId: string, data: any): Region {
  try {
    // Validar e converter timestamps
    let createdAt: Date;
    let updatedAt: Date;

    if (data.createdAt && data.createdAt.toDate) {
      createdAt = data.createdAt.toDate();
    } else if (data.createdAt && data.createdAt instanceof Date) {
      createdAt = data.createdAt;
    } else if (data.createdAt && typeof data.createdAt === 'number') {
      createdAt = new Date(data.createdAt);
    } else {
      console.warn("⚠️ [regionsService] createdAt inválido, usando data atual:", data.createdAt);
      createdAt = new Date();
    }

    if (data.updatedAt && data.updatedAt.toDate) {
      updatedAt = data.updatedAt.toDate();
    } else if (data.updatedAt && data.updatedAt instanceof Date) {
      updatedAt = data.updatedAt;
    } else if (data.updatedAt && typeof data.updatedAt === 'number') {
      updatedAt = new Date(data.updatedAt);
    } else {
      console.warn("⚠️ [regionsService] updatedAt inválido, usando data atual:", data.updatedAt);
      updatedAt = new Date();
    }

    return {
      id: docId,
      name: data.name || "",
      state: data.state || "",
      stateName: data.stateName || "",
      city: data.city || "",
      cityId: data.cityId || "",
      country: data.country || "Brasil",
      active: data.active !== undefined ? data.active : true,
      storesCount: data.storesCount || 0,
      createdAt,
      updatedAt,
    };
  } catch (error) {
    console.error("❌ [regionsService] Erro ao converter documento:", error, "Data:", data);
    throw error;
  }
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
    let q;
    try {
      q = query(
        regionsRef,
        where("active", "==", true),
        orderBy("createdAt", "desc")
      );
    } catch (orderByError: any) {
      console.warn("⚠️ [regionsService] Erro com orderBy, tentando sem ordenação:", orderByError.message);
      q = query(regionsRef, where("active", "==", true));
    }
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
 * Conta o total de regiões ativas
 */
export async function getActiveRegionsCount(): Promise<number> {
  console.log("🔍 [regionsService] getActiveRegionsCount chamado");
  
  if (!firestore) {
    console.error("❌ [regionsService] Firestore não está configurado!");
    return 0;
  }

  try {
    const regionsRef = collection(firestore, COLLECTION_NAME);
    let q;
    try {
      q = query(regionsRef, where("active", "==", true));
    } catch (error: any) {
      console.warn("⚠️ [regionsService] Erro ao criar query, tentando buscar todas e filtrar:", error.message);
      // Fallback: buscar todas e filtrar manualmente
      const allRegions = await getAllRegions();
      const activeCount = allRegions.filter(r => r.active).length;
      console.log("✅ [regionsService] Total de regiões ativas (fallback):", activeCount);
      return activeCount;
    }
    
    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size;
    console.log("✅ [regionsService] Total de regiões ativas:", count);
    return count;
  } catch (error: any) {
    console.error("❌ [regionsService] Erro ao contar regiões ativas:", error);
    // Fallback: buscar todas e filtrar manualmente
    try {
      const allRegions = await getAllRegions();
      const activeCount = allRegions.filter(r => r.active).length;
      console.log("✅ [regionsService] Total de regiões ativas (fallback):", activeCount);
      return activeCount;
    } catch (fallbackError) {
      console.error("❌ [regionsService] Erro no fallback:", fallbackError);
      return 0;
    }
  }
}

/**
 * Adiciona uma nova região
 */
export async function addRegion(
  region: Omit<Region, "id" | "createdAt" | "updatedAt" | "storesCount">
): Promise<string> {
  console.log("🔍 [regionsService] addRegion chamado com:", region);
  
  if (!firestore) {
    console.error("❌ [regionsService] Firestore não está configurado!");
    throw new Error("Firestore não está configurado. Verifique as variáveis de ambiente do Firebase.");
  }

  // Validar dados obrigatórios
  if (!region.name || !region.state || !region.city) {
    const missing = [];
    if (!region.name) missing.push("name");
    if (!region.state) missing.push("state");
    if (!region.city) missing.push("city");
    console.error("❌ [regionsService] Dados obrigatórios faltando:", missing);
    throw new Error(`Campos obrigatórios faltando: ${missing.join(", ")}`);
  }

  try {
    const now = Timestamp.now();
    const regionData: RegionData = {
      name: region.name.trim(),
      state: region.state.trim(),
      stateName: region.stateName?.trim() || region.state.trim(),
      city: region.city.trim(),
      cityId: region.cityId || "",
      country: region.country || "Brasil",
      active: region.active !== undefined ? region.active : true,
      storesCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    console.log("💾 [regionsService] Salvando no Firestore:", JSON.stringify(regionData, null, 2));
    console.log("📁 [regionsService] Coleção:", COLLECTION_NAME);
    console.log("🔐 [regionsService] Firestore instance:", !!firestore);
    console.log("🔐 [regionsService] Firestore app:", firestore?.app?.name);

    try {
      const regionsRef = collection(firestore, COLLECTION_NAME);
      console.log("📝 [regionsService] Collection reference criada:", !!regionsRef);
      
      console.log("⏳ [regionsService] Chamando addDoc...");
      const docRef = await addDoc(regionsRef, regionData);
      console.log("✅ [regionsService] addDoc retornou com ID:", docRef.id);
      console.log("✅ [regionsService] Document path:", docRef.path);

      // Verificar se o documento foi realmente salvo
      console.log("🔍 [regionsService] Verificando se documento foi salvo...");
      const verifyRef = doc(firestore, COLLECTION_NAME, docRef.id);
      const verifyDoc = await getDoc(verifyRef);
      if (verifyDoc.exists()) {
        console.log("✅ [regionsService] Documento confirmado no Firestore:", verifyDoc.data());
      } else {
        console.error("❌ [regionsService] Documento NÃO encontrado após salvar!");
      }

      console.log("✅ [regionsService] Região salva com sucesso! ID:", docRef.id);
      return docRef.id;
    } catch (addDocError: any) {
      console.error("❌ [regionsService] Erro DURANTE addDoc:", addDocError);
      console.error("❌ [regionsService] Código do erro:", addDocError?.code);
      console.error("❌ [regionsService] Mensagem do erro:", addDocError?.message);
      console.error("❌ [regionsService] Stack do erro:", addDocError?.stack);
      throw addDocError;
    }
  } catch (error: any) {
    console.error("❌ [regionsService] Erro ao adicionar região:", error);
    console.error("Detalhes do erro:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    
    // Mensagem de erro mais amigável
    if (error?.code === "permission-denied") {
      throw new Error("Permissão negada. Verifique as regras de segurança do Firestore.");
    } else if (error?.code === "unavailable") {
      throw new Error("Firestore indisponível. Verifique sua conexão com a internet.");
    } else {
      throw new Error(`Erro ao salvar região: ${error?.message || "Erro desconhecido"}`);
    }
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
 * Busca todas as cidades únicas cadastradas no Firebase (incluindo desativadas)
 * Retorna array de strings com formato "Cidade - UF"
 */
export async function getAllCities(): Promise<string[]> {
  if (!firestore) {
    console.error("❌ [regionsService] Firestore não está configurado");
    throw new Error("Firestore não está configurado");
  }

  try {
    console.log("🔍 [regionsService] Buscando todas as cidades...");
    const regionsRef = collection(firestore, COLLECTION_NAME);
    const querySnapshot = await getDocs(regionsRef);

    // Extrair cidades únicas com formato "Cidade - UF"
    const citiesSet = new Set<string>();
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data() as RegionData;
      if (data.city && data.state) {
        const cityDisplay = `${data.city} - ${data.state}`;
        citiesSet.add(cityDisplay);
      }
    });

    // Converter para array e ordenar alfabeticamente
    const cities = Array.from(citiesSet).sort((a, b) => a.localeCompare(b, "pt-BR"));
    console.log("✅ [regionsService] Total de cidades únicas encontradas:", cities.length);
    return cities;
  } catch (error) {
    console.error("❌ [regionsService] Erro ao buscar cidades:", error);
    throw error;
  }
}

/**
 * Escuta mudanças em tempo real nas regiões
 */
export function subscribeToRegions(
  callback: (regions: Region[]) => void,
  activeOnly: boolean = false
): () => void {
  if (!firestore) {
    console.error("❌ [regionsService] Firestore não está configurado!");
    console.error("Verifique se as variáveis de ambiente do Firebase estão configuradas:");
    console.error("- VITE_FIREBASE_API_KEY");
    console.error("- VITE_FIREBASE_AUTH_DOMAIN");
    console.error("- VITE_FIREBASE_PROJECT_ID");
    callback([]);
    return () => {};
  }

  try {
    console.log("🔍 [regionsService] Configurando listener do Firestore para coleção:", COLLECTION_NAME);
    const regionsRef = collection(firestore, COLLECTION_NAME);
    
    // Tentar query com orderBy primeiro
    let q;
    try {
      q = activeOnly
        ? query(regionsRef, where("active", "==", true), orderBy("createdAt", "desc"))
        : query(regionsRef, orderBy("createdAt", "desc"));
      console.log("✅ [regionsService] Query com orderBy criada com sucesso");
    } catch (orderByError: any) {
      // Se orderBy falhar (pode precisar de índice), tenta sem orderBy
      console.warn("⚠️ [regionsService] Erro com orderBy, tentando sem ordenação:", orderByError.message);
      if (orderByError.code === "failed-precondition") {
        console.warn("⚠️ [regionsService] Índice necessário no Firestore. Usando query sem orderBy...");
        console.warn("💡 Para criar o índice, vá no Firebase Console > Firestore > Indexes");
      }
      q = activeOnly
        ? query(regionsRef, where("active", "==", true))
        : query(regionsRef);
    }

    console.log("👂 [regionsService] Configurando onSnapshot...");
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        console.log("📥 [regionsService] Snapshot recebido:", querySnapshot.docs.length, "documentos");
        
        if (querySnapshot.docs.length === 0) {
          console.log("ℹ️ [regionsService] Nenhum documento encontrado na coleção", COLLECTION_NAME);
          callback([]);
          return;
        }

        const regions: Region[] = [];
        querySnapshot.docs.forEach((doc) => {
          try {
            const data = doc.data();
            console.log("📄 [regionsService] Processando documento:", doc.id, "- Nome:", data.name);
            const region = firestoreToRegion(doc.id, data);
            regions.push(region);
          } catch (error) {
            console.error("❌ [regionsService] Erro ao processar documento", doc.id, ":", error);
          }
        });

        // Ordenar manualmente se não usou orderBy
        if (regions.length > 0 && regions[0].createdAt) {
          regions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }

        console.log("✅ [regionsService] Regiões processadas e ordenadas:", regions.length);
        callback(regions);
      },
      (error: any) => {
        console.error("❌ [regionsService] Erro ao escutar mudanças nas regiões:", error);
        console.error("Detalhes do erro:", {
          code: error?.code,
          message: error?.message,
          stack: error?.stack,
        });
        
        // Mensagens de erro mais específicas
        if (error?.code === "permission-denied") {
          console.error("❌ [regionsService] Permissão negada. Verifique as regras de segurança do Firestore.");
        } else if (error?.code === "unavailable") {
          console.error("❌ [regionsService] Firestore indisponível. Verifique sua conexão.");
        }
        
        // Tenta callback com array vazio para não travar a UI
        callback([]);
      }
    );

    console.log("✅ [regionsService] Listener configurado com sucesso");
    return unsubscribe;
  } catch (error: any) {
    console.error("❌ [regionsService] Erro ao configurar listener de regiões:", error);
    console.error("Detalhes:", {
      code: error?.code,
      message: error?.message,
    });
    callback([]); // Retorna array vazio em caso de erro
    return () => {};
  }
}
