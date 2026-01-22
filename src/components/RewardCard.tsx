import { Clock, ChevronRight, Percent, Gift, Coffee, Pizza } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  
  return (
    <div className={`
      flex items-center gap-4 rounded-xl bg-card p-4 shadow-md transition-all duration-300
      ${available ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-75'}
    `}>
      <div className={`
        flex h-14 w-14 shrink-0 items-center justify-center rounded-xl
        ${available ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
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
        <Button 
          size="sm" 
          onClick={onClaim}
          className="shrink-0 gradient-primary border-0 text-primary-foreground hover:opacity-90"
        >
          Resgatar
        </Button>
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}
    </div>
  );
};

export default RewardCard;
