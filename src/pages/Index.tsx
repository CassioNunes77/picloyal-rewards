import { useState } from "react";
import { QrCode, History, Tag, Store, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import LoyaltyCard from "@/components/LoyaltyCard";
import StampGrid from "@/components/StampGrid";
import RewardCard from "@/components/RewardCard";
import QuickAction from "@/components/QuickAction";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section with Gradient */}
      <div className="gradient-hero">
        <Header userName="Maria" notifications={2} />
        
        {/* Loyalty Card */}
        <div className="px-6 pb-8">
          <LoyaltyCard
            currentPoints={650}
            totalPoints={1000}
            userName="Maria Silva"
            cardNumber="**** **** **** 4589"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        {/* Quick Actions */}
        <div className="mb-6 flex justify-around">
          <QuickAction 
            icon={QrCode} 
            label="Escanear" 
            onClick={() => handleQuickAction("Scanner QR")}
          />
          <QuickAction 
            icon={History} 
            label="Histórico"
            onClick={() => handleQuickAction("Histórico")}
          />
          <QuickAction 
            icon={Tag} 
            label="Ofertas" 
            badge={3}
            onClick={() => handleQuickAction("Ofertas")}
          />
          <QuickAction 
            icon={Store} 
            label="Lojas"
            onClick={() => handleQuickAction("Lojas")}
          />
        </div>

        {/* Stamp Card */}
        <div className="mb-6">
          <StampGrid
            currentStamps={7}
            totalStamps={10}
            reward="1 Café Grátis"
          />
        </div>

        {/* Rewards Section */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Sparkles className="h-5 w-5 text-secondary" />
              Suas Recompensas
            </h2>
            <button className="text-sm font-medium text-primary">Ver todas</button>
          </div>
          
          <div className="space-y-3">
            {rewards.map((reward, index) => (
              <RewardCard
                key={index}
                {...reward}
                onClaim={() => handleClaimReward(reward.title)}
              />
            ))}
          </div>
        </div>

        {/* Promo Banner */}
        <div className="mb-6 overflow-hidden rounded-2xl gradient-secondary p-5 text-secondary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Oferta Especial</p>
              <h3 className="text-xl font-bold">Pontos em Dobro!</h3>
              <p className="mt-1 text-sm opacity-80">
                Válido até domingo, 23:59
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-foreground/20">
              <span className="text-2xl font-bold">2x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
