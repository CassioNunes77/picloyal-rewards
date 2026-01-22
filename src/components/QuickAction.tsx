import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  badge?: number;
}

const QuickAction = ({ icon: Icon, label, onClick, badge }: QuickActionProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`
        flex flex-col items-center gap-2 
        transition-all duration-200 
        ${isPressed ? 'scale-90' : 'scale-100'}
      `}
    >
      <div className={`
        relative flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-md
        transition-all duration-200
        ${isPressed ? 'shadow-sm bg-muted scale-95' : 'hover:shadow-lg'}
      `}>
        <Icon className={`h-6 w-6 text-secondary transition-transform duration-200 ${isPressed ? 'scale-90' : ''}`} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground animate-bounce-sm">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
};

export default QuickAction;
