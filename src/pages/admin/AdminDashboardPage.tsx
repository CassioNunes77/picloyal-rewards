import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Store,
  Building2,
  Gift,
  MapPin,
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getActiveUsersCount, getTotalUsersCount } from "@/services/usersService";
import { getActiveRegionsCount, getAllRegions, type Region } from "@/services/regionsService";
import { getMerchantsCount, getStoresCount, getAllStores, type StoreData } from "@/services/merchantsService";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboardPage = () => {
  const isMobile = useIsMobile();
  const { user: firebaseUser } = useAuth(); // Usar Firebase Auth para acessar Firestore
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [regions, setRegions] = useState<Region[]>([]);
  const [allStores, setAllStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeUsers: 0,
    onlineUsers: 0,
    totalMerchants: 0,
    totalStores: 0,
    totalSavings: 2450000,
    totalRedemptions: 18934,
    activeRegions: 0,
  });

  // Carregar dados reais do Firebase
  useEffect(() => {
    const loadStats = async () => {
      if (!firestore) {
        console.error("❌ [AdminDashboardPage] Firestore não está configurado!");
        setLoading(false);
        return;
      }

      // Verificar se há usuário autenticado no Firebase Auth
      if (!firebaseUser) {
        console.warn("⚠️ [AdminDashboardPage] Nenhum usuário autenticado no Firebase Auth. As regras do Firestore podem bloquear a leitura.");
        console.warn("⚠️ [AdminDashboardPage] Para o painel admin funcionar, é necessário estar autenticado no Firebase Auth também.");
      }

      setLoading(true);
      try {
        console.log("🔍 [AdminDashboardPage] Carregando estatísticas do Firebase...");
        console.log("🔐 [AdminDashboardPage] Usuário Firebase Auth:", firebaseUser?.uid || "Nenhum");
        
        // Buscar usuários, lojistas, lojas, regiões em paralelo
        const [activeUsersCount, totalUsersCount, activeRegionsCount, merchantsCount, storesCount, regionsData, storesData] =
          await Promise.all([
            getActiveUsersCount(),
            getTotalUsersCount(),
            getActiveRegionsCount(),
            getMerchantsCount(),
            getStoresCount(),
            getAllRegions(),
            getAllStores(),
          ]);

        setRegions(regionsData);
        setAllStores(storesData);

        setStats((prev) => ({
          ...prev,
          activeUsers: activeUsersCount,
          onlineUsers: totalUsersCount,
          activeRegions: activeRegionsCount,
          totalMerchants: merchantsCount,
          totalStores: storesCount,
        }));
      } catch (error) {
        console.error("❌ [AdminDashboardPage] Erro ao carregar estatísticas:", error);
        console.error("❌ [AdminDashboardPage] Detalhes do erro:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [firebaseUser]);

  const regionOptions = [
    { id: "all", label: "Todas as Regiões" },
    ...regions.map((r) => ({ id: r.id, label: r.name })),
  ];

  const storesInRegion =
    selectedRegion === "all"
      ? allStores
      : (() => {
          const region = regions.find((r) => r.id === selectedRegion);
          if (!region) return allStores;
          const regionCityNorm = `${region.city} - ${region.state}`.trim().toLowerCase();
          return allStores.filter((s) => {
            const storeCityNorm = (s.city ?? "").trim().toLowerCase();
            return storeCityNorm === regionCityNorm;
          });
        })();

  const merchantsInRegion = new Set(storesInRegion.map((s) => s.merchantId).filter(Boolean)).size;

  const recentActivity = [
    { type: "user", message: "Novo usuário cadastrado", time: "2 min atrás" },
    { type: "store", message: "Loja 'Café Central' habilitada", time: "15 min atrás" },
    { type: "redemption", message: "Recompensa resgatada", time: "32 min atrás" },
    { type: "feedback", message: "Novo feedback recebido", time: "1h atrás" },
  ];

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    trend,
  }: {
    title: string;
    value: string | number;
    icon: any;
    change?: string;
    trend?: "up" | "down";
  }) => (
    <div className="bg-card rounded-xl border border-border px-4 py-3 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {change && (
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-card-foreground leading-tight">{value}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-card-foreground mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do sistema</p>
      </div>

      {/* Filtro por Região */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-card-foreground mb-1.5">
          Filtrar por Região
        </label>
        <div className="flex flex-wrap gap-1.5">
          {regionOptions.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedRegion === region.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-card-foreground border border-border hover:bg-muted"
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      {/* Estatísticas Principais */}
      {loading ? (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
        </div>
      ) : (
        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"} gap-3 mb-4`}>
          <StatCard
            title="Usuários Ativos"
            value={stats.activeUsers.toLocaleString("pt-BR")}
            icon={Users}
            change="+12.5%"
            trend="up"
          />
          <StatCard
            title="Total de Usuários"
            value={stats.onlineUsers.toLocaleString("pt-BR")}
            icon={UserCheck}
            change="+8.2%"
            trend="up"
          />
          <StatCard
            title="Lojistas"
            value={selectedRegion === "all" ? stats.totalMerchants : merchantsInRegion}
            icon={Store}
          />
          <StatCard
            title="Lojas"
            value={selectedRegion === "all" ? stats.totalStores : storesInRegion.length}
            icon={Building2}
          />
          <StatCard
            title="Regiões Ativas"
            value={selectedRegion === "all" ? stats.activeRegions : (selectedRegion ? 1 : 0)}
            icon={MapPin}
          />
        </div>
      )}

      {/* Estatísticas Secundárias */}
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-3 mb-4`}>
        <StatCard
          title="Economia Global"
          value={`R$ ${(stats.totalSavings / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          change="+15.3%"
          trend="up"
        />
        <StatCard
          title="Resgates Totais"
          value={stats.totalRedemptions.toLocaleString("pt-BR")}
          icon={Gift}
          change="+22.1%"
          trend="up"
        />
      </div>

      {/* Atividades Recentes */}
      <div className="bg-card rounded-xl border border-border px-3 py-2.5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-card-foreground">Atividades Recentes</h2>
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-2 py-1 rounded-md bg-background hover:bg-muted/50 transition-all"
            >
              <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
              <p className="flex-1 min-w-0 text-xs text-card-foreground truncate">{activity.message}</p>
              <span className="text-[10px] text-muted-foreground shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
