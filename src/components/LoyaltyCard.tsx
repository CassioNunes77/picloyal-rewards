import { Gift, Star, Sparkles } from "lucide-react";

interface LoyaltyCardProps {
  currentPoints: number;
  totalPoints: number;
  userName: string;
  cardNumber: string;
}

const LoyaltyCard = ({ currentPoints, totalPoints, userName, cardNumber }: LoyaltyCardProps) => {
  const progress = (currentPoints / totalPoints) * 100;
  
  return (
    <div className="relative overflow-hidden rounded-2xl gradient-card p-6 text-primary-foreground shadow-xl">
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/10" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary-foreground/5" />
      
      {/* Card content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium opacity-80">Core+</p>
              <p className="text-xs opacity-60">{cardNumber}</p>
            </div>
          </div>
          <Sparkles className="h-6 w-6 opacity-80" />
        </div>
        
        <div className="mt-6">
          <p className="text-sm opacity-80">Olá,</p>
          <h2 className="text-lg font-bold">{userName}</h2>
        </div>
        
        <div className="mt-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{currentPoints}</p>
              <p className="text-sm opacity-80">pontos</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Próxima recompensa</p>
              <p className="font-semibold">{totalPoints - currentPoints} pts</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs opacity-80">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-primary-foreground/20">
              <div 
                className="h-full rounded-full bg-primary-foreground transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < Math.floor(currentPoints / 200) ? 'fill-primary-foreground' : 'fill-primary-foreground/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCard;
