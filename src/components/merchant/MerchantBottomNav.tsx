import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Store, Tag, Gift, Settings } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", path: "/merchant/dashboard" },
  { icon: Store, label: "Lojas", id: "stores", path: "/merchant/stores" },
  { icon: Tag, label: "Ofertas", id: "offers", path: "/merchant/offers" },
  { icon: Gift, label: "Resgates", id: "redemptions", path: "/merchant/redemptions" },
  { icon: Settings, label: "Configurações", id: "settings", path: "/merchant/settings" },
];

interface MerchantBottomNavProps {
  activeTab?: string;
}

export default function MerchantBottomNav({ activeTab }: MerchantBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pressedTab, setPressedTab] = useState<string | null>(null);

  // Determinar tab ativo baseado na rota atual
  const getActiveTab = () => {
    if (activeTab) return activeTab;
    if (location.pathname.includes("/merchant/settings")) return "settings";
    if (location.pathname.includes("/merchant/redemptions")) return "redemptions";
    if (location.pathname.includes("/merchant/offers")) return "offers";
    if (location.pathname.includes("/merchant/stores") || location.pathname.includes("/merchant/store/")) return "stores";
    return "dashboard";
  };

  const currentActiveTab = getActiveTab();

  const handleTabPress = (id: string, path: string) => {
    setPressedTab(id);
    setTimeout(() => setPressedTab(null), 150);
    if (path) navigate(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        className="mx-auto flex max-w-md items-center justify-around px-2 sm:px-4"
        style={{
          height: "var(--bottom-nav-bar-height, 56px)",
          boxSizing: "border-box",
          paddingTop: "6px",
          paddingBottom: "6px",
        }}
      >
        {navItems.map((item) => {
          const isActive = currentActiveTab === item.id;
          const isPressed = pressedTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabPress(item.id, item.path)}
              className={`
                relative flex flex-col items-center gap-0.5 py-1 px-2 sm:px-3
                transition-all duration-200 flex-1
                ${isPressed ? 'scale-90' : ''}
              `}
            >
              <div className="relative">
                <Icon 
                  className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200 ${
                    isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                  } ${isPressed ? 'scale-90' : ''}`} 
                />
              </div>
              <span className={`text-[9px] sm:text-[10px] font-medium transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
