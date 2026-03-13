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
  onClick?: () => void;
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
  onClaim,
  onClick
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
      onClick={onClick}
      className={`
        flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm 
        transition-all duration-300 cursor-pointer w-full max-w-full box-border
        border border-border
        ${available ? 'ring-2 ring-primary ring-inset' : 'opacity-75'}
        ${isPressed ? 'scale-[0.98] shadow-sm' : 'hover:shadow-md'}
      `}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <div className={`
        flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
        transition-all duration-300
        ${available ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
        ${isPressed ? 'scale-95' : ''}
      `}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0 overflow-hidden">
        <h3 className="font-medium text-card-foreground text-xs truncate">{title}</h3>
        <p className="text-[10px] text-muted-foreground truncate">{description}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className={`font-medium ${available ? 'text-primary' : 'text-muted-foreground'}`}>
            {points} pontos
          </span>
          {expiresIn && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5 shrink-0" />
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
            shrink-0 px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-[10px] font-medium
            transition-all duration-200
            ${isClaimPressed ? 'scale-90 opacity-80' : 'hover:opacity-90 active:scale-95'}
          `}
        >
          Resgatar
        </button>
      ) : (
        <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isPressed ? 'translate-x-1' : ''}`} />
      )}
    </div>
  );
};

export default RewardCard;
