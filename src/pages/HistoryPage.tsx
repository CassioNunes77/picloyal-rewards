import { useState, useEffect } from "react";
import { Clock, Search, ChevronRight, ShoppingCart, Gift, Sparkles, Tag, List, MapPin, Coffee, UtensilsCrossed, Percent, Star, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { getUserActivities, mergeActivitiesWithRedemptions, type UserActivity } from "@/services/userActivitiesService";
import { getUserRedemptions } from "@/services/redemptionsService";

interface HistoryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  points: number;
  type: "purchase" | "reward" | "points" | "offer";
  storeName: string;
  icon: "cup" | "gift" | "sparkles" | "tag" | "cart" | "fork" | "percent" | "star";
}

function formatActivityDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24 && d.getDate() === now.getDate()) return `Hoje, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return `Ontem, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function activityToHistoryItem(a: UserActivity, index: number): HistoryItem {
  const iconMap: Record<string, HistoryItem["icon"]> = {
    offer: "tag",
    reward: "gift",
    stamp: "sparkles",
    purchase: "cup",
    points: "sparkles",
  };
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    date: formatActivityDate(a.createdAt),
    points: a.points ?? 0,
    type: a.type === "offer" ? "offer" : a.type === "reward" ? "reward" : a.type === "purchase" ? "purchase" : "points",
    storeName: a.storeName,
    icon: iconMap[a.type] ?? "tag",
  };
}

const HistoryPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setHistoryItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [activities, redemptions] = await Promise.all([
          getUserActivities(user.uid),
          getUserRedemptions(user.uid),
        ]);
        if (cancelled) return;
        const merged = mergeActivitiesWithRedemptions(activities, redemptions);
        setHistoryItems(merged.map(activityToHistoryItem));
      } catch {
        if (!cancelled) setHistoryItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const filters = [
    { id: "all", label: "Todas", icon: List },
    { id: "purchase", label: "Compras", icon: ShoppingCart },
    { id: "reward", label: "Recompensas", icon: Gift },
    { id: "points", label: "Pontos", icon: Sparkles },
    { id: "offer", label: "Ofertas", icon: Tag },
  ];

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

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || item.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "gradient-primary";
      case "reward":
        return "bg-green-500";
      case "points":
        return "gradient-secondary";
      case "offer":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleItemClick = (item: HistoryItem) => {
    navigate("/history-detail", {
      state: { item: item as import("./HistoryDetailPage").HistoryDetailData },
    });
  };

  if (!isMobile) {
    return (
      <div className="min-h-full bg-background">
        <div className="pb-4">
          <h1 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Atividades
          </h1>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar nas atividades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border border-border hover:bg-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {filter.label}
              </button>
            );
          })}
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Carregando atividades...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">Nenhum registro encontrado</p>
            <p className="text-xs text-muted-foreground">Suas ofertas utilizadas aparecerão aqui</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full text-left bg-card rounded-xl p-4 shadow-sm text-sm transition-all hover:shadow-lg border border-border hover:border-primary/20"
              >
                <div className="flex gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getTypeColor(item.type)}`}>
                    {(() => { const Icon = iconMap[item.icon]; return <Icon className="h-6 w-6 text-white" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground text-base mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{item.storeName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                  {item.points !== 0 && (
                    <div className="flex flex-col items-end justify-center shrink-0">
                      <span className={`text-base font-bold ${item.points > 0 ? "text-primary" : "text-destructive"}`}>
                        {item.points > 0 ? `+${item.points}` : item.points}
                      </span>
                      <span className="text-[10px] text-muted-foreground">pts</span>
                    </div>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-all duration-200 active:scale-90 active:bg-primary-foreground/30">
              <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
            </Link>
            <h1 className="text-lg font-bold text-primary-foreground flex-1 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividades
            </h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60" />
            <input
              type="text"
              placeholder="Buscar nas atividades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 border border-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
            />
          </div>
        </header>
      </div>
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap text-sm transition-all ${
                    isActive ? "gradient-hero text-primary-foreground shadow-md" : "bg-card text-card-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="font-medium">{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Carregando atividades...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Clock className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">Nenhum registro encontrado</p>
            <p className="text-xs text-muted-foreground">Suas ofertas utilizadas aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="animate-fade-in"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <button
                    onClick={() => handleItemClick(item)}
                    className="w-full text-left bg-card rounded-xl p-4 shadow-sm text-sm 
                             transition-all duration-300 hover:shadow-lg active:scale-[0.98]
                             border-2 border-transparent hover:border-primary/20"
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`
                        flex h-12 w-12 items-center justify-center rounded-xl shrink-0
                        transition-all duration-300
                        ${getTypeColor(item.type)}
                      `}>
                        {(() => {
                          const Icon = iconMap[item.icon];
                          return <Icon className="h-6 w-6 text-white" />;
                        })()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-card-foreground text-base mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{item.storeName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Points */}
                      {item.points !== 0 && (
                        <div className="flex flex-col items-end justify-center shrink-0">
                          <span className={`text-base font-bold ${
                            item.points > 0 ? 'text-secondary' : 'text-destructive'
                          }`}>
                            {item.points > 0 ? `+${item.points}` : item.points}
                          </span>
                          <span className="text-[10px] text-muted-foreground">pts</span>
                        </div>
                      )}

                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2 self-center" />
                    </div>
                  </button>
                </div>
            ))}
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* Bottom Navigation */}
    </div>
  );
};

export default HistoryPage;
