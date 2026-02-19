import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

const COLLECTION_NAME = "admins";

export interface Admin {
  id: string; // UID do Firebase Auth
  email: string;
}

/**
 * Lista todos os administradores (requer que o usuário logado seja admin)
 */
export async function getAllAdmins(): Promise<Admin[]> {
  if (!firestore) {
    throw new Error("Firestore não está configurado");
  }
  const snapshot = await getDocs(collection(firestore, COLLECTION_NAME));
  return snapshot.docs.map((d) => ({
    id: d.id,
    email: d.data().email || "",
  }));
}
