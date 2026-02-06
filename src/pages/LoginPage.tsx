import { useState, useEffect } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup";

const SPLASH_DURATION_MS = 1800;

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn, signUp, authError, clearError } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-white/90 text-lg font-medium">Carregando...</div>
      </div>
    );
  }

  /* Splash: tela cheia com gradiente + nome do app */
  if (!splashDone) {
    return (
      <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-8 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-white/20 mb-6 animate-scale-in" />
        <h1 className="text-3xl font-bold text-white tracking-tight text-center">
          Cartão Fidelidade
        </h1>
        <p className="text-white/90 text-base mt-3 text-center">
          Seu cartão de benefícios e descontos
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-in">
      {/* Topo: gradiente + nome do app (estilo PINEE) */}
      <div className="gradient-hero rounded-b-[2rem] pb-12 pt-14 px-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Cartão Fidelidade
        </h1>
        <p className="text-white/90 text-base mt-2">
          Seu cartão de benefícios e descontos
        </p>
      </div>

      {/* Card branco central com formulário */}
      <div className="flex-1 px-6 -mt-6">
        <div className="bg-card rounded-3xl shadow-xl shadow-black/5 p-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-card-foreground mb-1">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "signin"
              ? "Use seu e-mail e senha para acessar"
              : "Preencha os dados para se cadastrar"}
          </p>

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
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === "signin" ? (
                "Entrar"
              ) : (
                "Criar conta"
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
        </div>
      </div>
    </div>
  );
}
