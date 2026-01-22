import { Home, Gift, QrCode, Bell, User } from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Início", id: "home" },
  { icon: Gift, label: "Recompensas", id: "rewards" },
  { icon: QrCode, label: "Escanear", id: "scan", primary: true },
  { icon: Bell, label: "Notificações", id: "notifications", badge: 2 },
  { icon: User, label: "Perfil", id: "profile" },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-inset">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 pb-2 pt-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          if (item.primary) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex -mt-6 h-16 w-16 items-center justify-center rounded-full gradient-secondary shadow-lg transition-transform active:scale-95"
              >
                <Icon className="h-7 w-7 text-secondary-foreground" />
              </button>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center gap-1 py-2 transition-colors"
            >
              <div className="relative">
                <Icon 
                  className={`h-6 w-6 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`} 
                />
                {item.badge && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
