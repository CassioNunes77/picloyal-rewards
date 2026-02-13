import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Store, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getMerchantStores, type StoreData } from "@/services/merchantsService";

export default function MerchantOffersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadStores();
    }
  }, [user?.uid]);

  const loadStores = async () => {
    if (!user?.uid) return;
    setLoadingStores(true);
    try {
      const merchantStores = await getMerchantStores(user.uid);
      setStores(merchantStores);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      toast.error("Erro ao carregar lojas. Tente novamente.");
    } finally {
      setLoadingStores(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero pb-8 pt-12 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Suas Ofertas
          </h1>
          <p className="text-white/90 text-sm mt-1">
            Gerencie as ofertas de cada loja
          </p>
        </div>
      </div>

      <div className="px-6 -mt-6 pb-8 max-w-7xl mx-auto w-full">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          {loadingStores ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Carregando lojas...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Nenhuma loja cadastrada
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Cadastre uma loja para criar e gerenciar ofertas
              </p>
              <Button
                onClick={() => navigate("/merchant/stores")}
                className="gradient-primary text-primary-foreground hover:opacity-95 transition-opacity shadow-md"
              >
                Ir para Lojas
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Toque em uma loja para ver e gerenciar ofertas.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => navigate(`/merchant/store/${store.id}`)}
                    className="bg-background rounded-xl p-4 border border-border hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-card-foreground">
                          {store.name}
                        </h3>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Ver e gerenciar ofertas
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
