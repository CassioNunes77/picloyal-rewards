import { useState } from "react";
import {
  Users,
  UserCheck,
  Store,
  TrendingUp,
  Gift,
  MapPin,
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminDashboardPage = () => {
  const isMobile = useIsMobile();
  const [selectedRegion, setSelectedRegion] = useState("all");

  // Dados mockados - serão substituídos por dados reais depois
  const stats = {
    activeUsers: 12450,
    onlineUsers: 3421,
    totalStores: 856,
    totalSavings: 2450000,
    totalRedemptions: 18934,
    activeRegions: 12,
  };

  const regions = [
    { id: "all", label: "Todas as Regiões" },
    { id: "sp", label: "São Paulo" },
    { id: "rj", label: "Rio de Janeiro" },
    { id: "mg", label: "Minas Gerais" },
    { id: "rs", label: "Rio Grande do Sul" },
  ];

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
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-card-foreground mb-1">{value}</h3>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do sistema</p>
      </div>

      {/* Filtro por Região */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-card-foreground mb-2">
          Filtrar por Região
        </label>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
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
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"} gap-4 mb-6`}>
        <StatCard
          title="Usuários Ativos"
          value={stats.activeUsers.toLocaleString("pt-BR")}
          icon={Users}
          change="+12.5%"
          trend="up"
        />
        <StatCard
          title="Usuários Online"
          value={stats.onlineUsers.toLocaleString("pt-BR")}
          icon={UserCheck}
          change="+8.2%"
          trend="up"
        />
        <StatCard
          title="Lojistas"
          value={stats.totalStores.toLocaleString("pt-BR")}
          icon={Store}
          change="+3.1%"
          trend="up"
        />
        <StatCard
          title="Regiões Ativas"
          value={stats.activeRegions}
          icon={MapPin}
        />
      </div>

      {/* Estatísticas Secundárias */}
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4 mb-6`}>
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
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-card-foreground">Atividades Recentes</h2>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-background hover:bg-muted/50 transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-card-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
