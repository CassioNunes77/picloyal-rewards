import { Clock, ChevronRight, Percent, Gift, Coffee, Pizza } from "lucide-react";
import { useState } from "react";

interface RewardCardProps {
  title: string;
  description: string;
  points: number;
  expiresIn?: string;
  icon: "percent" | "gift" | "coffee" | "pizza";
  available: boolean;
  onClaim?: () => void;
}

const iconMap = {
  percent: Percent,
  gift: Gift,
  coffee: Coffee,
  pizza: Pizza,
};

const RewardCard = ({ 
  title, 
  description, 
  points, 
  expiresIn, 
  icon, 
  available,
  onClaim 
}: RewardCardProps) => {
  const Icon = iconMap[icon];
  const [isPressed, setIsPressed] = useState(false);
  const [isClaimPressed, setIsClaimPressed] = useState(false);

  const handleClaim = () => {
    setIsClaimPressed(true);
    setTimeout(() => {
      setIsClaimPressed(false);
      onClaim?.();
    }, 150);
  };
  
  return (
    <div 
      className={`
        flex items-center gap-4 rounded-xl bg-card p-4 shadow-md 
        transition-all duration-300 cursor-pointer
        ${available ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-75'}
        ${isPressed ? 'scale-[0.98] shadow-sm' : 'hover:shadow-lg'}
      `}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <div className={`
        flex h-14 w-14 shrink-0 items-center justify-center rounded-xl
        transition-all duration-300
        ${available ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
        ${isPressed ? 'scale-95' : ''}
      `}>
        <Icon className="h-6 w-6" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-card-foreground truncate">{title}</h4>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`text-xs font-medium ${available ? 'text-primary' : 'text-muted-foreground'}`}>
            {points} pontos
          </span>
          {expiresIn && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {expiresIn}
            </span>
          )}
        </div>
      </div>
      
      {available ? (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleClaim();
          }}
          className={`
            shrink-0 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium
            transition-all duration-200
            ${isClaimPressed ? 'scale-90 opacity-80' : 'hover:opacity-90 active:scale-95'}
          `}
        >
          Resgatar
        </button>
      ) : (
        <ChevronRight className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isPressed ? 'translate-x-1' : ''}`} />
      )}
    </div>
  );
};

export default RewardCard;
