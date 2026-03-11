import { useState, useEffect } from "react";
import { Crown, Star, Gift, Percent, Sparkles, ChevronLeft, Loader2, RotateCcw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { purchasePremium, restorePremium, isNativePurchaseAvailable } from "@/services/subscriptionService";

const benefits = [
  {
    icon: Star,
    title: "Pontos em dobro",
    desc: "Ganhe 2x pontos em todas as compras",
  },
  {
    icon: Gift,
    title: "Recompensas exclusivas",
    desc: "Acesso a ofertas só para Premium",
  },
  {
    icon: Crown,
    title: "Prioridade no atendimento",
    desc: "Atendimento preferencial nas lojas",
  },
  {
    icon: Percent,
    title: "Descontos especiais",
    desc: "Até 20% OFF em parceiros selecionados",
  },
  {
    icon: Sparkles,
    title: "Aniversário Premium",
    desc: "Brinde especial no seu aniversário",
  },
];

const PremiumPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success === "true") toast.success("Assinatura ativada com sucesso!");
    if (canceled === "true") toast.info("Assinatura cancelada.");
  }, [searchParams]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Faça login para assinar.");
      return;
    }
    setIsLoading(true);
    try {
      await purchasePremium();
      toast.success("Premium ativado com sucesso!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao assinar.";
      if (!msg.toLowerCase().includes("cancel")) toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!user) {
      toast.error("Faça login para restaurar.");
      return;
    }
    setIsRestoring(true);
    try {
      const ok = await restorePremium();
      toast.success(ok ? "Compra restaurada!" : "Nenhuma compra encontrada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao restaurar.");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-700">
        <header className="px-6 pt-12 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/home"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-all duration-200 active:scale-90"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </Link>
            <h1 className="text-xl font-bold text-white flex-1">Seja Premium</h1>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 mb-4">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <p className="text-white/90 text-base">
              Desbloqueie benefícios exclusivos
            </p>
          </div>
        </header>
      </div>

      {/* Conteúdo */}
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6 pb-24">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            O que você ganha
          </h2>
          <div className="space-y-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-md border border-border animate-fade-in"
                  style={{ animationDelay: `${100 + index * 50}ms` }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                    <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-card-foreground">
                      {benefit.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl
                     bg-gradient-to-r from-amber-500 to-amber-700 text-white font-semibold
                     transition-all duration-200 active:scale-[0.98] animate-fade-in
                     disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ animationDelay: "400ms" }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {isNativePurchaseAvailable() ? "Processando..." : "Redirecionando..."}
            </>
          ) : (
            <>
              Assinar Premium
              <span className="text-lg">→</span>
            </>
          )}
        </button>
        {isNativePurchaseAvailable() && (
          <button
            onClick={handleRestore}
            disabled={isRestoring}
            className="w-full flex items-center justify-center gap-2 py-3 mt-3 rounded-xl
                       border border-amber-500/50 text-amber-600 dark:text-amber-400
                       transition-all duration-200 active:scale-[0.98] animate-fade-in
                       disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isRestoring ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Restaurar compras
              </>
            )}
          </button>
        )}
        <p
          className="text-center text-sm text-muted-foreground mt-3 animate-fade-in"
          style={{ animationDelay: "450ms" }}
        >
          R$ 19,90/mês • Cancele quando quiser
        </p>
      </div>
    </div>
  );
};

export default PremiumPage;
