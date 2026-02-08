import { useState } from "react";
import { Sparkles, Search, ChevronRight, List, CheckCircle, Gift } from "lucide-react";
import RewardCard from "@/components/RewardCard";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import type { RewardDetailData } from "./RewardDetailPage";

interface Reward {
  title: string;
  description: string;
  points: number;
  icon: "percent" | "coffee" | "pizza" | "gift";
  available: boolean;
  expiresIn?: string;
}

const RewardsPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("rewards");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const rewards: Reward[] = [
    {
      title: "10% OFF",
      description: "Em qualquer produto",
      points: 100,
      icon: "percent",
      available: true,
      expiresIn: "7 dias",
    },
    {
      title: "Café Grátis",
      description: "Um café expresso ou cappuccino",
      points: 200,
      icon: "coffee",
      available: true,
    },
    {
      title: "Sobremesa Grátis",
      description: "Na compra de qualquer prato",
      points: 350,
      icon: "pizza",
      available: false,
    },
    {
      title: "Brinde Especial",
      description: "Exclusivo para membros VIP",
      points: 500,
      icon: "gift",
      available: false,
    },
    {
      title: "15% OFF",
      description: "Desconto em qualquer compra acima de R$ 50",
      points: 300,
      icon: "percent",
      available: true,
      expiresIn: "5 dias",
    },
    {
      title: "Pizza Grátis",
      description: "Pizza média de sua escolha",
      points: 400,
      icon: "pizza",
      available: false,
    },
    {
      title: "20% OFF",
      description: "Desconto em bebidas e sobremesas",
      points: 250,
      icon: "coffee",
      available: true,
      expiresIn: "3 dias",
    },
  ];

  const filters = [
    { id: "all", label: "Todas", icon: List },
    { id: "available", label: "Disponíveis", icon: CheckCircle },
    { id: "claimed", label: "Resgatadas", icon: Gift },
  ];

  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch =
      reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "available" && reward.available) ||
      (selectedFilter === "claimed" && !reward.available);
    return matchesSearch && matchesFilter;
  });

  const handleClaimReward = (rewardName: string) => {
    toast.success(`🎉 ${rewardName} resgatado com sucesso!`, {
      description: "Apresente este cupom no estabelecimento.",
    });
  };

  const handleRewardClick = (reward: Reward) => {
    navigate("/reward", {
      state: {
        reward: reward as RewardDetailData,
      },
    });
  };

  if (!isMobile) {
    return (
      <div className="min-h-full bg-background w-full">
        <div className="pb-4">
          <h1 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Suas Recompensas
          </h1>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar recompensas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border border-border hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {filter.label}
              </button>
            );
          })}
        </div>
        {filteredRewards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Gift className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma recompensa encontrada</p>
            <p className="text-sm text-muted-foreground">Tente buscar com outros termos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-full max-w-full">
            {filteredRewards.map((reward, index) => (
              <div key={index} className="min-w-0">
                <RewardCard
                  {...reward}
                  onClaim={() => handleClaimReward(reward.title)}
                  onClick={() => handleRewardClick(reward)}
                />
              </div>
            ))}
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
              Suas Recompensas
            </h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-foreground/60" />
            <input
              type="text"
              placeholder="Buscar recompensas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/60 border border-secondary-foreground/30 focus:outline-none focus:ring-2 focus:ring-secondary-foreground/50"
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    isActive ? "gradient-secondary text-secondary-foreground shadow-md" : "bg-card text-card-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rewards List */}
        {filteredRewards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Gift className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma recompensa encontrada</p>
            <p className="text-sm text-muted-foreground">Tente buscar com outros termos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRewards.map((reward, index) => (
              <div
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${200 + index * 50}ms` }}
              >
                <RewardCard
                  {...reward}
                  onClaim={() => handleClaimReward(reward.title)}
                  onClick={() => handleRewardClick(reward)}
                />
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

export default RewardsPage;
