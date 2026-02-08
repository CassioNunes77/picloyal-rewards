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

export interface Category {
  id: string;
  name: string;
  icon: string; // Nome do ícone da Lucide React
  active: boolean;
  productsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryData {
  name: string;
  icon: string;
  active: boolean;
  productsCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const COLLECTION_NAME = "categories";

/**
 * Converte um documento do Firestore para o tipo Category
 */
function firestoreToCategory(docId: string, data: any): Category {
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
      console.warn("⚠️ [categoriesService] createdAt inválido, usando data atual:", data.createdAt);
      createdAt = new Date();
    }

    if (data.updatedAt && data.updatedAt.toDate) {
      updatedAt = data.updatedAt.toDate();
    } else if (data.updatedAt && data.updatedAt instanceof Date) {
      updatedAt = data.updatedAt;
    } else if (data.updatedAt && typeof data.updatedAt === 'number') {
      updatedAt = new Date(data.updatedAt);
    } else {
      console.warn("⚠️ [categoriesService] updatedAt inválido, usando data atual:", data.updatedAt);
      updatedAt = new Date();
    }

    return {
      id: docId,
      name: data.name || "",
      icon: data.icon || "Tag",
      active: data.active !== undefined ? data.active : true,
      productsCount: data.productsCount || 0,
      createdAt,
      updatedAt,
    };
  } catch (error) {
    console.error("❌ [categoriesService] Erro ao converter documento:", error, "Data:", data);
    throw error;
  }
}

/**
 * Converte um Category para o formato do Firestore
 */
function categoryToFirestore(category: Omit<Category, "id" | "createdAt" | "updatedAt">): Omit<CategoryData, "createdAt" | "updatedAt"> {
  return {
    name: category.name,
    icon: category.icon,
    active: category.active,
    productsCount: category.productsCount,
  };
}

/**
 * Busca todas as categorias
 */
export async function getAllCategories(): Promise<Category[]> {
  if (!firestore) {
    console.error("❌ [categoriesService] Firestore não está configurado");
    throw new Error("Firestore não está configurado");
  }

  try {
    console.log("🔍 [categoriesService] Buscando todas as categorias...");
    const categoriesRef = collection(firestore, COLLECTION_NAME);
    
    let querySnapshot;
    try {
      const q = query(categoriesRef, orderBy("createdAt", "desc"));
      querySnapshot = await getDocs(q);
      console.log("✅ [categoriesService] Query com orderBy funcionou:", querySnapshot.docs.length, "documentos");
    } catch (orderByError: any) {
      console.warn("⚠️ [categoriesService] Erro com orderBy, tentando sem ordenação:", orderByError.message);
      if (orderByError.code === "failed-precondition") {
        console.warn("⚠️ [categoriesService] Índice necessário no Firestore. Criando query sem orderBy...");
      }
      querySnapshot = await getDocs(categoriesRef);
      console.log("✅ [categoriesService] Query sem orderBy funcionou:", querySnapshot.docs.length, "documentos");
    }

    const categories = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log("📄 [categoriesService] Processando documento:", doc.id, "- Nome:", data.name);
      return firestoreToCategory(doc.id, data);
    });

    // Ordenar manualmente se não usou orderBy
    if (categories.length > 0 && !categories[0].createdAt) {
      console.warn("⚠️ [categoriesService] Categorias sem createdAt, ordenando por nome");
      categories.sort((a, b) => a.name.localeCompare(b.name));
    } else if (categories.length > 0) {
      categories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    console.log("✅ [categoriesService] Total de categorias retornadas:", categories.length);
    return categories;
  } catch (error) {
    console.error("❌ [categoriesService] Erro ao buscar categorias:", error);
    throw error;
  }
}

/**
 * Busca apenas categorias ativas
 */
export async function getActiveCategories(): Promise<Category[]> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const categoriesRef = collection(firestore, COLLECTION_NAME);
    let q;
    try {
      q = query(
        categoriesRef,
        where("active", "==", true),
        orderBy("createdAt", "desc")
      );
    } catch (orderByError: any) {
      console.warn("⚠️ [categoriesService] Erro com orderBy, tentando sem ordenação:", orderByError.message);
      q = query(categoriesRef, where("active", "==", true));
    }
    const querySnapshot = await getDocs(q);

    const categories = querySnapshot.docs.map((doc) =>
      firestoreToCategory(doc.id, doc.data())
    );

    // Ordenar manualmente se necessário
    if (categories.length > 0 && categories[0].createdAt) {
      categories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      categories.sort((a, b) => a.name.localeCompare(b.name));
    }

    return categories;
  } catch (error) {
    console.error("Erro ao buscar categorias ativas:", error);
    throw error;
  }
}

/**
 * Adiciona uma nova categoria
 */
export async function addCategory(
  category: Omit<Category, "id" | "createdAt" | "updatedAt" | "productsCount">
): Promise<string> {
  console.log("🔍 [categoriesService] addCategory chamado com:", category);
  
  if (!firestore) {
    console.error("❌ [categoriesService] Firestore não está configurado!");
    throw new Error("Firestore não está configurado. Verifique as variáveis de ambiente do Firebase.");
  }

  // Validar dados obrigatórios
  if (!category.name || !category.icon) {
    const missing = [];
    if (!category.name) missing.push("name");
    if (!category.icon) missing.push("icon");
    console.error("❌ [categoriesService] Dados obrigatórios faltando:", missing);
    throw new Error(`Campos obrigatórios faltando: ${missing.join(", ")}`);
  }

  try {
    const now = Timestamp.now();
    const categoryData: CategoryData = {
      name: category.name.trim(),
      icon: category.icon.trim(),
      active: category.active !== undefined ? category.active : true,
      productsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    console.log("💾 [categoriesService] Salvando no Firestore:", JSON.stringify(categoryData, null, 2));
    console.log("📁 [categoriesService] Coleção:", COLLECTION_NAME);
    console.log("🔐 [categoriesService] Firestore instance:", !!firestore);

    try {
      const categoriesRef = collection(firestore, COLLECTION_NAME);
      console.log("📝 [categoriesService] Collection reference criada:", !!categoriesRef);
      
      console.log("⏳ [categoriesService] Chamando addDoc...");
      const docRef = await addDoc(categoriesRef, categoryData);
      console.log("✅ [categoriesService] addDoc retornou com ID:", docRef.id);
      console.log("✅ [categoriesService] Document path:", docRef.path);

      // Verificar se o documento foi realmente salvo
      console.log("🔍 [categoriesService] Verificando se documento foi salvo...");
      const verifyRef = doc(firestore, COLLECTION_NAME, docRef.id);
      const verifyDoc = await getDoc(verifyRef);
      if (verifyDoc.exists()) {
        console.log("✅ [categoriesService] Documento confirmado no Firestore:", verifyDoc.data());
      } else {
        console.error("❌ [categoriesService] Documento NÃO encontrado após salvar!");
      }

      console.log("✅ [categoriesService] Categoria salva com sucesso! ID:", docRef.id);
      return docRef.id;
    } catch (addDocError: any) {
      console.error("❌ [categoriesService] Erro DURANTE addDoc:", addDocError);
      console.error("❌ [categoriesService] Código do erro:", addDocError?.code);
      console.error("❌ [categoriesService] Mensagem do erro:", addDocError?.message);
      console.error("❌ [categoriesService] Stack do erro:", addDocError?.stack);
      throw addDocError;
    }
  } catch (error: any) {
    console.error("❌ [categoriesService] Erro ao adicionar categoria:", error);
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
      throw new Error(`Erro ao salvar categoria: ${error?.message || "Erro desconhecido"}`);
    }
  }
}

/**
 * Atualiza uma categoria existente
 */
export async function updateCategory(
  categoryId: string,
  updates: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const categoryRef = doc(firestore, COLLECTION_NAME, categoryId);
    const updateData: Partial<CategoryData> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(categoryRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    throw error;
  }
}

/**
 * Deleta uma categoria
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const categoryRef = doc(firestore, COLLECTION_NAME, categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    throw error;
  }
}

/**
 * Alterna o status ativo/inativo de uma categoria
 */
export async function toggleCategoryActive(categoryId: string, currentActive: boolean): Promise<void> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }

  try {
    const categoryRef = doc(firestore, COLLECTION_NAME, categoryId);
    await updateDoc(categoryRef, {
      active: !currentActive,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao alternar status da categoria:", error);
    throw error;
  }
}

/**
 * Escuta mudanças em tempo real nas categorias
 */
export function subscribeToCategories(
  callback: (categories: Category[]) => void,
  activeOnly: boolean = false
): () => void {
  if (!firestore) {
    console.error("❌ [categoriesService] Firestore não está configurado!");
    console.error("Verifique se as variáveis de ambiente do Firebase estão configuradas:");
    console.error("- VITE_FIREBASE_API_KEY");
    console.error("- VITE_FIREBASE_AUTH_DOMAIN");
    console.error("- VITE_FIREBASE_PROJECT_ID");
    callback([]);
    return () => {};
  }

  try {
    console.log("🔍 [categoriesService] Configurando listener do Firestore para coleção:", COLLECTION_NAME);
    const categoriesRef = collection(firestore, COLLECTION_NAME);
    
    // Tentar query com orderBy primeiro
    let q;
    try {
      q = activeOnly
        ? query(categoriesRef, where("active", "==", true), orderBy("createdAt", "desc"))
        : query(categoriesRef, orderBy("createdAt", "desc"));
      console.log("✅ [categoriesService] Query com orderBy criada com sucesso");
    } catch (orderByError: any) {
      // Se orderBy falhar (pode precisar de índice), tenta sem orderBy
      console.warn("⚠️ [categoriesService] Erro com orderBy, tentando sem ordenação:", orderByError.message);
      if (orderByError.code === "failed-precondition") {
        console.warn("⚠️ [categoriesService] Índice necessário no Firestore. Usando query sem orderBy...");
        console.warn("💡 Para criar o índice, vá no Firebase Console > Firestore > Indexes");
      }
      q = activeOnly
        ? query(categoriesRef, where("active", "==", true))
        : query(categoriesRef);
    }

    console.log("👂 [categoriesService] Configurando onSnapshot...");
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        console.log("📥 [categoriesService] Snapshot recebido:", querySnapshot.docs.length, "documentos");
        
        if (querySnapshot.docs.length === 0) {
          console.log("ℹ️ [categoriesService] Nenhum documento encontrado na coleção", COLLECTION_NAME);
          callback([]);
          return;
        }

        const categories: Category[] = [];
        querySnapshot.docs.forEach((doc) => {
          try {
            const data = doc.data();
            console.log("📄 [categoriesService] Processando documento:", doc.id, "- Nome:", data.name);
            const category = firestoreToCategory(doc.id, data);
            categories.push(category);
          } catch (error) {
            console.error("❌ [categoriesService] Erro ao processar documento", doc.id, ":", error);
          }
        });

        // Ordenar manualmente se não usou orderBy
        if (categories.length > 0 && categories[0].createdAt) {
          categories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }

        console.log("✅ [categoriesService] Categorias processadas e ordenadas:", categories.length);
        callback(categories);
      },
      (error: any) => {
        console.error("❌ [categoriesService] Erro ao escutar mudanças nas categorias:", error);
        console.error("Detalhes do erro:", {
          code: error?.code,
          message: error?.message,
          stack: error?.stack,
        });
        
        // Mensagens de erro mais específicas
        if (error?.code === "permission-denied") {
          console.error("❌ [categoriesService] Permissão negada. Verifique as regras de segurança do Firestore.");
        } else if (error?.code === "unavailable") {
          console.error("❌ [categoriesService] Firestore indisponível. Verifique sua conexão.");
        }
        
        // Tenta callback com array vazio para não travar a UI
        callback([]);
      }
    );

    console.log("✅ [categoriesService] Listener configurado com sucesso");
    return unsubscribe;
  } catch (error: any) {
    console.error("❌ [categoriesService] Erro ao configurar listener de categorias:", error);
    console.error("Detalhes:", {
      code: error?.code,
      message: error?.message,
    });
    callback([]); // Retorna array vazio em caso de erro
    return () => {};
  }
}
