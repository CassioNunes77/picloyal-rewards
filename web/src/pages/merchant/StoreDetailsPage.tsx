import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Store, MapPin, Phone, Clock, Tag, Calendar, Percent, Gift, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getMerchantStores, type StoreData } from "@/services/merchantsService";
import { getStoreOffers, createOffer, deleteOffer, type OfferData } from "@/services/offersService";
import OfferForm from "@/components/merchant/OfferForm";
import MerchantBottomNav from "@/components/merchant/MerchantBottomNav";

export default function StoreDetailsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);

  useEffect(() => {
    if (!user?.uid || !storeId) {
      navigate("/merchant/dashboard", { replace: true });
      return;
    }
    loadStore();
    loadOffers();
  }, [storeId, user?.uid]);

  const loadStore = async () => {
    if (!user?.uid || !storeId) return;
    
    try {
      const stores = await getMerchantStores(user.uid);
      const foundStore = stores.find((s) => s.id === storeId);
      if (foundStore) {
        setStore(foundStore);
      } else {
        toast.error("Loja não encontrada");
        navigate("/merchant/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Erro ao carregar loja:", error);
      toast.error("Erro ao carregar dados da loja");
      navigate("/merchant/dashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async () => {
    if (!storeId) return;
    
    setLoadingOffers(true);
    try {
      const storeOffers = await getStoreOffers(storeId);
      setOffers(storeOffers);
    } catch (error) {
      console.error("Erro ao carregar ofertas:", error);
      toast.error("Erro ao carregar ofertas");
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleOfferSuccess = () => {
    setShowOfferForm(false);
    loadOffers();
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!user?.uid || !confirm("Tem certeza que deseja excluir esta oferta?")) return;
    
    try {
      await deleteOffer(offerId, user.uid);
      toast.success("Oferta excluída com sucesso!");
      loadOffers();
    } catch (error: any) {
      console.error("Erro ao excluir oferta:", error);
      toast.error(error?.message || "Erro ao excluir oferta");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "bebidas":
        return "🥤";
      case "comida":
        return "🍕";
      case "brinde":
        return "🎁";
      case "geral":
        return "🏷️";
      default:
        return "🏷️";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return null;
  }

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
              {store.name}
            </h1>
            <p className="text-white/90 text-sm mt-1">
              Gerencie suas ofertas
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 pb-8">
        {/* Informações da Loja */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-6">
          <div className="space-y-3">
            {store.address && (
              <div className="flex items-center gap-3 text-card-foreground">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">{store.address}</span>
              </div>
            )}
            {store.city && (
              <div className="flex items-center gap-3 text-card-foreground">
                <span className="text-sm ml-8">{store.city}</span>
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-3 text-card-foreground">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">{store.phone}</span>
              </div>
            )}
            {store.hours && (
              <div className="flex items-start gap-3 text-card-foreground">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm whitespace-pre-line">{store.hours}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ofertas */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">
                Ofertas
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {offers.length} {offers.length === 1 ? "oferta cadastrada" : "ofertas cadastradas"}
              </p>
            </div>
            <Button
              onClick={() => setShowOfferForm(true)}
              size="sm"
              className="gradient-primary text-primary-foreground hover:opacity-95 transition-opacity shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Oferta
            </Button>
          </div>

          {showOfferForm ? (
            <OfferForm
              storeId={store.id!}
              merchantId={user?.uid || ""}
              onCancel={() => setShowOfferForm(false)}
              onSuccess={handleOfferSuccess}
            />
          ) : loadingOffers ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-muted-foreground">Carregando ofertas...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Nenhuma oferta cadastrada
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Crie sua primeira oferta para atrair mais clientes
              </p>
              <Button
                onClick={() => setShowOfferForm(true)}
                className="gradient-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Oferta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-background rounded-xl p-4 border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getCategoryIcon(offer.category)}</span>
                        <h3 className="font-semibold text-card-foreground">
                          {offer.title}
                        </h3>
                        {offer.discount && (
                          <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                            {offer.discount}
                          </span>
                        )}
                        {!offer.active && (
                          <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                            Inativa
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {offer.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Válido até {formatDate(offer.validUntil)}</span>
                        </div>
                        {offer.pointsRequired && (
                          <div className="flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            <span>{offer.pointsRequired} pontos</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOffer(offer.id!)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <MerchantBottomNav />
    </div>
  );
}
