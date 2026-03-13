import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Plus, MapPin, Phone, Clock, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MerchantStoreForm from "@/components/merchant/MerchantStoreForm";
import { useAuth } from "@/contexts/AuthContext";
import { getMerchantStores, type StoreData } from "@/services/merchantsService";

export default function MerchantStoresPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showStoreForm, setShowStoreForm] = useState(false);
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

  const handleStoreSuccess = () => {
    setShowStoreForm(false);
    loadStores();
    toast.success("Loja cadastrada com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero pb-8 pt-12 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Suas Lojas
          </h1>
          <p className="text-white/90 text-sm mt-1">
            Gerencie e cadastre suas lojas
          </p>
        </div>
      </div>

      <div className="px-6 -mt-6 pb-8 max-w-7xl mx-auto w-full">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          {showStoreForm ? (
            <MerchantStoreForm
              onCancel={() => setShowStoreForm(false)}
              onSuccess={handleStoreSuccess}
            />
          ) : loadingStores ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Carregando lojas...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Cadastre sua loja
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Preencha os dados da sua loja para começar a usar o Core+
              </p>
              <Button
                onClick={() => setShowStoreForm(true)}
                className="gradient-primary text-primary-foreground hover:opacity-95 transition-opacity shadow-md"
              >
                <Plus className="h-5 w-5 mr-2" />
                Cadastrar Loja
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-end">
                <Button
                  onClick={() => setShowStoreForm(true)}
                  size="sm"
                  className="gradient-primary text-primary-foreground hover:opacity-95 transition-opacity shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Loja
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => navigate(`/merchant/store/${store.id}`)}
                    className="bg-background rounded-lg p-2 border border-border hover:shadow-sm transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                        {store.photoURL ? (
                          <img src={store.photoURL} alt={store.name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-medium text-card-foreground text-xs truncate">
                            {store.name}
                          </h3>
                          {store.active ? (
                            <span className="px-1 py-0.5 rounded bg-green-100 text-green-700 text-[8px] font-medium shrink-0">
                              Ativa
                            </span>
                          ) : (
                            <span className="px-1 py-0.5 rounded bg-gray-100 text-gray-700 text-[8px] font-medium shrink-0">
                              Inativa
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {store.city}{store.phone ? ` • ${store.phone}` : ""}
                        </p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>
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
