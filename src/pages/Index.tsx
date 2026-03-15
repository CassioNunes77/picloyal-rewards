import { useState, useEffect, useRef, useCallback } from "react";
import { QrCode, History, Sparkles, Store, Settings, Crown, Tag, ChevronRight, MapPin, Gift } from "lucide-react";
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
import { useUnreadNotifications } from "@/hooks/use-unread-notifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAllStampRewards, type StampRewardData } from "@/services/stampRewardsService";
import { getUserData } from "@/services/usersService";
import { getOffersByCity, type OfferData } from "@/services/offersService";
import { getUserRedemptionsMap, type RedemptionStatus } from "@/services/redemptionsService";
import { getStoresByCity, type StoreData } from "@/services/merchantsService";

const Index = () => {
  const navigate = useNavigate();
  const { openQR } = useQR();
  const { user, loading: authLoading } = useAuth();
  const { unreadCount } = useUnreadNotifications();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => localStorage.getItem("selectedLocation") || "");
  const [stampRewards, setStampRewards] = useState<StampRewardData[]>([]);
  const [stampCarouselIndex, setStampCarouselIndex] = useState(0);
  const [userPlan, setUserPlan] = useState<"free" | "premium">("free");
  const [availableOffers, setAvailableOffers] = useState<Array<{ offer: OfferData; storeName: string }>>([]);
  const [highlightStores, setHighlightStores] = useState<StoreData[]>([]);
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
    if (!user?.uid) return;
    getUserData(user.uid)
      .then((data) => setUserPlan(data?.plan === "premium" ? "premium" : "free"))
      .catch(() => setUserPlan("free"));
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !selectedLocation) {
      setAvailableOffers([]);
      return;
    }
    const loadOffers = async () => {
      try {
        const [offersData, redemptionsMap] = await Promise.all([
          getOffersByCity(selectedLocation),
          getUserRedemptionsMap(user.uid),
        ]);
        const filtered = offersData
          .filter((item) => redemptionsMap[item.offer.id!] !== "confirmed")
          .slice(0, 5);
        setAvailableOffers(filtered.map((item) => ({ offer: item.offer, storeName: item.storeName })));
      } catch (error) {
        console.error("Erro ao carregar ofertas:", error);
        setAvailableOffers([]);
      }
    };
    loadOffers();
  }, [user?.uid, selectedLocation]);

  useEffect(() => {
    if (!selectedLocation) {
      setHighlightStores([]);
      return;
    }
    getStoresByCity(selectedLocation)
      .then((stores) => {
        const withPhoto = stores.filter((s) => s.photoURL);
        const withoutPhoto = stores.filter((s) => !s.photoURL);
        setHighlightStores([...withPhoto, ...withoutPhoto].slice(0, 15));
      })
      .catch(() => setHighlightStores([]));
  }, [selectedLocation]);

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

  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
  }

  // Conteúdo da Home no desktop (o cartão fica no DesktopLayout à esquerda)
  if (!isMobile) {
    const hasStamps = stampRewards.length > 0;
    
    return (
      <div className="min-h-full bg-background">
        <div className="space-y-4">
          {/* Linha 1: Acesso Rápido + Carimbos (ou Recompensas se não houver carimbos) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Acesso Rápido */}
            <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground mb-3">Acesso rápido</p>
              <div className="grid grid-cols-4 gap-2">
                <QuickAction icon={QrCode} label="Escanear" onClick={() => openQR()} />
                <QuickAction icon={History} label="Atividades" onClick={() => navigate("/history")} />
                <QuickAction icon={Sparkles} label="Recompensas" onClick={() => navigate("/rewards")} />
                <QuickAction icon={Store} label="Lojas" onClick={() => navigate("/stores")} />
              </div>
            </div>

            {/* Carimbos ou Recompensas */}
            {hasStamps ? (
              <div
                ref={stampCarouselRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
              >
                {stampRewards.map((sr) => (
                  <div key={sr.id} data-stamp-card className="flex-shrink-0 w-full snap-center">
                    <StampGrid
                      currentStamps={0}
                      totalStamps={sr.totalStamps}
                      reward={sr.rewardTitle}
                      storeName={sr.storeName}
                      carouselIndex={stampCarouselIndex}
                      carouselTotal={stampRewards.length}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-foreground">Recompensas</h2>
                  <button
                    onClick={() => navigate("/rewards")}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Ver todas
                  </button>
                </div>
                <div className="space-y-2">
                  {rewards.slice(0, 4).map((reward, index) => (
                    <RewardCard
                      key={index}
                      {...reward}
                      onClaim={() => handleClaimReward(reward.title)}
                      onClick={() => navigate("/reward", { state: { reward } })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Banner Natal Premiado */}
          <Link
            to="/natal-premiado"
            className="block overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-700 p-4 text-white
                       transition-all duration-300 hover:opacity-95 mb-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold tracking-tight">Natal Premiado</p>
                <p className="text-xs opacity-90 mt-0.5">Ofertas especiais e prêmios para você</p>
                <p className="text-xs mt-1.5 opacity-90">Você possui <span className="inline-flex items-center font-bold text-sm bg-white/25 text-white px-2 py-0.5 rounded">5 cupons</span></p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Gift className="h-6 w-6" />
              </div>
            </div>
          </Link>

          {/* Destaques - carrossel horizontal */}
          {highlightStores.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-foreground mb-2">Destaques</h2>
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {highlightStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => navigate(`/store/${store.id}`)}
                    className="flex-shrink-0 w-24 snap-center rounded-lg overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square w-full bg-muted relative">
                      {store.photoURL ? (
                        <img src={store.photoURL} alt={store.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-6 pb-1.5 px-1.5">
                        <p className="text-[10px] font-medium text-white truncate text-center leading-tight drop-shadow-sm">
                          {store.name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seja Premium - abaixo de Destaques */}
          <Link
            to="/premium"
            className="block overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-4 text-white
                       transition-all duration-300 hover:opacity-95"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-90">Seja Premium</p>
                <p className="text-xs opacity-80">Desbloqueie benefícios exclusivos</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Crown className="h-5 w-5" />
              </div>
            </div>
          </Link>

          {/* Linha 2: Ofertas + Recompensas (só aparece se houver carimbos) */}
          <div className={`grid gap-4 ${hasStamps ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Ofertas disponíveis */}
            <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-foreground">Ofertas</h2>
                <button
                  onClick={() => navigate("/offers")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Ver todas
                </button>
              </div>
              {availableOffers.length > 0 ? (
                <div className={`${hasStamps ? 'space-y-2' : 'grid grid-cols-2 gap-3'}`}>
                  {availableOffers.slice(0, hasStamps ? 4 : 6).map((item) => (
                    <button
                      key={item.offer.id}
                      onClick={() => navigate(`/offer/${item.offer.id}`)}
                      className="w-full text-left bg-background rounded-lg p-2.5 border border-border transition-all duration-200 hover:shadow-sm active:scale-[0.99] flex items-center gap-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-secondary">
                        <Tag className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.offer.discount && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded gradient-primary text-primary-foreground text-[9px] font-bold">
                              {item.offer.discount}
                            </span>
                          )}
                          <h3 className="font-medium text-card-foreground text-xs truncate">{item.offer.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground truncate">{item.storeName}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <p className="text-xs text-muted-foreground">Nenhuma oferta disponível</p>
                </div>
              )}
            </div>

            {/* Recompensas - só aparece se houver carimbos */}
            {hasStamps && (
              <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-foreground">Recompensas</h2>
                  <button
                    onClick={() => navigate("/rewards")}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Ver todas
                  </button>
                </div>
                <div className="space-y-2">
                  {rewards.slice(0, 4).map((reward, index) => (
                    <RewardCard
                      key={index}
                      {...reward}
                      onClaim={() => handleClaimReward(reward.title)}
                      onClick={() => navigate("/reward", { state: { reward } })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Layout original para mobile
  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero">
        <header className="relative z-10 px-6 pt-14 pb-4">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in flex-1 pr-3">
              <LocationSelector />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/notifications")}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20
                           transition-all duration-200 active:scale-90 active:bg-primary-foreground/30 animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
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
        <div className="px-4 pb-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <LoyaltyCard
            currentPoints={650}
            totalPoints={1000}
            userName={displayName}
            cardNumber="**** **** **** 4589"
            accountType={userPlan === "premium" ? "PREMIUM" : "FREE"}
          />
        </div>
      </div>

      <div className="relative -mt-4 rounded-t-3xl bg-background px-5 pt-5">
        <div className="mb-5 flex justify-around animate-fade-in" style={{ animationDelay: "200ms" }}>
          <QuickAction icon={QrCode} label="Escanear" onClick={() => openQR()} />
          <QuickAction icon={History} label="Atividades" onClick={() => navigate("/history")} />
          <QuickAction icon={Sparkles} label="Recompensas" onClick={() => navigate("/rewards")} />
          <QuickAction icon={Store} label="Lojas" onClick={() => navigate("/stores")} />
        </div>
        {/* Banner Natal Premiado */}
        <Link
          to="/natal-premiado"
          className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-4 text-white
                     transition-all duration-300 active:scale-[0.98] block animate-fade-in"
          style={{ animationDelay: "210ms" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-bold tracking-tight">Natal Premiado</p>
              <p className="text-xs opacity-90 mt-0.5">Ofertas especiais e prêmios para você</p>
              <p className="text-xs mt-1.5 opacity-90">Você possui <span className="inline-flex items-center font-bold text-sm bg-white/25 text-white px-2 py-0.5 rounded">5 cupons</span></p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Gift className="h-6 w-6" />
            </div>
          </div>
        </Link>
        {highlightStores.length > 0 && (
          <div className="mb-4 animate-fade-in" style={{ animationDelay: "220ms" }}>
            <h2 className="text-base font-semibold text-foreground mb-3">Destaques</h2>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {highlightStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => navigate(`/store/${store.id}`)}
                  className="flex-shrink-0 w-28 snap-center rounded-xl overflow-hidden border border-border bg-card shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="aspect-square w-full bg-muted relative">
                    {store.photoURL ? (
                      <img src={store.photoURL} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-2 px-2">
                      <p className="text-[10px] font-medium text-white truncate text-center leading-tight drop-shadow-sm">
                        {store.name}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <Link
          to="/premium"
          className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-4 text-white
                     transition-all duration-300 active:scale-[0.98] block animate-fade-in"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium opacity-90">Seja Premium</p>
              <p className="text-xs opacity-80">Desbloqueie benefícios exclusivos</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Crown className="h-5 w-5" />
            </div>
          </div>
        </Link>
        {availableOffers.length > 0 && (
          <div className="mb-4 animate-fade-in" style={{ animationDelay: "260ms" }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                Ofertas
              </h2>
              <button
                onClick={() => navigate("/offers")}
                className="text-xs font-medium text-primary transition-all duration-200 active:scale-95"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-2">
              {availableOffers.map((item, index) => (
                <button
                  key={item.offer.id}
                  onClick={() => navigate(`/offer/${item.offer.id}`)}
                  className="w-full text-left bg-card rounded-xl p-3 shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-secondary">
                    <Tag className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-card-foreground text-xs truncate">{item.offer.title}</h3>
                      {item.offer.discount && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded gradient-primary text-primary-foreground text-[10px] font-bold">
                          {item.offer.discount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground truncate">{item.storeName}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
        {stampRewards.length > 0 && (
          <div className="mb-2.5 animate-fade-in" style={{ animationDelay: "280ms" }}>
            <div
              ref={stampCarouselRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
            >
              {stampRewards.map((sr, index) => (
                <div
                  key={sr.id}
                  data-stamp-card
                  className="flex-shrink-0 w-[min(calc(100vw-32px),360px)] snap-center"
                >
                  <StampGrid
                    currentStamps={0}
                    totalStamps={sr.totalStamps}
                    reward={sr.rewardTitle}
                    storeName={sr.storeName}
                    carouselIndex={stampCarouselIndex}
                    carouselTotal={stampRewards.length}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h2 className="text-base font-semibold text-foreground">
              Recompensas
            </h2>
            <button
              onClick={() => navigate("/rewards")}
              className="text-xs font-medium text-primary transition-all duration-200 active:scale-95"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-2.5">
            {rewards.map((reward, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${350 + index * 50}ms` }}>
                <RewardCard
                  {...reward}
                  onClaim={() => handleClaimReward(reward.title)}
                  onClick={() => navigate("/reward", { state: { reward } })}
                />
              </div>
            ))}
          </div>
        </div>
        <Link
          to="/premium"
          className="mb-5 overflow-hidden rounded-2xl gradient-secondary p-4 text-secondary-foreground
                     transition-all duration-300 active:scale-[0.98] block animate-fade-in"
          style={{ animationDelay: "550ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium opacity-80">Oferta Especial</p>
              <h3 className="text-lg font-bold">Pontos em Dobro!</h3>
              <p className="mt-0.5 text-xs opacity-80">Válido até domingo, 23:59</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-foreground/20 animate-pulse">
              <span className="text-lg font-bold">2x</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Index;
