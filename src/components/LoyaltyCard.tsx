import { Gift, Star, Sparkles } from "lucide-react";

interface LoyaltyCardProps {
  currentPoints: number;
  totalPoints: number;
  userName: string;
  cardNumber: string;
  accountType?: "FREE" | "PREMIUM";
}

const LoyaltyCard = ({ currentPoints, totalPoints, userName, cardNumber, accountType = "FREE" }: LoyaltyCardProps) => {
  const progress = (currentPoints / totalPoints) * 100;
  
  return (
    <div className="relative overflow-hidden rounded-2xl gradient-card px-4 py-6 text-primary-foreground shadow-xl" style={{ height: '200px' }}>
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/10" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary-foreground/5" />
      
      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium opacity-80">Core+</p>
              <p className="text-[10px] opacity-60">{cardNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                accountType === "PREMIUM"
                  ? "bg-amber-300/25 text-amber-100"
                  : "bg-primary-foreground/20 text-primary-foreground"
              }`}
            >
              {accountType}
            </span>
            <Sparkles className="h-5 w-5 opacity-80" />
          </div>
        </div>
        
        <div className="mt-3">
          <h2 className="text-lg font-bold">{userName}</h2>
        </div>
        
        <div className="mt-3 flex-1">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">{currentPoints}</p>
              <p className="text-xs opacity-80">pontos</p>
            </div>
            <div className="text-right">
              {/* Stars acima de "Próxima recompensa" */}
              <div className="flex items-center justify-end gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3.5 w-3.5 ${i < Math.floor(currentPoints / 200) ? 'fill-primary-foreground' : 'fill-primary-foreground/30'}`}
                  />
                ))}
              </div>
              <p className="text-xs opacity-80">Próxima recompensa</p>
              <p className="text-sm font-semibold">{totalPoints - currentPoints} pts</p>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between text-[10px] opacity-80">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-primary-foreground/20">
              <div 
                className="h-full rounded-full bg-primary-foreground transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCard;
