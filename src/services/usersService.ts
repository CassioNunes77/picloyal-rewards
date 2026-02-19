import { doc, getDoc, setDoc, Timestamp, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import type { User } from "firebase/auth";

const COLLECTION_NAME = "users";

/**
 * Interface para dados do usuário no Firestore
 */
export type UserRole = "user" | "merchant";

export interface UserData {
  // Dados básicos do Firebase Auth
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  
  // Dados adicionais do perfil
  phone?: string;
  address?: string;
  birthDate?: string;
  
  // Role do usuário (user ou merchant)
  role?: UserRole;
  
  // Preferências do usuário
  preferences?: {
    darkMode?: boolean;
    notifications?: boolean;
  };
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  
  // Campos adicionais podem ser adicionados aqui conforme necessário
  // Exemplos:
  // points?: number;
  // stamps?: number;
  // rewards?: string[];
}

/**
 * Interface para dados do usuário no formato Firestore
 */
interface UserDataFirestore {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  phone?: string;
  address?: string;
  birthDate?: string;
  role?: UserRole;
  preferences?: {
    darkMode?: boolean;
    notifications?: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}

/**
 * Converte dados do Firestore para UserData
 */
function firestoreToUserData(docId: string, data: any): UserData {
  try {
    let createdAt: Date;
    let updatedAt: Date;
    let lastLoginAt: Date;
    
    if (data.createdAt && data.createdAt.toDate) {
      createdAt = data.createdAt.toDate();
    } else if (data.createdAt && data.createdAt instanceof Date) {
      createdAt = data.createdAt;
    } else if (data.createdAt && typeof data.createdAt === 'number') {
      createdAt = new Date(data.createdAt);
    } else {
      createdAt = new Date();
    }
    
    if (data.updatedAt && data.updatedAt.toDate) {
      updatedAt = data.updatedAt.toDate();
    } else if (data.updatedAt && data.updatedAt instanceof Date) {
      updatedAt = data.updatedAt;
    } else if (data.updatedAt && typeof data.updatedAt === 'number') {
      updatedAt = new Date(data.updatedAt);
    } else {
      updatedAt = new Date();
    }
    
    if (data.lastLoginAt && data.lastLoginAt.toDate) {
      lastLoginAt = data.lastLoginAt.toDate();
    } else if (data.lastLoginAt && data.lastLoginAt instanceof Date) {
      lastLoginAt = data.lastLoginAt;
    } else if (data.lastLoginAt && typeof data.lastLoginAt === 'number') {
      lastLoginAt = new Date(data.lastLoginAt);
    } else {
      lastLoginAt = new Date();
    }
    
    return {
      uid: docId,
      email: data.email || null,
      displayName: data.displayName || null,
      photoURL: data.photoURL || null,
      phoneNumber: data.phoneNumber || null,
      phone: data.phone || undefined,
      address: data.address || undefined,
      birthDate: data.birthDate || undefined,
      role: data.role || "user",
      preferences: data.preferences || undefined,
      createdAt,
      updatedAt,
      lastLoginAt,
    };
  } catch (error) {
    console.error("❌ [usersService] Erro ao converter documento:", error, "Data:", data);
    throw error;
  }
}

/**
 * Converte UserData para formato Firestore
 */
function userDataToFirestore(userData: Partial<UserData>): Partial<UserDataFirestore> {
  const now = Timestamp.now();
  const result: Partial<UserDataFirestore> = {
    updatedAt: now,
  };
  
  if (userData.uid !== undefined) result.uid = userData.uid;
  if (userData.email !== undefined) result.email = userData.email;
  if (userData.displayName !== undefined) result.displayName = userData.displayName;
  if (userData.photoURL !== undefined) result.photoURL = userData.photoURL;
  if (userData.phoneNumber !== undefined) result.phoneNumber = userData.phoneNumber;
  if (userData.phone !== undefined) result.phone = userData.phone;
  if (userData.address !== undefined) result.address = userData.address;
  if (userData.birthDate !== undefined) result.birthDate = userData.birthDate;
  if (userData.role !== undefined) result.role = userData.role;
  if (userData.preferences !== undefined) result.preferences = userData.preferences;
  if (userData.createdAt) {
    result.createdAt = userData.createdAt instanceof Timestamp 
      ? userData.createdAt 
      : Timestamp.fromDate(userData.createdAt);
  }
  if (userData.lastLoginAt) {
    result.lastLoginAt = userData.lastLoginAt instanceof Timestamp 
      ? userData.lastLoginAt 
      : Timestamp.fromDate(userData.lastLoginAt);
  }
  
  return result;
}

/**
 * Cria ou atualiza o documento do usuário no Firestore
 * Se o documento não existe, cria com todos os dados do Firebase Auth
 * Se já existe, atualiza apenas os campos que mudaram e o lastLoginAt
 */
export async function createOrUpdateUser(user: User): Promise<void> {
  console.log("🔍 [usersService] createOrUpdateUser chamado para:", user.uid);
  
  if (!firestore) {
    console.error("❌ [usersService] Firestore não está configurado!");
    throw new Error("Firestore não está configurado. Verifique as variáveis de ambiente do Firebase.");
  }
  
  try {
    const userRef = doc(firestore, COLLECTION_NAME, user.uid);
    const userSnap = await getDoc(userRef);
    
    const now = Timestamp.now();
    
    if (!userSnap.exists()) {
      // Criar novo documento do usuário
      console.log("📝 [usersService] Criando novo documento do usuário:", user.uid);
      const newUserData: UserDataFirestore = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };
      
      await setDoc(userRef, newUserData);
      console.log("✅ [usersService] Usuário criado com sucesso no Firestore:", user.uid);
    } else {
      // Atualizar documento existente
      console.log("🔄 [usersService] Atualizando documento existente do usuário:", user.uid);
      const existingData = userSnap.data();
      
      // Verificar se algum dado do Firebase Auth mudou
      const needsUpdate = 
        existingData.email !== user.email ||
        existingData.displayName !== user.displayName ||
        existingData.photoURL !== user.photoURL ||
        existingData.phoneNumber !== user.phoneNumber;
      
      if (needsUpdate || true) { // Sempre atualizar lastLoginAt
        const updateData: Partial<UserDataFirestore> = {
          lastLoginAt: now,
          updatedAt: now,
        };
        
        if (existingData.email !== user.email) updateData.email = user.email;
        if (existingData.displayName !== user.displayName) updateData.displayName = user.displayName;
        if (existingData.photoURL !== user.photoURL) updateData.photoURL = user.photoURL;
        if (existingData.phoneNumber !== user.phoneNumber) updateData.phoneNumber = user.phoneNumber;
        
        await updateDoc(userRef, updateData);
        console.log("✅ [usersService] Usuário atualizado no Firestore:", user.uid);
      } else {
        console.log("ℹ️ [usersService] Nenhuma atualização necessária para o usuário:", user.uid);
      }
    }
  } catch (error: any) {
    console.error("❌ [usersService] Erro ao criar/atualizar usuário:", error);
    console.error("Detalhes do erro:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    
    if (error?.code === "permission-denied") {
      throw new Error("Permissão negada. Verifique as regras de segurança do Firestore.");
    } else if (error?.code === "unavailable") {
      throw new Error("Firestore indisponível. Verifique sua conexão com a internet.");
    } else {
      throw new Error(`Erro ao salvar usuário: ${error?.message || "Erro desconhecido"}`);
    }
  }
}

/**
 * Busca dados do usuário no Firestore
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  console.log("🔍 [usersService] getUserData chamado para:", userId);
  
  if (!firestore) {
    console.error("❌ [usersService] Firestore não está configurado!");
    return null;
  }
  
  try {
    const userRef = doc(firestore, COLLECTION_NAME, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.log("ℹ️ [usersService] Usuário não encontrado no Firestore:", userId);
      return null;
    }
    
    const userData = firestoreToUserData(userSnap.id, userSnap.data());
    console.log("✅ [usersService] Dados do usuário recuperados:", userId);
    return userData;
  } catch (error: any) {
    console.error("❌ [usersService] Erro ao buscar dados do usuário:", error);
    return null;
  }
}

/**
 * Atualiza campos específicos do usuário no Firestore
 */
export async function updateUserData(
  userId: string,
  updates: Partial<Omit<UserData, "uid" | "createdAt">>
): Promise<void> {
  console.log("🔍 [usersService] updateUserData chamado para:", userId, "Updates:", updates);
  
  if (!firestore) {
    console.error("❌ [usersService] Firestore não está configurado!");
    throw new Error("Firestore não está configurado. Verifique as variáveis de ambiente do Firebase.");
  }
  
  try {
    const userRef = doc(firestore, COLLECTION_NAME, userId);
    
    // Se estamos atualizando preferências, mesclar com as existentes
    if (updates.preferences) {
      const userSnap = await getDoc(userRef);
      const existingData = userSnap.exists() ? userSnap.data() : null;
      const existingPreferences = existingData?.preferences || {};
      
      updates.preferences = {
        ...existingPreferences,
        ...updates.preferences,
      };
    }
    
    const updateData = userDataToFirestore(updates);
    
    await updateDoc(userRef, updateData);
    console.log("✅ [usersService] Dados do usuário atualizados:", userId);
  } catch (error: any) {
    console.error("❌ [usersService] Erro ao atualizar dados do usuário:", error);
    
    if (error?.code === "permission-denied") {
      throw new Error("Permissão negada. Verifique as regras de segurança do Firestore.");
    } else if (error?.code === "unavailable") {
      throw new Error("Firestore indisponível. Verifique sua conexão com a internet.");
    } else {
      throw new Error(`Erro ao atualizar usuário: ${error?.message || "Erro desconhecido"}`);
    }
  }
}

/**
 * Conta o total de usuários ativos no Firestore
 * Um usuário é considerado ativo se fez login nos últimos 30 dias
 * Se não houver lastLoginAt ou se a query falhar, conta todos os usuários cadastrados
 */
export async function getActiveUsersCount(): Promise<number> {
  console.log("🔍 [usersService] getActiveUsersCount chamado");
  
  if (!firestore) {
    console.error("❌ [usersService] Firestore não está configurado!");
    return 0;
  }
  
  // Verificar autenticação do Firebase Auth
  const { auth } = await import("@/lib/firebase");
  const currentUser = auth?.currentUser;
  console.log("🔐 [usersService] Usuário Firebase Auth atual:", currentUser?.uid || "Nenhum");
  
  if (!currentUser) {
    console.warn("⚠️ [usersService] Nenhum usuário autenticado no Firebase Auth. As regras do Firestore podem bloquear a leitura.");
    console.warn("⚠️ [usersService] Tentando buscar mesmo assim...");
  }
  
  try {
    console.log("📁 [usersService] Coleção:", COLLECTION_NAME);
    console.log("🔐 [usersService] Firestore instance:", !!firestore);
    
    // Primeiro, tentar buscar todos os usuários para verificar se há dados
    const usersRef = collection(firestore, COLLECTION_NAME);
    console.log("📝 [usersService] Collection reference criada:", !!usersRef);
    
    console.log("⏳ [usersService] Buscando todos os usuários...");
    const allUsersSnapshot = await getDocs(usersRef);
    
    console.log("📊 [usersService] Query executada. Empty?", allUsersSnapshot.empty);
    console.log("📊 [usersService] Total de documentos retornados:", allUsersSnapshot.size);
    
    if (allUsersSnapshot.empty) {
      console.log("ℹ️ [usersService] Nenhum usuário encontrado no Firestore");
      console.log("💡 [usersService] Possíveis causas:");
      console.log("   1. Não há usuários cadastrados");
      console.log("   2. Regras do Firestore estão bloqueando a leitura");
      console.log("   3. Não há usuário autenticado no Firebase Auth");
      return 0;
    }
    
    // Log detalhado de cada documento
    console.log("📋 [usersService] Detalhes dos documentos encontrados:");
    allUsersSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. ID: ${doc.id}`);
      console.log(`     Email: ${data.email || "N/A"}`);
      console.log(`     DisplayName: ${data.displayName || "N/A"}`);
      console.log(`     lastLoginAt: ${data.lastLoginAt ? (data.lastLoginAt.toDate ? data.lastLoginAt.toDate().toISOString() : data.lastLoginAt) : "N/A"}`);
      console.log(`     createdAt: ${data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : "N/A"}`);
    });
    
    // Verificar se os usuários têm lastLoginAt
    let usersWithLastLogin = 0;
    let usersWithoutLastLogin = 0;
    
    allUsersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.lastLoginAt) {
        usersWithLastLogin++;
      } else {
        usersWithoutLastLogin++;
      }
    });
    
    console.log("📊 [usersService] Usuários com lastLoginAt:", usersWithLastLogin);
    console.log("📊 [usersService] Usuários sem lastLoginAt:", usersWithoutLastLogin);
    
    // Se nenhum usuário tem lastLoginAt, retornar o total (todos são considerados ativos)
    if (usersWithLastLogin === 0) {
      console.log("⚠️ [usersService] Nenhum usuário tem lastLoginAt, retornando total como ativos:", allUsersSnapshot.size);
      return allUsersSnapshot.size;
    }
    
    // Tentar filtrar por data de login
    try {
      const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      console.log("📅 [usersService] Buscando usuários com lastLoginAt >= ", thirtyDaysAgo.toDate().toISOString());
      
      const q = query(usersRef, where("lastLoginAt", ">=", thirtyDaysAgo));
      const activeUsersSnapshot = await getDocs(q);
      
      const activeCount = activeUsersSnapshot.size;
      console.log("✅ [usersService] Usuários ativos (últimos 30 dias):", activeCount);
      
      // Se houver usuários sem lastLoginAt, adicionar ao total
      if (usersWithoutLastLogin > 0) {
        const totalActive = activeCount + usersWithoutLastLogin;
        console.log("✅ [usersService] Total de usuários ativos (incluindo sem lastLoginAt):", totalActive);
        return totalActive;
      }
      
      // Se não encontrou nenhum usuário ativo nos últimos 30 dias, mas há usuários cadastrados,
      // retornar o total (considerar todos como ativos se não há filtro válido)
      if (activeCount === 0 && allUsersSnapshot.size > 0) {
        console.log("⚠️ [usersService] Nenhum usuário ativo nos últimos 30 dias, mas há usuários cadastrados. Retornando total:", allUsersSnapshot.size);
        return allUsersSnapshot.size;
      }
      
      console.log("✅ [usersService] Retornando contagem de usuários ativos:", activeCount);
      return activeCount;
    } catch (queryError: any) {
      console.warn("⚠️ [usersService] Erro ao filtrar por data (índice pode não existir):", queryError.message);
      console.warn("⚠️ [usersService] Código do erro:", queryError.code);
      console.log("⚠️ [usersService] Retornando total de usuários como ativos:", allUsersSnapshot.size);
      // Se a query falhar (índice não criado), retornar todos os usuários como ativos
      return allUsersSnapshot.size;
    }
  } catch (error: any) {
    console.error("❌ [usersService] Erro ao contar usuários ativos:", error);
    console.error("❌ [usersService] Código do erro:", error?.code);
    console.error("❌ [usersService] Mensagem do erro:", error?.message);
    console.error("❌ [usersService] Stack do erro:", error?.stack);
    
    // Em caso de erro geral, tentar pelo menos contar todos os usuários
    try {
      console.log("🔄 [usersService] Tentando fallback: buscar todos os usuários...");
      const usersRef = collection(firestore, COLLECTION_NAME);
      const allUsersSnapshot = await getDocs(usersRef);
      console.log("⚠️ [usersService] Retornando total de usuários (fallback após erro):", allUsersSnapshot.size);
      return allUsersSnapshot.size;
    } catch (fallbackError: any) {
      console.error("❌ [usersService] Erro no fallback:", fallbackError);
      console.error("❌ [usersService] Código do erro (fallback):", fallbackError?.code);
      console.error("❌ [usersService] Mensagem do erro (fallback):", fallbackError?.message);
      return 0;
    }
  }
}

/**
 * Conta o total de usuários no Firestore
 */
export async function getTotalUsersCount(): Promise<number> {
  console.log("🔍 [usersService] getTotalUsersCount chamado");
  
  if (!firestore) {
    console.error("❌ [usersService] Firestore não está configurado!");
    return 0;
  }
  
  try {
    const usersRef = collection(firestore, COLLECTION_NAME);
    const querySnapshot = await getDocs(usersRef);
    
    const count = querySnapshot.size;
    console.log("✅ [usersService] Total de usuários:", count);
    return count;
  } catch (error: any) {
    console.error("❌ [usersService] Erro ao contar usuários:", error);
    return 0;
  }
}

/**
 * Verifica se o usuário existe na coleção users
 */
export async function isUser(userId: string): Promise<boolean> {
  if (!firestore) {
    return false;
  }
  
  try {
    const userRef = doc(firestore, COLLECTION_NAME, userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error: any) {
    console.error("❌ [usersService] Erro ao verificar se é usuário:", error);
    return false;
  }
}
