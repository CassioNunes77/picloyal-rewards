import { useState, useEffect } from "react";
import { Activity, Store, UserCheck, Gift, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAllStores, getAllMerchants } from "@/services/merchantsService";
import { getRecentRedemptions } from "@/services/redemptionsService";

type ActivityType = "store" | "merchant" | "redemption";

interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  detail?: string;
  date: Date;
}

const AdminActivitiesPage = () => {
  const isMobile = useIsMobile();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const [stores, merchants, redemptions] = await Promise.all([
        getAllStores(),
        getAllMerchants(),
        getRecentRedemptions(30),
      ]);

      const items: ActivityItem[] = [];

      stores.forEach((s) => {
        items.push({
          id: `store-${s.id}`,
          type: "store",
          message: `Loja cadastrada: ${s.name}`,
          detail: s.city || s.address,
          date: s.createdAt ?? new Date(),
        });
      });

      merchants.forEach((m) => {
        items.push({
          id: `merchant-${m.uid}`,
          type: "merchant",
          message: `Lojista cadastrado: ${m.displayName || m.email || m.uid}`,
          detail: m.email,
          date: m.createdAt ?? new Date(),
        });
      });

      redemptions.forEach((r) => {
        items.push({
          id: `redemption-${r.id}`,
          type: "redemption",
          message: `${r.userName} solicitou a oferta "${r.offerTitle}"`,
          detail: r.storeName,
          date: r.createdAt ?? new Date(),
        });
      });

      items.sort((a, b) => b.date.getTime() - a.date.getTime());
      setActivities(items.slice(0, 100));
    } catch (err) {
      console.error("Erro ao carregar atividades:", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case "store":
        return Store;
      case "merchant":
        return UserCheck;
      case "redemption":
        return Gift;
      default:
        return Activity;
    }
  };

  const getIconColor = (type: ActivityType) => {
    switch (type) {
      case "store":
        return "bg-blue-100 text-blue-600";
      case "merchant":
        return "bg-green-100 text-green-600";
      case "redemption":
        return "bg-amber-100 text-amber-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-card-foreground mb-1">Atividades</h1>
        <p className="text-sm text-muted-foreground">
          Histórico de lojistas, lojas e resgates cadastrados
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-xs text-muted-foreground">Carregando atividades...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-10">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-card-foreground font-medium text-sm mb-1">Nenhuma atividade encontrada</p>
          <p className="text-xs text-muted-foreground">
            As atividades aparecerão aqui quando houver cadastros.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {activities.map((item) => {
            const Icon = getIcon(item.type);
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:shadow-sm transition-all"
              >
                <div
                  className={`p-1.5 rounded-md shrink-0 ${getIconColor(item.type)}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-card-foreground truncate">
                    {item.message}
                  </p>
                  {item.detail && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.detail}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                  {formatDate(item.date)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
};

export default AdminActivitiesPage;
