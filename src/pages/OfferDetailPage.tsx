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
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { createRedemption } from "@/services/redemptionsService";

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

  if (!offer) {
    navigate("/offers", { replace: true });
    return null;
  }

  const Icon = offer.icon && iconMap[offer.icon] ? iconMap[offer.icon] : Tag;

  const handleUseOffer = async () => {
    if (offer.storeId && offer.merchantId && user) {
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
      } catch (err) {
        console.error("Erro ao registrar resgate:", err);
      }
    }
    toast.success(`🎉 Oferta "${offer.title}" ativada!`, {
      description: storeName
        ? `Apresente este cupom em ${storeName}`
        : "Apresente este cupom no estabelecimento.",
    });
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

      <button
        type="button"
        onClick={handleUseOffer}
        className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-semibold text-base
                 transition-all duration-200 active:scale-[0.98] shadow-md"
      >
        Usar oferta
      </button>

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
