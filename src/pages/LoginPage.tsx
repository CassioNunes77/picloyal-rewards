import { useState, useEffect } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Importar logo diretamente
const logoCorePlus = "/logo-core-plus.png";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

type Mode = "signin" | "signup";

const SPLASH_DURATION_MS = 1800;

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, signInWithApple, authError, clearError } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  if (user) {
    navigate("/home", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email.trim() || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        toast.success("Bem-vindo de volta!");
        navigate("/home", { replace: true });
      } else {
        await signUp(email.trim(), password);
        toast.success("Conta criada com sucesso!");
        navigate("/home", { replace: true });
      }
    } catch {
      toast.error(authError ?? "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Bem-vindo!");
      navigate("/home", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : (authError ?? "Erro ao entrar com Google. Tente novamente.");
      console.error("[LoginPage] Google sign-in error:", err);
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    clearError();
    setAppleLoading(true);
    try {
      await signInWithApple();
      toast.success("Bem-vindo!");
      navigate("/home", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : (authError ?? "Erro ao entrar com Apple. Tente novamente.");
      console.error("[LoginPage] Apple sign-in error:", err);
      toast.error(message);
    } finally {
      setAppleLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-white/90 text-lg font-medium">Carregando...</div>
      </div>
    );
  }

  /* Splash: tela cheia com gradiente + logo com animação similar ao iOS */
  if (!splashDone) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-8">
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[400px] md:h-[400px] flex items-center justify-center">
          <img 
            src="/logo-core-plus.png" 
            alt="Core+" 
            className="w-full h-full animate-splash-logo object-contain"
            style={{
              imageRendering: 'auto',
              mixBlendMode: 'normal',
              backgroundColor: 'transparent',
            }}
            onError={(e) => {
              console.error("❌ Erro ao carregar logo:", e);
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              // Mostrar fallback visual
              const fallback = img.nextElementSibling as HTMLElement;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
            onLoad={() => {
              console.log("✅ Logo carregada com sucesso");
            }}
          />
          {/* Fallback visual caso a imagem não carregue */}
          <div 
            className="hidden w-full h-full rounded-2xl bg-white/20 items-center justify-center animate-splash-logo"
            style={{ display: 'none' }}
          >
            <span className="text-4xl font-bold text-white">C+</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in" style={{
      background: 'linear-gradient(135deg, hsl(260 45% 20%) 0%, hsl(280 40% 25%) 50%, hsl(270 35% 30%) 100%)'
    }}>
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          {/* Topo: gradiente + logo */}
          <div className="gradient-hero h-32 px-6 flex items-center justify-center">
            <img 
              src="/logo-core-plus.png" 
              alt="Core+" 
              className="h-24 w-auto object-contain scale-[2]"
            />
          </div>

          {/* Card branco central com formulário */}
          <div className="p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-border bg-background"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-card-foreground">Senha</Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-border bg-background"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  disabled={loading}
                />
              </div>
            </div>
            {authError && (
              <p className="text-sm text-destructive">{authError}</p>
            )}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold gradient-primary text-primary-foreground
                         hover:opacity-95 transition-opacity shadow-md"
              disabled={loading || googleLoading || appleLoading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === "signin" ? (
                "Entrar"
              ) : (
                "Criar conta"
              )}
            </Button>

            <div className="relative my-5">
              <span className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </span>
              <span className="relative flex justify-center text-xs uppercase text-muted-foreground">
                ou
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl text-base font-medium border-border bg-background
                         hover:bg-muted/50 transition-colors"
              disabled={loading || googleLoading || appleLoading}
              onClick={handleAppleSignIn}
            >
              {appleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <AppleIcon className="h-5 w-5 mr-2" />
                  Entrar com Apple
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl text-base font-medium border-border bg-background
                         hover:bg-muted/50 transition-colors mt-2"
              disabled={loading || googleLoading || appleLoading}
              onClick={handleGoogleSignIn}
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <GoogleIcon className="h-5 w-5 mr-2" />
                  Entrar com Google
                </>
              )}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              clearError();
            }}
            className="w-full mt-4 text-center text-sm font-medium text-primary hover:underline"
          >
            {mode === "signin"
              ? "Não tem conta? Cadastre-se"
              : "Já tem conta? Entrar"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/merchant/login")}
            className="w-full mt-2 text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Entrar como Lojista
          </button>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
            <span>•</span>
            <Link to="/terms-of-use" className="hover:text-primary transition-colors">
              Termos de Uso
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
