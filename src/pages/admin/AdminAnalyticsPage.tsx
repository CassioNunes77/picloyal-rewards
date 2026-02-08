import { useState } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminAnalyticsPage = () => {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  // Dados mockados - serão substituídos por dados reais depois
  const analytics = {
    userGrowth: [
      { period: "Jan", value: 8500 },
      { period: "Fev", value: 9200 },
      { period: "Mar", value: 10100 },
      { period: "Abr", value: 11200 },
      { period: "Mai", value: 12450 },
    ],
    revenue: [
      { period: "Jan", value: 120000 },
      { period: "Fev", value: 145000 },
      { period: "Mar", value: 168000 },
      { period: "Abr", value: 195000 },
      { period: "Mai", value: 245000 },
    ],
    topCategories: [
      { name: "Bebidas", value: 35, color: "bg-primary" },
      { name: "Comida", value: 28, color: "bg-secondary" },
      { name: "Brindes", value: 20, color: "bg-green-500" },
      { name: "Saúde", value: 12, color: "bg-blue-500" },
      { name: "Outros", value: 5, color: "bg-muted" },
    ],
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2">Analytics</h1>
          <p className="text-sm text-muted-foreground">Análises e relatórios detalhados</p>
        </div>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d", "1y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                timeRange === range
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-card-foreground border border-border hover:bg-muted"
              }`}
            >
              {range === "7d" ? "7 dias" : range === "30d" ? "30 dias" : range === "90d" ? "90 dias" : "1 ano"}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de Crescimento de Usuários */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-card-foreground mb-1">Crescimento de Usuários</h2>
            <p className="text-sm text-muted-foreground">Evolução do número de usuários</p>
          </div>
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-3">
          {analytics.userGrowth.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm text-muted-foreground shrink-0">{item.period}</div>
              <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(item.value / 13000) * 100}%` }}
                >
                  <span className="text-xs font-medium text-primary-foreground">
                    {item.value.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de Receita */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-card-foreground mb-1">Economia Gerada</h2>
            <p className="text-sm text-muted-foreground">Total de economia entre usuários</p>
          </div>
          <DollarSign className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-3">
          {analytics.revenue.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm text-muted-foreground shrink-0">{item.period}</div>
              <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                <div
                  className="h-full gradient-secondary rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(item.value / 250000) * 100}%` }}
                >
                  <span className="text-xs font-medium text-secondary-foreground">
                    R$ {(item.value / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categorias */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-card-foreground mb-1">Top Categorias</h2>
            <p className="text-sm text-muted-foreground">Distribuição por categoria</p>
          </div>
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-4">
          {analytics.topCategories.map((category, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-card-foreground">{category.name}</span>
                <span className="text-sm text-muted-foreground">{category.value}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${category.color} rounded-full transition-all`}
                  style={{ width: `${category.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
