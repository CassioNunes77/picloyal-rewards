import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  username: "corevostartup",
  password: "Caio@Elis@Cassio",
};

const ADMIN_SESSION_KEY = "admin_session_x7k9";

const ADMIN_FIREBASE_EMAIL = import.meta.env.VITE_ADMIN_FIREBASE_EMAIL ?? "";
const ADMIN_FIREBASE_PASSWORD = import.meta.env.VITE_ADMIN_FIREBASE_PASSWORD ?? "";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há sessão salva
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (session === "authenticated") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (
      username !== ADMIN_CREDENTIALS.username ||
      password !== ADMIN_CREDENTIALS.password
    ) {
      return false;
    }
    setIsAuthenticated(true);
    localStorage.setItem(ADMIN_SESSION_KEY, "authenticated");

    // Fazer login no Firebase Auth para permitir operações no Firestore (regiões, categorias, etc.)
    if (auth && ADMIN_FIREBASE_EMAIL && ADMIN_FIREBASE_PASSWORD) {
      try {
        await signInWithEmailAndPassword(auth, ADMIN_FIREBASE_EMAIL, ADMIN_FIREBASE_PASSWORD);
      } catch (err) {
        console.warn("⚠️ [AdminAuth] Falha ao autenticar no Firebase. Regiões/categorias podem não ser editáveis:", err);
      }
    } else if (!ADMIN_FIREBASE_EMAIL || !ADMIN_FIREBASE_PASSWORD) {
      console.warn("⚠️ [AdminAuth] VITE_ADMIN_FIREBASE_EMAIL e VITE_ADMIN_FIREBASE_PASSWORD não configurados. Configure no .env para adicionar regiões/categorias.");
    }
    return true;
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
    localStorage.removeItem(ADMIN_SESSION_KEY);
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
