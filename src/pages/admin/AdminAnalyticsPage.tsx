import { useState, useEffect } from "react";
import { BarChart3, Users, DollarSign, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { getUsersGrowthData, type UserGrowthPoint } from "@/services/usersService";
import { getOffersCountByCategory, type CategoryCount } from "@/services/offersService";

const CATEGORY_COLORS = ["bg-primary", "bg-secondary", "bg-green-500", "bg-blue-500", "bg-muted"];

const AdminAnalyticsPage = () => {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [userGrowth, setUserGrowth] = useState<UserGrowthPoint[]>([]);
  const [loadingUserGrowth, setLoadingUserGrowth] = useState(true);
  const [topCategories, setTopCategories] = useState<CategoryCount[]>([]);
  const [loadingTopCategories, setLoadingTopCategories] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingUserGrowth(true);
      try {
        const data = await getUsersGrowthData(timeRange);
        setUserGrowth(data);
      } catch (err) {
        console.error("Erro ao carregar crescimento de usuários:", err);
        setUserGrowth([]);
      } finally {
        setLoadingUserGrowth(false);
      }
    };
    load();
  }, [timeRange]);

  useEffect(() => {
    const load = async () => {
      setLoadingTopCategories(true);
      try {
        const data = await getOffersCountByCategory();
        setTopCategories(data);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
        setTopCategories([]);
      } finally {
        setLoadingTopCategories(false);
      }
    };
    load();
  }, []);

  // Dados mockados para outros gráficos
  const analytics = {
    revenue: [
      { period: "Jan", value: 120000 },
      { period: "Fev", value: 145000 },
      { period: "Mar", value: 168000 },
      { period: "Abr", value: 195000 },
      { period: "Mai", value: 245000 },
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
        {loadingUserGrowth ? (
          <div className="h-[280px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : userGrowth.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhum dado de usuários disponível
          </div>
        ) : (
        <ChartContainer
          config={{
            value: { label: "Usuários", color: "hsl(var(--chart-1))" },
          }}
          className="h-[280px] w-full"
        >
          <LineChart data={userGrowth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => v.toLocaleString("pt-BR")}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
        )}
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
            <p className="text-sm text-muted-foreground">Quantidade de ofertas por categoria (Firebase)</p>
          </div>
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        {loadingTopCategories ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : topCategories.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Nenhuma oferta cadastrada. As categorias aparecerão conforme as ofertas forem criadas.
          </div>
        ) : (
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-card-foreground">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.count} ofertas ({category.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} rounded-full transition-all`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
