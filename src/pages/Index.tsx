import { useState, useEffect, useRef, useCallback } from "react";
import { QrCode, History, Sparkles, Store, Settings, Crown } from "lucide-react";
import LoyaltyCard from "@/components/LoyaltyCard";
import StampGrid from "@/components/StampGrid";
import RewardCard from "@/components/RewardCard";
import QuickAction from "@/components/QuickAction";
import SettingsScreen from "@/components/SettingsScreen";
import LocationSelector from "@/components/LocationSelector";
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
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => localStorage.getItem("selectedLocation") || "");
  const [stampRewards, setStampRewards] = useState<StampRewardData[]>([]);
  const [stampCarouselIndex, setStampCarouselIndex] = useState(0);
  const stampCarouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setSelectedLocation(localStorage.getItem("selectedLocation") || "");
  }, []);

  useEffect(() => {
    const handler = () => setSelectedLocation(localStorage.getItem("selectedLocation") || "");
    window.addEventListener("locationChanged", handler);
    return () => window.removeEventListener("locationChanged", handler);
  }, []);

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

  const handleQuickAction = (action: string) => {
    toast.info(`Abrindo ${action}...`);
  };

  const rewards = [
    {
      title: "10% OFF",
      description: "Em qualquer produto",
      points: 100,
      icon: "percent" as const,
      available: true,
      expiresIn: "7 dias",
    },
    {
      title: "Café Grátis",
      description: "Um café expresso ou cappuccino",
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

  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
  }

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
    <div className="min-h-screen bg-background">
      <div className="gradient-hero">
        {/* Location Selector (estilo iFood) - Centralizado */}
        <div className="flex justify-center px-6 pt-14 pb-2">
          <LocationSelector />
        </div>
        
        <header className="relative z-10 px-6 pt-2 pb-4">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <p className="text-sm text-primary-foreground/80">Bem-vindo de volta,</p>
              <h1 className="text-xl font-bold text-primary-foreground">{shortName}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/notifications")}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20
                           transition-all duration-200 active:scale-90 active:bg-primary-foreground/30 animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  2
                </div>
                <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20
                           transition-all duration-200 active:scale-90 active:bg-primary-foreground/30 animate-fade-in"
                style={{ animationDelay: "150ms" }}
              >
                <Settings className="h-5 w-5 text-primary-foreground" />
              </button>
            </div>
          </div>
        </header>
        <div className="px-6 pb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <LoyaltyCard
            currentPoints={650}
            totalPoints={1000}
            userName={displayName}
            cardNumber="**** **** **** 4589"
          />
        </div>
      </div>

      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        <div className="mb-6 flex justify-around animate-fade-in" style={{ animationDelay: "200ms" }}>
          <QuickAction icon={QrCode} label="Escanear" onClick={() => openQR()} />
          <QuickAction icon={History} label="Atividades" onClick={() => navigate("/history")} />
          <QuickAction icon={Sparkles} label="Recompensas" onClick={() => navigate("/rewards")} />
          <QuickAction icon={Store} label="Lojas" onClick={() => navigate("/stores")} />
        </div>
        {stampRewards.length > 0 && (
          <div className="mb-6 animate-fade-in" style={{ animationDelay: "250ms" }}>
            <div className="space-y-2">
              <div
                ref={stampCarouselRef}
                className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory -mx-6 px-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
              >
                {stampRewards.map((sr) => (
                  <div
                    key={sr.id}
                    data-stamp-card
                    className="flex-shrink-0 w-[min(calc(100vw-48px),320px)] snap-center"
                  >
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
          </div>
        )}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Sparkles className="h-5 w-5 text-secondary" />
              Suas Recompensas
            </h2>
            <button
              onClick={() => navigate("/rewards")}
              className="text-sm font-medium text-primary transition-all duration-200 active:scale-95"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {rewards.map((reward, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${350 + index * 50}ms` }}>
                <RewardCard {...reward} onClaim={() => handleClaimReward(reward.title)} />
              </div>
            ))}
          </div>
        </div>
        <Link
          to="/premium"
          className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-5 text-white
                     transition-all duration-300 active:scale-[0.98] block animate-fade-in"
          style={{ animationDelay: "500ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Seja Premium</p>
              <p className="text-sm opacity-80">Desbloqueie benefícios exclusivos</p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Crown className="h-6 w-6" />
            </div>
          </div>
        </Link>
        <Link
          to="/premium"
          className="mb-6 overflow-hidden rounded-2xl gradient-secondary p-5 text-secondary-foreground
                     transition-all duration-300 active:scale-[0.98] block animate-fade-in"
          style={{ animationDelay: "550ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Oferta Especial</p>
              <h3 className="text-xl font-bold">Pontos em Dobro!</h3>
              <p className="mt-1 text-sm opacity-80">Válido até domingo, 23:59</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-foreground/20 animate-pulse">
              <span className="text-xl font-bold">2x</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Index;
