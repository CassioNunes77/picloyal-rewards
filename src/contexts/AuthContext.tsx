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
  signInWithCredential,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  updateEmail as firebaseUpdateEmail,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { isIOSWebView, loginWithAppleNative, loginWithGoogleNative } from "@/lib/nativeBridge";
import { createOrUpdateUser } from "@/services/usersService";
import { isMerchant } from "@/services/merchantsService";
import { isUser } from "@/services/usersService";

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

function getAppleErrorMessage(e: unknown): string {
  const err = e as { code?: string; message?: string } | null;
  if (!err || typeof err !== "object") return "Erro ao entrar com Apple. Tente novamente.";
  const code = err.code as string | undefined;
  const msg = (err.message as string) ?? "";
  if (code === "auth/unauthorized-domain") {
    return "Este site não está autorizado no Firebase. Em Firebase Console → Authentication → Authorized domains, adicione o domínio.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Login com Apple não está ativado. Em Firebase Console → Authentication → Sign-in method, ative o provedor Apple.";
  }
  if (code === "auth/popup-blocked") {
    return "O popup foi bloqueado. Permita popups para este site ou tente novamente.";
  }
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "Login cancelado.";
  }
  if (msg && typeof msg === "string") return msg;
  return "Erro ao entrar com Apple. Tente novamente.";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  /** Reautenticar com e-mail/senha (para excluir conta após requires-recent-login). */
  reauthenticateWithPassword: (password: string) => Promise<void>;
  /** Reautenticar com Google (para excluir conta após requires-recent-login). */
  reauthenticateWithGoogle: () => Promise<void>;
  /** Atualizar e-mail do usuário (requer senha para reautenticação). Não disponível para conta Google. */
  updateEmail: (newEmail: string, password: string) => Promise<void>;
  /** Perfil do usuário em Firestore. */
  getProfile: () => Promise<{ phone?: string; address?: string; city?: string; state?: string; birthDate?: string; displayName?: string }>;
  updatePhone: (phone: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updateAddress: (address: string, city?: string, state?: string) => Promise<void>;
  updateBirthDate: (birthDate: string) => Promise<void>;
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
          // O usuário ainda pode usar o app, mas os dados não serão salvos
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
      let userCredential;
      if (isIOSWebView()) {
        const { idToken } = await loginWithGoogleNative();
        const credential = GoogleAuthProvider.credential(idToken);
        userCredential = await signInWithCredential(auth, credential);
      } else {
        userCredential = await signInWithPopup(auth, provider);
      }
      const userId = userCredential.user.uid;
      const merchantExists = await isMerchant(userId);
      if (merchantExists) {
        await firebaseSignOut(auth);
        throw new Error("Esta conta é de um lojista. Use o login do painel do lojista.");
      }
      console.log("[Auth] Entrar com Google: sucesso");
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string } | null;
      console.error("[Auth] Entrar com Google falhou:", err?.code ?? "unknown", err?.message ?? e);
      if (err && typeof err === "object" && err.code === "auth/popup-blocked" && !isIOSWebView()) {
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

  const signInWithApple = useCallback(async () => {
    console.log("[Auth] Entrar com Apple: início");
    if (!auth) {
      const msg = "Firebase não configurado. Configure as variáveis no Netlify.";
      setAuthError(msg);
      console.error("[Auth] Entrar com Apple:", msg);
      throw new Error(msg);
    }
    setAuthError(null);
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    provider.setCustomParameters({ locale: "pt-BR" });
    try {
      let userCredential;
      if (isIOSWebView()) {
        const { idToken, rawNonce } = await loginWithAppleNative();
        const credential = provider.credential({ idToken, rawNonce });
        userCredential = await signInWithCredential(auth, credential);
      } else {
        userCredential = await signInWithPopup(auth, provider);
      }
      const userId = userCredential.user.uid;
      const merchantExists = await isMerchant(userId);
      if (merchantExists) {
        await firebaseSignOut(auth);
        throw new Error("Esta conta é de um lojista. Use o login do painel do lojista.");
      }
      console.log("[Auth] Entrar com Apple: sucesso");
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string } | null;
      console.error("[Auth] Entrar com Apple falhou:", err?.code ?? "unknown", err?.message ?? e);
      const message = getAppleErrorMessage(e);
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

  const getProfile = useCallback(async (): Promise<{ phone?: string; address?: string; city?: string; state?: string; birthDate?: string; displayName?: string }> => {
    const u = auth?.currentUser;
    if (!u || !firestore) return {};
    const snap = await getDoc(doc(firestore, "users", u.uid));
    const data = snap.data() as { phone?: string; address?: string; city?: string; state?: string; birthDate?: string; displayName?: string } | undefined;
    return {
      ...data,
      displayName: data?.displayName ?? u.displayName ?? undefined,
    };
  }, []);

  const updatePhone = useCallback(async (phone: string) => {
    const u = auth?.currentUser;
    if (!u || !firestore) throw new Error("Nenhum usuário logado.");
    await setDoc(doc(firestore, "users", u.uid), { phone }, { merge: true });
  }, []);

  const updateDisplayName = useCallback(async (displayName: string) => {
    const u = auth?.currentUser;
    if (!u) throw new Error("Nenhum usuário logado.");
    await firebaseUpdateProfile(u, { displayName });
    if (firestore) {
      await setDoc(doc(firestore, "users", u.uid), { displayName }, { merge: true });
    }
  }, []);

  const updateAddress = useCallback(async (address: string, city?: string, state?: string) => {
    const u = auth?.currentUser;
    if (!u || !firestore) throw new Error("Nenhum usuário logado.");
    const data: Record<string, string> = { address };
    if (city?.trim()) data.city = city.trim();
    if (state?.trim()) data.state = state.trim();
    await setDoc(doc(firestore, "users", u.uid), data, { merge: true });
  }, []);

  const updateBirthDate = useCallback(async (birthDate: string) => {
    const u = auth?.currentUser;
    if (!u || !firestore) throw new Error("Nenhum usuário logado.");
    await setDoc(doc(firestore, "users", u.uid), { birthDate }, { merge: true });
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signOut,
    deleteAccount,
    reauthenticateWithPassword,
    reauthenticateWithGoogle,
    updateEmail,
    getProfile,
    updatePhone,
    updateDisplayName,
    updateAddress,
    updateBirthDate,
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
