import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Store, Tag, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getMerchantStores } from "@/services/merchantsService";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function MerchantDashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [storesCount, setStoresCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/merchant/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.uid) {
      getMerchantStores(user.uid)
        .then((stores) => setStoresCount(stores.length))
        .catch(() => setStoresCount(0));
    }
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      if (!auth) {
        toast.error("Erro de configuração. Tente novamente.");
        navigate("/merchant/login", { replace: true });
        return;
      }
      await signOut(auth);
      toast.success("Logout realizado com sucesso");
      navigate("/merchant/login", { replace: true });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
      navigate("/merchant/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero pb-8 pt-12 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Painel do Lojista
              </h1>
              <p className="text-white/90 text-sm mt-1">
                Visão geral do seu negócio
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 pb-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Card Resumo */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Resumo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{storesCount}</p>
                <p className="text-sm text-muted-foreground">Lojas cadastradas</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                <Tag className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">—</p>
                <p className="text-sm text-muted-foreground">Ofertas ativas</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">—</p>
                <p className="text-sm text-muted-foreground">Visualizações (30 dias)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acesso rápido */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Acesso rápido
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/merchant/stores")}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Suas Lojas</p>
                  <p className="text-sm text-muted-foreground">Cadastrar e gerenciar lojas</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
