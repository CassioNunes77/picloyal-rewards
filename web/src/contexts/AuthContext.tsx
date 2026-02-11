import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isMerchant } from "@/services/merchantsService";
import { isUser, createOrUpdateUser } from "@/services/usersService";

function getGoogleErrorMessage(e: unknown): string {
  const err = e as { code?: string; message?: string } | null;
  if (!err || typeof err !== "object") return "Erro ao entrar com Google. Tente novamente.";
  const code = err.code as string | undefined;
  const msg = (err.message as string) ?? "";
  if (code === "auth/unauthorized-domain") {
    return "Este site não está autorizado no Firebase. Em Firebase Console → Authentication → Authorized domains, adicione o domínio (ex.: cardcorevo.netlify.app).";
  }
  if (code === "auth/operation-not-allowed") {
    return "Login com Google não está ativado. Em Firebase Console → Authentication → Sign-in method, ative o provedor Google.";
  }
  if (code === "auth/popup-blocked") {
    return "O popup foi bloqueado. Permita popups para este site ou tente novamente.";
  }
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "Login cancelado.";
  }
  if (msg.includes("access_denied") || msg.toLowerCase().includes("consent") || msg.includes("test user")) {
    return "Se o app Google está em modo Teste: em Google Cloud Console → OAuth consent screen → Test users, adicione seu e-mail. Ou publique o app para permitir qualquer conta.";
  }
  if (msg && typeof msg === "string") return msg;
  return "Erro ao entrar com Google. Abra o Console (F12) e veja o código do erro para mais detalhes.";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    getRedirectResult(auth)
      .catch(() => {})
      .finally(() => {});
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Verificar se está em rota de lojista antes de bloquear
      const isMerchantRoute = window.location.pathname.startsWith('/merchant');
      
      // Se for lojista tentando acessar área de usuário comum (e não estiver em rota de lojista), bloquear
      if (firebaseUser && !isMerchantRoute) {
        try {
          const merchantExists = await isMerchant(firebaseUser.uid);
          if (merchantExists) {
            // Se for lojista tentando acessar área de usuário comum, fazer logout e redirecionar
            console.log("❌ [AuthContext] Lojista tentou acessar área de usuário comum. Redirecionando para login do lojista.");
            await firebaseSignOut(auth);
            setUser(null);
            setLoading(false);
            // Redirecionar para login do lojista
            window.location.href = '/merchant/login';
            return;
          }
        } catch (error) {
          console.error("❌ [AuthContext] Erro ao verificar se é lojista:", error);
          // Em caso de erro, não fazer logout se estiver em rota de lojista
          if (!isMerchantRoute) {
            await firebaseSignOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }
        }
      }
      
      setUser(firebaseUser);
      
      // Persistir usuário no Firestore quando fizer login (apenas se não for lojista)
      if (firebaseUser) {
        try {
          // Verificar se não é lojista antes de criar em users
          const merchantExists = await isMerchant(firebaseUser.uid);
          if (!merchantExists) {
            // Apenas criar/atualizar em users se não for lojista
            console.log("🔍 [AuthContext] Usuário autenticado, persistindo no Firestore (users)...");
            await createOrUpdateUser(firebaseUser);
            console.log("✅ [AuthContext] Usuário persistido no Firestore com sucesso");
          } else {
            console.log("ℹ️ [AuthContext] Usuário é lojista, não criando em users");
          }
        } catch (error) {
          console.error("❌ [AuthContext] Erro ao persistir usuário no Firestore:", error);
          // Não bloqueia o login se houver erro ao persistir no Firestore
        }
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase não configurado. Configure as variáveis no Netlify.");
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      
      // Verificar se é lojista (existe em merchants)
      const merchantExists = await isMerchant(userId);
      if (merchantExists) {
        // Se for lojista, fazer logout e mostrar erro
        await firebaseSignOut(auth);
        throw new Error("Esta conta é de um lojista. Use o login do painel do lojista.");
      }
      
      // Verificar se existe em users (usuário comum)
      const userExists = await isUser(userId);
      if (!userExists) {
        // Se não existir em users, fazer logout e mostrar erro
        await firebaseSignOut(auth);
        throw new Error("Conta não encontrada. Crie uma conta primeiro.");
      }
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Erro ao entrar. Tente novamente.";
      setAuthError(message);
      throw e;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase não configurado. Configure as variáveis no Netlify.");
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      
      // Verificar se já existe em merchants (não deveria acontecer, mas verificar por segurança)
      const merchantExists = await isMerchant(userId);
      if (merchantExists) {
        // Se já for lojista, fazer logout e mostrar erro
        await firebaseSignOut(auth);
        throw new Error("Esta conta já é de um lojista. Use o login do painel do lojista.");
      }
      
      // createOrUpdateUser já cria em users, então não precisamos fazer nada adicional
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Erro ao criar conta. Tente novamente.";
      setAuthError(message);
      throw e;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    console.log("[Auth] Entrar com Google: início");
    if (!auth) {
      const msg = "Firebase não configurado. Configure as variáveis no Netlify.";
      setAuthError(msg);
      console.error("[Auth] Entrar com Google:", msg);
      throw new Error(msg);
    }
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const userId = userCredential.user.uid;
      
      // Verificar se é lojista (existe em merchants)
      const merchantExists = await isMerchant(userId);
      if (merchantExists) {
        // Se for lojista, fazer logout e mostrar erro
        await firebaseSignOut(auth);
        throw new Error("Esta conta é de um lojista. Use o login do painel do lojista.");
      }
      
      console.log("[Auth] Entrar com Google: sucesso");
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string } | null;
      console.error("[Auth] Entrar com Google falhou:", err?.code ?? "unknown", err?.message ?? e);
      if (err && typeof err === "object" && err.code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: unknown) {
          const msg = getGoogleErrorMessage(redirectErr);
          setAuthError(msg);
          throw new Error(msg);
        }
      }
      const message = getGoogleErrorMessage(e);
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    if (auth) await firebaseSignOut(auth);
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    authError,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
