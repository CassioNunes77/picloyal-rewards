import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  ShoppingCart,
  Gift,
  Tag,
  Coffee,
  UtensilsCrossed,
  Percent,
  Star,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export interface HistoryDetailData {
  id: string | number;
  title: string;
  description: string;
  date: string;
  points: number;
  type: "purchase" | "reward" | "points" | "offer";
  storeName: string;
  icon: "cup" | "gift" | "sparkles" | "tag" | "cart" | "fork" | "percent" | "star";
}

const iconMap = {
  cup: Coffee,
  gift: Gift,
  sparkles: Sparkles,
  tag: Tag,
  cart: ShoppingCart,
  fork: UtensilsCrossed,
  percent: Percent,
  star: Star,
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "purchase":
      return "gradient-primary";
    case "reward":
      return "gradient-secondary";
    case "points":
      return "bg-blue-500";
    case "offer":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

const HistoryDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const state = location.state as { item: HistoryDetailData } | null;
  const item = state?.item;

  if (!item) {
    navigate("/history", { replace: true });
    return null;
  }

  const Icon = iconMap[item.icon] || Clock;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `${item.title} - ${item.description}`,
        url: window.location.href,
      });
    } else {
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const detailContent = (
    <>
      <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border mb-6">
        <div className="p-6">
          <div className="flex gap-4 mb-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-xl shrink-0 ${getTypeColor(item.type)}`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="text-lg font-bold text-card-foreground">{item.title}</h2>
              </div>
              <div className={`flex items-center gap-2 mb-2 ${item.points > 0 ? "text-primary" : item.points < 0 ? "text-secondary" : "text-muted-foreground"}`}>
                {item.points !== 0 && (
                  <>
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span className="font-bold text-lg">
                      {item.points > 0 ? `+${item.points}` : item.points} pontos
                    </span>
                  </>
                )}
                {item.points === 0 && (
                  <span className="text-sm text-muted-foreground">Sem alteração de pontos</span>
                )}
              </div>
            </div>
          </div>

          <p className="text-card-foreground mb-4">{item.description}</p>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{item.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{item.storeName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="capitalize">{item.type === "purchase" ? "Compra" : item.type === "reward" ? "Recompensa" : item.type === "points" ? "Pontos" : "Oferta"}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="w-full py-4 rounded-xl bg-card border border-border text-card-foreground font-semibold text-base
                 transition-all duration-200 active:scale-[0.98] shadow-md hover:bg-muted"
      >
        Compartilhar
      </button>
    </>
  );

  if (!isMobile) {
    return (
      <div className="min-h-full bg-background">
        <div className="pb-4">
          <h1 className="text-xl font-bold text-card-foreground">Detalhes da Atividade</h1>
        </div>
        <div className="pt-2">{detailContent}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 
                         transition-all duration-200 active:scale-90 active:bg-primary-foreground/30"
            >
              <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
            </button>
            <h1 className="text-lg font-bold text-primary-foreground flex-1 line-clamp-1">
              Detalhes da Atividade
            </h1>
            <button
              type="button"
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 
                       transition-all duration-200 active:scale-90 active:bg-primary-foreground/30"
            >
              <Share2 className="h-5 w-5 text-primary-foreground" />
            </button>
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

export default HistoryDetailPage;
