import { Check, Gift } from "lucide-react";
import { useState } from "react";

interface StampGridProps {
  currentStamps: number;
  totalStamps: number;
  reward: string;
  storeName?: string;
}

const StampGrid = ({ currentStamps, totalStamps, reward, storeName }: StampGridProps) => {
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  return (
    <div className="rounded-2xl bg-card p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-card-foreground truncate pr-2">{storeName || "Seus Carimbos"}</h3>
        <span className="text-sm text-muted-foreground">{currentStamps}/{totalStamps}</span>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: totalStamps }).map((_, index) => {
          const isStamped = index < currentStamps;
          const isReward = index === totalStamps - 1;
          const isPressed = pressedIndex === index;
          
          return (
            <div
              key={index}
              onMouseDown={() => setPressedIndex(index)}
              onMouseUp={() => setPressedIndex(null)}
              onMouseLeave={() => setPressedIndex(null)}
              onTouchStart={() => setPressedIndex(index)}
              onTouchEnd={() => setPressedIndex(null)}
              className={`
                flex h-12 w-12 items-center justify-center rounded-xl border-2 
                transition-all duration-300 cursor-pointer
                ${isReward 
                  ? isStamped 
                    ? 'border-primary bg-primary text-primary-foreground animate-pulse' 
                    : 'border-secondary bg-secondary/10 text-secondary'
                  : isStamped
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted/50 text-muted-foreground opacity-50'
                }
                ${isPressed ? 'scale-90' : isStamped ? 'scale-100' : 'scale-95'}
                ${isStamped && !isReward ? 'animate-scale-in' : ''}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isReward ? (
                <Gift className={`h-5 w-5 transition-transform duration-200 ${isPressed ? 'scale-90' : ''}`} />
              ) : isStamped ? (
                <Check className={`h-5 w-5 transition-transform duration-200 ${isPressed ? 'scale-90' : ''}`} />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 rounded-lg bg-accent p-3 transition-all duration-200 hover:bg-accent/80">
        <p className="text-center text-sm text-accent-foreground">
          <Gift className="mr-1 inline-block h-4 w-4" />
          Complete {totalStamps} carimbos e ganhe: <strong>{reward}</strong>
        </p>
      </div>
    </div>
  );
};

export default StampGrid;
