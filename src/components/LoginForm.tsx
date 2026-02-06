import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup";

export default function LoginForm() {
  const { signIn, signUp, authError, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      } else {
        await signUp(email.trim(), password);
        toast.success("Conta criada com sucesso!");
      }
    } catch {
      toast.error(authError ?? "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-card-foreground">
          {mode === "signin" ? "Entrar" : "Criar conta"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "signin"
            ? "Use seu e-mail e senha para acessar"
            : "Preencha os dados para se cadastrar"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              autoComplete="email"
              disabled={loading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
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
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
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
        className="w-full text-center text-sm text-primary hover:underline"
      >
        {mode === "signin"
          ? "Não tem conta? Cadastre-se"
          : "Já tem conta? Entrar"}
      </button>
    </div>
  );
}
