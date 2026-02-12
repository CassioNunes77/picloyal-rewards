import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Plus, MapPin, Phone, Clock, ChevronRight, Loader2, Edit, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getMerchantStores, type StoreData } from "@/services/merchantsService";
import MerchantStoreEditForm from "@/components/merchant/MerchantStoreEditForm";
import MerchantBottomNav from "@/components/merchant/MerchantBottomNav";

export default function MerchantStoresPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);

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

  const handleEditStore = (store: StoreData) => {
    setEditingStore(store);
  };

  const handleStoreSuccess = () => {
    setEditingStore(null);
    loadStores();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero pb-8 pt-12 px-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/merchant/dashboard")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Lojas
            </h1>
            <p className="text-white/90 text-sm mt-1">
              Gerencie suas lojas cadastradas
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 pb-8">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          {editingStore ? (
            <MerchantStoreEditForm
              store={editingStore}
              onCancel={() => setEditingStore(null)}
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
                Nenhuma loja cadastrada
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Cadastre sua primeira loja no Dashboard
              </p>
              <Button
                onClick={() => navigate("/merchant/dashboard")}
                className="gradient-primary text-primary-foreground hover:opacity-95 transition-opacity shadow-md"
              >
                Ir para Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground">
                    Suas Lojas
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stores.length} {stores.length === 1 ? "loja cadastrada" : "lojas cadastradas"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => navigate(`/merchant/store/${store.id}`)}
                    className="bg-background rounded-xl p-4 border border-border hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Store className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-card-foreground">
                            {store.name}
                          </h3>
                          {store.active ? (
                            <span className="px-2 py-0.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
                              Ativa
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                              Inativa
                            </span>
                          )}
                        </div>
                        
                        {store.address && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <MapPin className="h-4 w-4" />
                            <span>{store.address}</span>
                          </div>
                        )}
                        
                        {store.city && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <span>{store.city}</span>
                          </div>
                        )}
                        
                        {store.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Phone className="h-4 w-4" />
                            <span>{store.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStore(store);
                          }}
                          className="h-8 w-8 p-0"
                          title="Editar loja"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <MerchantBottomNav />
    </div>
  );
}
