import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

const ADMINS_COLLECTION = "admins";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

/** Verifica se o usuário autenticado está na coleção admins */
async function isAdminUser(uid: string): Promise<boolean> {
  if (!firestore) return false;
  try {
    const adminRef = doc(firestore, ADMINS_COLLECTION, uid);
    const snap = await getDoc(adminRef);
    return snap.exists();
  } catch {
    return false;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      const admin = await isAdminUser(user.uid);
      setIsAuthenticated(admin);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!auth) {
      console.error("❌ [AdminAuth] Firebase Auth não está configurado.");
      return false;
    }
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const admin = await isAdminUser(user.uid);
      if (!admin) {
        await signOut(auth);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn("Erro ao deslogar do Firebase:", err);
      }
    }
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
