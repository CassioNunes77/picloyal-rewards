import { LucideIcon } from "lucide-react";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  badge?: number;
}

const QuickAction = ({ icon: Icon, label, onClick, badge }: QuickActionProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 transition-transform active:scale-95"
    >
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-md">
        <Icon className="h-6 w-6 text-secondary" />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
};

export default QuickAction;
