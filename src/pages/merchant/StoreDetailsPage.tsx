import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Store, Plus, MapPin, Phone, Clock, Tag, Calendar, Gift, Trash2, ArrowLeft, Loader2, Pencil, ChevronDown, Stamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getMerchantStores, type StoreData } from "@/services/merchantsService";
import { getStoreOffers, createOffer, deleteOffer, type OfferData } from "@/services/offersService";
import { getStoreStampRewards, type StampRewardData } from "@/services/stampRewardsService";
import OfferForm from "@/components/merchant/OfferForm";
import StampForm from "@/components/merchant/StampForm";
import MerchantStoreEditForm from "@/components/merchant/MerchantStoreEditForm";

export default function StoreDetailsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [stampRewards, setStampRewards] = useState<StampRewardData[]>([]);
  const [loadingStore, setLoadingStore] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showStampForm, setShowStampForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (storeId && user?.uid) {
      loadStore();
      loadOffers();
    }
  }, [storeId, user?.uid]);

  const loadStore = async () => {
    if (!storeId || !user?.uid) return;
    
    setLoadingStore(true);
    try {
      const merchantStores = await getMerchantStores(user.uid);
      const foundStore = merchantStores.find(s => s.id === storeId);
      if (foundStore) {
        setStore(foundStore);
      } else {
        toast.error("Loja não encontrada");
        navigate("/merchant/stores");
      }
    } catch (error) {
      console.error("Erro ao carregar loja:", error);
      toast.error("Erro ao carregar loja");
    } finally {
      setLoadingStore(false);
    }
  };

  const loadOffers = async () => {
    if (!storeId) return;
    
    setLoadingOffers(true);
    try {
      const [storeOffers, stamps] = await Promise.all([
        getStoreOffers(storeId),
        getStoreStampRewards(storeId),
      ]);
      setOffers(storeOffers);
      setStampRewards(stamps);
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
    toast.success("Oferta cadastrada com sucesso!");
  };

  const handleStampSuccess = () => {
    setShowStampForm(false);
    loadOffers();
    toast.success("Carimbo cadastrado com sucesso!");
  };

  const handleDeleteOffer = async () => {
    if (!offerToDelete || !user?.uid) return;
    
    try {
      await deleteOffer(offerToDelete, user.uid);
      toast.success("Oferta excluída com sucesso!");
      setOfferToDelete(null);
      loadOffers();
    } catch (error) {
      console.error("Erro ao excluir oferta:", error);
      toast.error("Erro ao excluir oferta");
    }
  };

  const getCategoryEmoji = (category: string) => {
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

  if (loadingStore) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero pb-8 pt-12 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/merchant/stores")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/20 flex items-center justify-center">
              {store.photoURL ? (
                <img src={store.photoURL} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="h-7 w-7 text-white" />
              )}
            </div>
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
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 pb-8 max-w-7xl mx-auto w-full">
        <div>
          {/* Informações da Loja */}
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-6">
          {showEditForm ? (
            <MerchantStoreEditForm
              store={store}
              onCancel={() => setShowEditForm(false)}
              onSuccess={() => {
                setShowEditForm(false);
                loadStore();
              }}
            />
          ) : (
            <>
              <div className="space-y-3">
                {store.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{store.address}</span>
                  </div>
                )}
                {store.city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{store.city}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{store.phone}</span>
                  </div>
                )}
                {store.hours && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{store.hours}</span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditForm(true)}
                className="mt-4"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar loja
              </Button>
            </>
          )}
        </div>

          {/* Seção de Ofertas */}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="gradient-primary text-primary-foreground hover:opacity-95 transition-opacity shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Oferta
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowOfferForm(true)}>
                  <Tag className="h-4 w-4 mr-2" />
                  Ofertas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowStampForm(true)}>
                  <Stamp className="h-4 w-4 mr-2" />
                  Carimbo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {showOfferForm ? (
            <OfferForm
              storeId={store.id}
              merchantId={user?.uid || ""}
              onCancel={() => setShowOfferForm(false)}
              onSuccess={handleOfferSuccess}
            />
          ) : showStampForm ? (
            <StampForm
              storeId={store.id}
              merchantId={user?.uid || ""}
              onCancel={() => setShowStampForm(false)}
              onSuccess={handleStampSuccess}
            />
          ) : loadingOffers ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Carregando ofertas...</p>
            </div>
          ) : offers.length === 0 && stampRewards.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Nenhuma oferta cadastrada
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Crie sua primeira oferta para atrair mais clientes
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gradient-primary text-primary-foreground hover:opacity-95 transition-opacity shadow-md">
                    <Plus className="h-5 w-5 mr-2" />
                    Criar Oferta
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem onClick={() => setShowOfferForm(true)}>
                    <Tag className="h-4 w-4 mr-2" />
                    Ofertas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowStampForm(true)}>
                    <Stamp className="h-4 w-4 mr-2" />
                    Carimbo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Carimbos cadastrados - acima das ofertas */}
              {stampRewards.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Stamp className="h-4 w-4" />
                    Carimbos ({stampRewards.length})
                  </h3>
                  <div className="space-y-2">
                    {stampRewards.map((sr) => (
                      <div
                        key={sr.id}
                        className="bg-background rounded-xl p-4 border border-border flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Stamp className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">
                              {sr.totalStamps} carimbos = {sr.rewardTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Programa ativo
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Ofertas */}
              {offers.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Ofertas ({offers.length})
                  </h3>
                  <div className="space-y-3">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-background rounded-xl p-4 border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getCategoryEmoji(offer.category)}</span>
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
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
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
                      onClick={() => setOfferToDelete(offer.id || null)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!offerToDelete} onOpenChange={(open) => !open && setOfferToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Oferta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta oferta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOffer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
