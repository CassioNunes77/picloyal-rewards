import { useState, useEffect, useMemo } from "react";
import { Tag, Clock, MapPin, Percent, Gift, Coffee, Pizza, Sparkles, ChevronRight, Search, Loader2, Crown } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import type { OfferDetailData } from "./OfferDetailPage";
import { getOffersByCity } from "@/services/offersService";
import { getUserRedemptionsMap } from "@/services/redemptionsService";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  merchantId: string;
  validUntil: string;
  icon: "percent" | "gift" | "coffee" | "pizza";
  category: string;
  pointsRequired?: number;
  isNew?: boolean;
}

function iconForCategory(category: string): "percent" | "gift" | "coffee" | "pizza" {
  const c = (category || "").toLowerCase();
  if (c === "bebidas") return "coffee";
  if (c === "comida") return "pizza";
  if (c === "brinde") return "gift";
  return "percent";
}

const OffersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [redemptionsMap, setRedemptionsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelectedLocation(localStorage.getItem("selectedLocation") || "");
  }, []);

  useEffect(() => {
    if (!selectedLocation) {
      setOffers([]);
      return;
    }
    let cancelled = false;
    setLoadingOffers(true);
    getOffersByCity(selectedLocation)
      .then((items) => {
        if (!cancelled) {
          setOffers(
            items.map(({ offer, storeId, storeName, storeAddress }) => {
              const validUntil = offer.validUntil
                ? new Date(offer.validUntil).toLocaleDateString("pt-BR")
                : "—";
              return {
                id: offer.id!,
                title: offer.title,
                description: offer.description,
                discount: offer.discount ?? "—",
                storeId: storeId ?? "",
                storeName,
                storeAddress,
                merchantId: offer.merchantId ?? "",
                validUntil,
                icon: iconForCategory(offer.category),
                category: offer.category,
                pointsRequired: offer.pointsRequired,
                isNew: false,
              };
            })
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Erro ao carregar ofertas:", err);
          setOffers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingOffers(false);
      });
    return () => { cancelled = true; };
  }, [selectedLocation]);

  useEffect(() => {
    if (!user?.uid) {
      setRedemptionsMap({});
      return;
    }
    let cancelled = false;
    getUserRedemptionsMap(user.uid)
      .then((map) => { if (!cancelled) setRedemptionsMap(map); })
      .catch(() => { if (!cancelled) setRedemptionsMap({}); });
    return () => { cancelled = true; };
  }, [user?.uid, location.key]);

  const categories = [
    { id: "all", label: "Todas", icon: Tag },
    { id: "bebidas", label: "Bebidas", icon: Coffee },
    { id: "comida", label: "Comida", icon: Pizza },
    { id: "brinde", label: "Brindes", icon: Gift },
    { id: "geral", label: "Geral", icon: Percent },
  ];

  const iconMap: Record<string, typeof Percent> = {
    percent: Percent,
    gift: Gift,
    coffee: Coffee,
    pizza: Pizza,
  };

  const filteredOffers = useMemo(() => offers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || offer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [offers, searchQuery, selectedCategory]);

  const handleOfferClick = (offer: Offer) => {
    navigate(`/offer/${offer.id}`, { state: { offer: offer as OfferDetailData } });
  };

  const searchInput = (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        placeholder="Buscar ofertas..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={isMobile
          ? "w-full pl-10 pr-4 py-3 rounded-xl bg-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/60 border border-secondary-foreground/30 focus:outline-none focus:ring-2 focus:ring-secondary-foreground/50"
          : "w-full pl-10 pr-4 py-3 rounded-xl bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        }
      />
    </div>
  );

  if (!isMobile) {
    return (
      <div className="min-h-full bg-background w-full">
        <div className="pb-4">
          <h1 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ofertas Especiais
          </h1>
        </div>
        <div className="mb-4">{searchInput}</div>
        <Link
          to="/premium"
          className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-5 text-white
                     transition-all duration-300 hover:shadow-md flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium opacity-90">Seja Premium</p>
            <p className="text-xs opacity-80">Desbloqueie benefícios exclusivos</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Crown className="h-6 w-6" />
          </div>
        </Link>
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border border-border hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </button>
            );
          })}
        </div>
        {loadingOffers ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Carregando ofertas...</p>
          </div>
        ) : !selectedLocation ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-2">Selecione uma cidade</p>
            <p className="text-sm text-muted-foreground text-center">Escolha sua localidade na tela inicial para ver as ofertas</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma oferta encontrada</p>
            <p className="text-sm text-muted-foreground">{searchQuery ? "Tente buscar com outros termos" : `Não há ofertas em ${selectedLocation}`}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredOffers.map((offer, index) => {
              const isRedeemed = redemptionsMap[offer.id] === "confirmed";
              return (
              <button
                key={offer.id}
                onClick={() => handleOfferClick(offer)}
                className={`w-full text-left rounded-2xl p-4 shadow-md transition-all border
                  ${isRedeemed
                    ? "bg-muted/80 border-muted-foreground/25 opacity-90"
                    : "bg-card border-border hover:shadow-lg active:scale-[0.98]"
                  }`}
              >
                <div className="flex gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                    offer.icon === 'coffee' ? 'gradient-primary' :
                    offer.icon === 'pizza' ? 'bg-orange-500' :
                    offer.icon === 'gift' ? 'gradient-secondary' : 'bg-blue-500'
                  }`}>
                    {(() => { const Icon = iconMap[offer.icon]; return <Icon className="h-7 w-7 text-white" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-card-foreground">{offer.title}</h3>
                      <div className="shrink-0 flex items-center gap-1">
                        {isRedeemed && (
                          <span className="rounded-md px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium">
                            Resgatada
                          </span>
                        )}
                        <span className="flex items-center justify-center rounded-lg px-2 py-1 gradient-secondary text-secondary-foreground font-bold text-xs whitespace-nowrap">
                          {offer.discount}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{offer.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{offer.storeName}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      <span>Válido até {offer.validUntil}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-secondary">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-foreground/20 transition-all duration-200 active:scale-90 active:bg-secondary-foreground/30">
              <ChevronRight className="h-5 w-5 text-secondary-foreground rotate-180" />
            </Link>
            <h1 className="text-xl font-bold text-secondary-foreground flex-1 flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Ofertas Especiais
            </h1>
          </div>
          <div className="relative">{searchInput}</div>
        </header>
      </div>
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        {/* Seja Premium Card */}
        <Link
          to="/premium"
          className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-5 text-white
                     transition-all duration-300 active:scale-[0.98] block animate-fade-in"
          style={{ animationDelay: "120ms" }}
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
        {/* Categories */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2 animate-fade-in" style={{ animationDelay: '150ms' }}>
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap
                    transition-all duration-200
                    ${isActive
                      ? 'gradient-secondary text-secondary-foreground shadow-md'
                      : 'bg-card text-card-foreground'
                    }
                    active:scale-95
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Offers List */}
        {loadingOffers ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Carregando ofertas...</p>
          </div>
        ) : !selectedLocation ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <MapPin className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-2">Selecione uma cidade</p>
            <p className="text-sm text-muted-foreground text-center">Escolha sua localidade na tela inicial para ver as ofertas</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma oferta encontrada</p>
            <p className="text-sm text-muted-foreground">{searchQuery ? "Tente buscar com outros termos" : `Não há ofertas em ${selectedLocation}`}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map((offer, index) => {
              const Icon = iconMap[offer.icon];
              const isRedeemed = redemptionsMap[offer.id] === "confirmed";
              return (
                <div
                  key={offer.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <button
                    onClick={() => handleOfferClick(offer)}
                    className={`w-full text-left rounded-2xl p-4 shadow-md overflow-hidden
                             transition-all duration-300 border-2
                             ${isRedeemed
                               ? "bg-muted/80 border-muted-foreground/25 opacity-90"
                               : "bg-card hover:shadow-lg active:scale-[0.98] border-transparent hover:border-primary/20"
                             }`}
                  >
                    <div className="flex gap-3 min-w-0">
                      {/* Icon */}
                      <div className={`
                        flex h-14 w-14 items-center justify-center rounded-xl shrink-0
                        transition-all duration-300
                        ${offer.icon === 'coffee' ? 'gradient-primary' :
                          offer.icon === 'pizza' ? 'bg-orange-500' :
                          offer.icon === 'gift' ? 'gradient-secondary' :
                          'bg-blue-500'
                        }
                      `}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
                              <h3 className="font-semibold text-card-foreground text-sm truncate min-w-0">
                                {offer.title}
                              </h3>
                              {offer.isNew && (
                                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-destructive text-destructive-foreground text-[10px] font-bold whitespace-nowrap">
                                  NOVO
                                </span>
                              )}
                              {isRedeemed && (
                                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium whitespace-nowrap">
                                  Resgatada
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1 line-clamp-2 break-words overflow-hidden">
                              {offer.description}
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center justify-center rounded-lg px-2 py-1 gradient-secondary text-secondary-foreground font-bold text-xs whitespace-nowrap">
                            {offer.discount}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2 flex-wrap">
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{offer.storeName}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3" />
                            <span>Válido até {offer.validUntil}</span>
                          </div>
                        </div>

                        {offer.pointsRequired && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent w-fit max-w-full">
                            <Sparkles className="h-3 w-3 text-accent-foreground shrink-0" />
                            <span className="text-[10px] font-medium text-accent-foreground truncate">
                              {offer.pointsRequired} pontos necessários
                            </span>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* Bottom Navigation */}
    </div>
  );
};

export default OffersPage;
