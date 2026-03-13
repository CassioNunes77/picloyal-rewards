import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Store, Tag, TrendingUp, ChevronRight, Gift, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getMerchantStores } from "@/services/merchantsService";
import { getOffersCountByMerchant } from "@/services/offersService";
import { getMerchantRedemptions, type RedemptionData } from "@/services/redemptionsService";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function MerchantDashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [storesCount, setStoresCount] = useState(0);
  const [offersCount, setOffersCount] = useState(0);
  const [recentRedemptions, setRecentRedemptions] = useState<RedemptionData[]>([]);

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
      
      getOffersCountByMerchant(user.uid)
        .then((count) => setOffersCount(count))
        .catch(() => setOffersCount(0));
      
      getMerchantRedemptions(user.uid)
        .then((redemptions) => setRecentRedemptions(redemptions.slice(0, 5)))
        .catch(() => setRecentRedemptions([]));
    }
  }, [user?.uid]);
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

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

      <div className="px-6 -mt-6 pb-8 max-w-7xl mx-auto w-full space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-card-foreground">{storesCount}</p>
            <p className="text-[10px] text-muted-foreground">Lojas</p>
          </div>
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 mb-2">
              <Tag className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-xl font-bold text-card-foreground">{offersCount}</p>
            <p className="text-[10px] text-muted-foreground">Ofertas</p>
          </div>
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-card-foreground">—</p>
            <p className="text-[10px] text-muted-foreground">Visitas</p>
          </div>
        </div>

        {/* Acesso rápido */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <h2 className="text-sm font-semibold text-card-foreground mb-3">
            Acesso rápido
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/merchant/stores")}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Store className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Suas Lojas</p>
                  <p className="text-xs text-muted-foreground">Cadastrar e gerenciar lojas</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Últimos Resgates */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-card-foreground">
              Últimos Resgates
            </h2>
            <button
              onClick={() => navigate("/merchant/redemptions")}
              className="text-xs text-primary font-medium"
            >
              Ver todos
            </button>
          </div>
          {recentRedemptions.length === 0 ? (
            <div className="text-center py-6">
              <Gift className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Nenhum resgate ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentRedemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    redemption.status === "confirmed" ? "bg-green-500/10" : "bg-amber-500/10"
                  }`}>
                    <Gift className={`h-4 w-4 ${
                      redemption.status === "confirmed" ? "text-green-500" : "text-amber-500"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {redemption.offerTitle}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {redemption.storeName} • {redemption.userName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      redemption.status === "confirmed" 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {redemption.status === "confirmed" ? "Confirmado" : "Pendente"}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-end gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDate(redemption.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
