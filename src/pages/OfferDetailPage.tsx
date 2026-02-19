import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronRight,
  MapPin,
  Clock,
  Tag,
  Sparkles,
  Percent,
  Gift,
  Coffee,
  Pizza,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { createRedemption, getUserRedemptionForOffer, type RedemptionStatus } from "@/services/redemptionsService";

export interface OfferDetailData {
  id: string | number;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  merchantId?: string;
  icon?: "percent" | "gift" | "coffee" | "pizza";
  category?: string;
  pointsRequired?: number;
  isNew?: boolean;
}

const iconMap = {
  percent: Percent,
  gift: Gift,
  coffee: Coffee,
  pizza: Pizza,
};

const OfferDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const state = location.state as { offer: OfferDetailData; storeName?: string } | null;
  const offer = state?.offer;
  const storeName = state?.storeName ?? offer?.storeName;

  const [redemptionStatus, setRedemptionStatus] = useState<RedemptionStatus | null>(null);
  const [loadingRedemption, setLoadingRedemption] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Busca status ao abrir e ao voltar: lembra se usuário já solicitou ou resgatou
  // location.key garante refetch ao navegar de volta para esta página
  useEffect(() => {
    if (!user?.uid || !offer?.id) {
      setLoadingRedemption(false);
      return;
    }
    setLoadingRedemption(true);
    getUserRedemptionForOffer(user.uid, String(offer.id))
      .then((r) => {
        setRedemptionStatus(r?.status ?? null);
      })
      .catch(() => setRedemptionStatus(null))
      .finally(() => setLoadingRedemption(false));
  }, [user?.uid, offer?.id, location.key]);

  if (!offer) {
    navigate("/offers", { replace: true });
    return null;
  }

  const Icon = offer.icon && iconMap[offer.icon] ? iconMap[offer.icon] : Tag;

  const handleUseOffer = async () => {
    if (!user) {
      toast.error("Faça login para usar esta oferta");
      return;
    }
    if (!offer.storeId || !offer.merchantId) return;
    if (isSubmitting || redemptionStatus === "pending") return;
    setIsSubmitting(true);
    try {
      await createRedemption(
        String(offer.id),
        offer.title,
        offer.storeId,
        storeName ?? offer.storeName ?? "",
        offer.merchantId,
        user.uid,
        user.displayName ?? user.email?.split("@")[0] ?? "Usuário",
        user.email ?? ""
      );
      setRedemptionStatus("pending");
      toast.success("Oferta solicitada! Aguarde a confirmação do estabelecimento.", {
        description: storeName ? `Apresente em ${storeName}` : "Apresente no estabelecimento.",
      });
    } catch (err) {
      console.error("Erro ao registrar resgate:", err);
      toast.error("Erro ao solicitar oferta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const detailContent = (
    <>
      <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border mb-6">
        <div className="p-6">
          <div className="flex gap-4 mb-4">
            <div
              className={`
                flex h-16 w-16 items-center justify-center rounded-xl shrink-0
                ${offer.icon === "coffee" ? "gradient-primary" : ""}
                ${offer.icon === "pizza" ? "bg-orange-500" : ""}
                ${offer.icon === "gift" ? "gradient-secondary" : ""}
                ${!offer.icon || offer.icon === "percent" ? "bg-blue-500" : ""}
              `}
            >
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="text-lg font-bold text-card-foreground">{offer.title}</h2>
                {offer.isNew && (
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-destructive text-destructive-foreground text-xs font-bold">
                    NOVO
                  </span>
                )}
              </div>
              <div className="gradient-secondary text-secondary-foreground font-bold text-lg px-3 py-2 rounded-xl inline-block">
                {offer.discount}
              </div>
            </div>
          </div>

          <p className="text-card-foreground mb-4">{offer.description}</p>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Válido até {offer.validUntil}</span>
            </div>
            {(storeName || offer.storeName) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{storeName ?? offer.storeName}</span>
              </div>
            )}
            {offer.storeAddress && (
              <div className="flex items-center gap-2 pl-6">
                <span className="text-muted-foreground">{offer.storeAddress}</span>
              </div>
            )}
            {offer.pointsRequired != null && offer.pointsRequired > 0 && (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span>{offer.pointsRequired} pontos necessários</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {loadingRedemption ? (
        <div className="w-full py-4 rounded-xl bg-muted flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : redemptionStatus === "confirmed" ? (
        <div className="w-full py-4 rounded-xl bg-green-500/80 text-white font-semibold text-base text-center">
          Oferta Resgatada
        </div>
      ) : redemptionStatus === "pending" ? (
        <div className="w-full py-4 rounded-xl bg-orange-500/80 text-white font-semibold text-base text-center">
          Oferta Solicitada
        </div>
      ) : (
        <button
          type="button"
          onClick={handleUseOffer}
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-semibold text-base
                   transition-all duration-200 active:scale-[0.98] shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            "Usar oferta"
          )}
        </button>
      )}

      <p className="text-center text-xs text-muted-foreground mt-4">
        Apresente esta tela ou o cupom ativado no estabelecimento
      </p>
    </>
  );

  if (!isMobile) {
    return (
      <div className="min-h-full bg-background">
        <div className="pb-4">
          <h1 className="text-xl font-bold text-card-foreground">Detalhes da Oferta</h1>
        </div>
        <div className="pt-2">{detailContent}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-secondary">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-foreground/20 
                         transition-all duration-200 active:scale-90 active:bg-secondary-foreground/30"
            >
              <ChevronRight className="h-5 w-5 text-secondary-foreground rotate-180" />
            </button>
            <h1 className="text-lg font-bold text-secondary-foreground flex-1 line-clamp-1">
              Detalhes da Oferta
            </h1>
          </div>
        </header>
      </div>

      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        <div className="animate-fade-in">{detailContent}</div>
        <div className="h-6" />
      </div>
    </div>
  );
};

export default OfferDetailPage;
