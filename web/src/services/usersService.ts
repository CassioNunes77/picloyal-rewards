import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

const COLLECTION_NAME = "users";

/**
 * Interface para dados do usuário no Firestore
 */
export interface UserData {
  // Dados básicos do Firebase Auth
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  
  // Dados adicionais do perfil
  phone?: string;
  
  // Preferências do usuário
  preferences?: {
    darkMode?: boolean;
    notifications?: boolean;
  };
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
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
