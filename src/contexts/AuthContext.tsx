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
  deleteUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  updateEmail as firebaseUpdateEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

export const AUTH_REQUIRES_RECENT_LOGIN = "auth/requires-recent-login";

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
  deleteAccount: () => Promise<void>;
  /** Reautenticar com e-mail/senha (para excluir conta após requires-recent-login). */
  reauthenticateWithPassword: (password: string) => Promise<void>;
  /** Reautenticar com Google (para excluir conta após requires-recent-login). */
  reauthenticateWithGoogle: () => Promise<void>;
  /** Atualizar e-mail do usuário (requer senha para reautenticação). Não disponível para conta Google. */
  updateEmail: (newEmail: string, password: string) => Promise<void>;
  /** Perfil do usuário em Firestore (ex.: telefone). */
  getProfile: () => Promise<{ phone?: string }>;
  updatePhone: (phone: string) => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase não configurado. Configure as variáveis no Netlify.");
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      await createUserWithEmailAndPassword(auth, email, password);
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
      await signInWithPopup(auth, provider);
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

  const deleteAccount = useCallback(async () => {
    setAuthError(null);
    if (!auth?.currentUser) throw new Error("Nenhum usuário logado.");
    await deleteUser(auth.currentUser);
  }, []);

  const reauthenticateWithPassword = useCallback(async (password: string) => {
    const u = auth?.currentUser;
    if (!u?.email) throw new Error("Usuário sem e-mail. Use outra forma de login.");
    setAuthError(null);
    const credential = EmailAuthProvider.credential(u.email, password);
    await reauthenticateWithCredential(u, credential);
  }, []);

  const reauthenticateWithGoogle = useCallback(async () => {
    if (!auth?.currentUser) throw new Error("Nenhum usuário logado.");
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    await reauthenticateWithPopup(auth.currentUser, provider);
  }, []);

  const updateEmail = useCallback(async (newEmail: string, password: string) => {
    const u = auth?.currentUser;
    if (!u) throw new Error("Nenhum usuário logado.");
    setAuthError(null);
    const credential = EmailAuthProvider.credential(u.email ?? "", password);
    await reauthenticateWithCredential(u, credential);
    await firebaseUpdateEmail(u, newEmail);
  }, []);

  const getProfile = useCallback(async (): Promise<{ phone?: string }> => {
    const u = auth?.currentUser;
    if (!u || !firestore) return {};
    const snap = await getDoc(doc(firestore, "users", u.uid));
    return (snap.data() as { phone?: string }) ?? {};
  }, []);

  const updatePhone = useCallback(async (phone: string) => {
    const u = auth?.currentUser;
    if (!u || !firestore) throw new Error("Nenhum usuário logado.");
    await setDoc(doc(firestore, "users", u.uid), { phone }, { merge: true });
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    deleteAccount,
    reauthenticateWithPassword,
    reauthenticateWithGoogle,
    updateEmail,
    getProfile,
    updatePhone,
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
