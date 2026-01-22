import { Check, Gift } from "lucide-react";

interface StampGridProps {
  currentStamps: number;
  totalStamps: number;
  reward: string;
}

const StampGrid = ({ currentStamps, totalStamps, reward }: StampGridProps) => {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-card-foreground">Seus Carimbos</h3>
        <span className="text-sm text-muted-foreground">{currentStamps}/{totalStamps}</span>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: totalStamps }).map((_, index) => {
          const isStamped = index < currentStamps;
          const isReward = index === totalStamps - 1;
          
          return (
            <div
              key={index}
              className={`
                flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all duration-300
                ${isReward 
                  ? isStamped 
                    ? 'border-primary bg-primary text-primary-foreground animate-pulse' 
                    : 'border-secondary bg-secondary/10 text-secondary'
                  : isStamped
                    ? 'border-primary bg-primary text-primary-foreground scale-100'
                    : 'border-border bg-muted/50 text-muted-foreground scale-95 opacity-50'
                }
              `}
            >
              {isReward ? (
                <Gift className="h-5 w-5" />
              ) : isStamped ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 rounded-lg bg-accent p-3">
        <p className="text-center text-sm text-accent-foreground">
          <Gift className="mr-1 inline-block h-4 w-4" />
          Complete {totalStamps} carimbos e ganhe: <strong>{reward}</strong>
        </p>
      </div>
    </div>
  );
};

export default StampGrid;
