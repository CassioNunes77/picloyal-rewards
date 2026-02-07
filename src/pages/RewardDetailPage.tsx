import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  Sparkles,
  Percent,
  Gift,
  Coffee,
  Pizza,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export interface RewardDetailData {
  title: string;
  description: string;
  points: number;
  expiresIn?: string;
  icon: "percent" | "gift" | "coffee" | "pizza";
  available: boolean;
}

const iconMap = {
  percent: Percent,
  gift: Gift,
  coffee: Coffee,
  pizza: Pizza,
};

const RewardDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const state = location.state as { reward: RewardDetailData } | null;
  const reward = state?.reward;

  if (!reward) {
    navigate("/rewards", { replace: true });
    return null;
  }

  const Icon = iconMap[reward.icon] || Gift;

  const handleClaimReward = () => {
    if (!reward.available) {
      toast.error("Esta recompensa não está disponível para resgate.");
      return;
    }
    toast.success(`🎉 ${reward.title} resgatado com sucesso!`, {
      description: "Apresente este cupom no estabelecimento.",
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
                ${reward.available ? "gradient-primary" : "bg-muted"}
              `}
            >
              <Icon className={`h-8 w-8 ${reward.available ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="text-lg font-bold text-card-foreground">{reward.title}</h2>
                {!reward.available && (
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-bold">
                    RESGATADA
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="text-primary font-bold text-lg">{reward.points} pontos</span>
              </div>
            </div>
          </div>

          <p className="text-card-foreground mb-4">{reward.description}</p>

          <div className="space-y-2 text-sm text-muted-foreground">
            {reward.expiresIn && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Expira em {reward.expiresIn}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={reward.available ? "text-primary font-medium" : "text-muted-foreground"}>
                {reward.available ? "Disponível para resgate" : "Já foi resgatada"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {reward.available && (
        <>
          <button
            type="button"
            onClick={handleClaimReward}
            className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-semibold text-base
                     transition-all duration-200 active:scale-[0.98] shadow-md"
          >
            Resgatar Recompensa
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Apresente esta tela ou o cupom ativado no estabelecimento
          </p>
        </>
      )}

      {!reward.available && (
        <div className="w-full py-4 rounded-xl bg-muted text-muted-foreground font-semibold text-base text-center">
          Recompensa já resgatada
        </div>
      )}
    </>
  );

  if (!isMobile) {
    return (
      <div className="min-h-full bg-background">
        <div className="pb-4">
          <h1 className="text-xl font-bold text-card-foreground">Detalhes da Recompensa</h1>
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
              Detalhes da Recompensa
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

export default RewardDetailPage;
