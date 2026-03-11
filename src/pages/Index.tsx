import { useState, useEffect, useRef, useCallback } from "react";
import { QrCode, History, Sparkles, Store, ChevronRight, Gift, Percent, Coffee } from "lucide-react";
import StampGrid from "@/components/StampGrid";
import RewardCard from "@/components/RewardCard";
import QuickAction from "@/components/QuickAction";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQR } from "@/contexts/QRContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAllStampRewards, type StampRewardData } from "@/services/stampRewardsService";

const Index = () => {
  const navigate = useNavigate();
  const { openQR } = useQR();
  const { user, loading: authLoading } = useAuth();
  const [stampRewards, setStampRewards] = useState<StampRewardData[]>([]);
  const [stampCarouselIndex, setStampCarouselIndex] = useState(0);
  const stampCarouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const updateStampCarouselIndex = useCallback(() => {
    const el = stampCarouselRef.current;
    if (!el || stampRewards.length === 0) return;
    const card = el.querySelector("[data-stamp-card]") as HTMLElement | null;
    const gap = 16;
    const cardWidth = card?.offsetWidth ?? 280;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setStampCarouselIndex(Math.min(Math.max(0, index), stampRewards.length - 1));
  }, [stampRewards.length]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    getAllStampRewards().then(setStampRewards);
  }, []);

  useEffect(() => {
    const el = stampCarouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateStampCarouselIndex);
    return () => el.removeEventListener("scroll", updateStampCarouselIndex);
  }, [updateStampCarouselIndex]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const handleClaimReward = (rewardName: string) => {
    toast.success(`🎉 ${rewardName} resgatado com sucesso!`, {
      description: "Apresente este cupom no estabelecimento.",
    });
  };

  const rewards = [
    {
      title: "10% OFF",
      description: "100 pts  •  expira em 7 dias",
      points: 100,
      icon: "percent" as const,
      available: true,
      expiresIn: "7 dias",
    },
    {
      title: "Café Grátis",
      description: "200 pts  •  Compre e ganhe",
      points: 200,
      icon: "coffee" as const,
      available: true,
    },
    {
      title: "Sobremesa Grátis",
      description: "Na compra de qualquer prato",
      points: 350,
      icon: "pizza" as const,
      available: false,
    },
    {
      title: "Brinde Especial",
      description: "Exclusivo para membros VIP",
      points: 500,
      icon: "gift" as const,
      available: false,
    },
  ];

  const displayName = user.displayName ?? user.email?.split("@")[0] ?? "Usuário";
  const shortName = displayName.split(" ")[0] || displayName;

  // Conteúdo da Home no desktop (o cartão fica no DesktopLayout à esquerda)
  if (!isMobile) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Linha 1: Acesso rápido + Oferta Especial */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7">
              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground mb-4">Acesso rápido</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <QuickAction icon={QrCode} label="Escanear" onClick={() => openQR()} />
                  <QuickAction icon={History} label="Atividades" onClick={() => navigate("/history")} />
                  <QuickAction icon={Sparkles} label="Recompensas" onClick={() => navigate("/rewards")} />
                  <QuickAction icon={Store} label="Lojas" onClick={() => navigate("/stores")} />
                </div>
              </div>
            </div>
            <div className="md:col-span-5">
              <Link
                to="/premium"
                className="h-full min-h-[140px] overflow-hidden rounded-2xl gradient-secondary p-5 text-secondary-foreground
                           transition-all duration-300 hover:shadow-md flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium opacity-90">Oferta Especial</p>
                  <h3 className="text-lg font-bold">Pontos em Dobro!</h3>
                  <p className="mt-1 text-sm opacity-80">Válido até domingo, 23:59</p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-foreground/20">
                  <span className="text-xl font-bold">2x</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Linha 2: Carimbos + Recompensas */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5">
              {stampRewards.length > 0 ? (
                <div className="space-y-2">
                  <div
                    ref={stampCarouselRef}
                    className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
                  >
                    {stampRewards.map((sr) => (
                      <div key={sr.id} data-stamp-card className="flex-shrink-0 min-w-[260px] w-[min(100%,320px)] snap-center">
                        <StampGrid
                        currentStamps={0}
                        totalStamps={sr.totalStamps}
                        reward={sr.rewardTitle}
                        storeName={sr.storeName}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-1">
                    {stampRewards.map((_, i) => (
                      <div
                        key={i}
                        className="h-[3px] w-[3px] rounded-full transition-opacity"
                        style={{
                          backgroundColor: "hsl(var(--muted-foreground))",
                          opacity: i === stampCarouselIndex ? 0.6 : 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="md:col-span-7">
              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="h-4 w-4 text-secondary" />
                    Suas Recompensas
                  </h2>
                  <button
                    onClick={() => navigate("/rewards")}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Ver todas
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rewards.map((reward, index) => (
                    <RewardCard
                      key={index}
                      {...reward}
                      onClaim={() => handleClaimReward(reward.title)}
                      onClick={() => navigate("/reward", { state: { reward } })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Layout original para mobile
  return (
    <div className="min-h-screen bg-[#0A0D1A] text-white">
      <div className="relative overflow-hidden px-5 pb-6 pt-10">
        <div className="pointer-events-none absolute -top-20 right-[-60px] h-64 w-64 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="pointer-events-none absolute left-[-80px] top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative">
          <p className="text-[33px] text-white/70">Bem-vindo de volta</p>
          <h1 className="text-[44px] font-bold leading-tight">{shortName}</h1>
        </div>

        <div className="relative mt-4 rounded-[24px] border border-white/20 bg-gradient-to-br from-violet-300/60 via-cyan-300/55 to-emerald-300/55 p-5 text-[#10131f] shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Gift className="h-4 w-4" />
              <span>Core+</span>
            </div>
            <Sparkles className="h-4 w-4 text-white/70" />
          </div>
          <p className="text-xs font-medium text-black/55">*** *** *** 4589</p>
          <p className="mt-2 text-3xl font-semibold">{displayName}</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-5xl font-bold leading-none">
              650 <span className="text-3xl font-medium">pts</span>
            </p>
            <p className="text-5xl font-bold leading-none">65%</p>
          </div>
          <p className="mt-2 text-2xl text-black/70">Progresso até próxima recompensa</p>
          <div className="mt-3 h-3 rounded-full bg-black/20">
            <div className="h-3 w-[65%] rounded-full bg-[#12141E]" />
          </div>
          <div className="mt-1 flex items-center justify-between text-[30px] text-black/70">
            <span>Faltam 350 pts</span>
            <span>65%</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Escanear", icon: QrCode, onClick: () => openQR() },
            { label: "Atividades", icon: History, onClick: () => navigate("/history") },
            { label: "Recompensas", icon: Gift, onClick: () => navigate("/rewards") },
            { label: "Lojas", icon: Store, onClick: () => navigate("/stores") },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-[#151B2C] px-4 text-white/90 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-[#64FFD6]" />
                <span className="text-base font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/50" />
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-[22px] border border-white/10 bg-gradient-to-br from-[#171E32] via-[#1C233A] to-[#1A3A37] p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-3xl font-semibold text-white/95">
              {stampRewards[0]?.storeName || "Café Central"}
            </h3>
            <button
              onClick={() => navigate("/stores")}
              className="text-2xl font-medium text-[#8F8BFF]"
            >
              Ver todas
            </button>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: Math.max(stampRewards[0]?.totalStamps ?? 8, 8) }).map((_, index) => {
              const isRewardSlot = index === Math.max((stampRewards[0]?.totalStamps ?? 8) - 1, 0);
              return (
                <div
                  key={index}
                  className={`flex h-12 items-center justify-center rounded-xl border text-sm font-semibold ${
                    isRewardSlot
                      ? "border-[#64FFD6]/70 bg-[#2A3F4A] text-[#64FFD6]"
                      : "border-white/15 bg-[#1C2338] text-white/35"
                  }`}
                >
                  {isRewardSlot ? <Gift className="h-5 w-5" /> : index + 1}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-lg text-[#64FFD6]">
            Complete {(stampRewards[0]?.totalStamps ?? 8)} carimbos e ganhe{" "}
            <span className="font-semibold">{stampRewards[0]?.rewardTitle || "Café Grátis"}</span>
          </p>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-4xl font-semibold text-white">Suas Recompensas</h2>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#151B2C] p-4">
            {rewards.slice(0, 2).map((reward) => (
              <button
                key={reward.title}
                onClick={() => navigate("/reward", { state: { reward } })}
                className="flex w-full items-center justify-between rounded-xl bg-[#171E30] px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#52E0B7] text-[#0C1B21]">
                    {reward.icon === "percent" ? (
                      <Percent className="h-5 w-5" />
                    ) : (
                      <Coffee className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-3xl font-semibold text-white">{reward.title}</p>
                    <p className="text-xl text-white/55">{reward.description}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#52E0B7] px-4 py-2 text-2xl font-semibold text-[#0B1A21]">
                  Resgatar
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mantém carrossel de carimbos no desktop; no mobile usamos bloco estático da referência */}
        {stampRewards.length > 0 && false && (
          <div className="mb-6">
            <div className="space-y-2">
              <div
                ref={stampCarouselRef}
                className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory -mx-6 px-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
              >
                {stampRewards.map((sr) => (
                  <div key={sr.id} data-stamp-card className="flex-shrink-0 w-[min(calc(100vw-48px),320px)] snap-center">
                    <StampGrid currentStamps={0} totalStamps={sr.totalStamps} reward={sr.rewardTitle} storeName={sr.storeName} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
