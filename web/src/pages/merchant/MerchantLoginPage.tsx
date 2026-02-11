import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isMerchant } from "@/services/merchantsService";

export default function MerchantLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    
    setLoading(true);
    try {
      // Fazer login no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userId = userCredential.user.uid;
      
      console.log(`🔍 [MerchantLoginPage] Verificando login de lojista para usuário: ${userId}`);
      
      // Verificar se o usuário existe APENAS na coleção merchants
      // Esta é a validação principal: o login só é permitido se o usuário existir em merchants
      const merchantExists = await isMerchant(userId);
      
      if (!merchantExists) {
        console.log(`❌ [MerchantLoginPage] Usuário ${userId} não encontrado na coleção 'merchants'. Login negado.`);
        // Se não for lojista, fazer logout e mostrar erro
        await signOut(auth);
        toast.error("Esta conta não é de um lojista. Use o login de usuário comum.");
        setLoading(false);
        return;
      }
      
      console.log(`✅ [MerchantLoginPage] Usuário ${userId} confirmado como lojista na coleção 'merchants'. Login permitido.`);
      
      // Se chegou aqui, é um lojista válido
      toast.success("Bem-vindo ao painel do lojista!");
      navigate("/merchant/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      const errorCode = error?.code;
      const errorMessage = error?.message;
      
      if (errorCode === "auth/user-not-found") {
        toast.error("Usuário não encontrado. Crie uma conta primeiro.");
      } else if (errorCode === "auth/wrong-password") {
        toast.error("E-mail ou senha incorretos");
      } else if (errorCode === "auth/invalid-email") {
        toast.error("E-mail inválido");
      } else {
        toast.error(errorMessage || "Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in" style={{
      background: 'linear-gradient(135deg, hsl(260 45% 20%) 0%, hsl(280 40% 25%) 50%, hsl(270 35% 30%) 100%)'
    }}>
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          {/* Topo: gradiente + nome do app */}
          <div className="gradient-hero pb-8 pt-10 px-6">
            <div className="flex items-center justify-center mb-4">
              <Store className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight text-center">
              Painel do Lojista
            </h1>
            <p className="text-white/90 text-sm mt-2 text-center">
              Gerencie sua loja e clientes
            </p>
          </div>

          {/* Card branco central com formulário */}
          <div className="p-8 animate-fade-in">
            <h2 className="text-xl font-semibold text-card-foreground mb-1">
              Entrar
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Use seu e-mail e senha para acessar
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-border bg-background"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-border bg-background"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold gradient-primary text-primary-foreground
                           hover:opacity-95 transition-opacity shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => navigate("/merchant/signup")}
              className="w-full mt-4 text-center text-sm font-medium text-primary hover:underline transition-colors"
            >
              Não tem conta lojista? Cadastre-se
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full mt-2 text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Voltar para o app
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
