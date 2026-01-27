import { Home, Tag, QrCode, Store, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Início", id: "home", path: "/" },
  { icon: Tag, label: "Ofertas", id: "offers", path: "/offers" },
  { icon: QrCode, label: "Escanear", id: "scan", primary: true, path: "/" },
  { icon: Store, label: "Lojas", id: "stores", path: "/stores" },
  { icon: User, label: "Perfil", id: "profile", path: "/profile" },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navigate = useNavigate();
  const [pressedTab, setPressedTab] = useState<string | null>(null);

  const handleTabPress = (id: string, path?: string) => {
    setPressedTab(id);
    setTimeout(() => setPressedTab(null), 150);
    onTabChange(id);
    if (path) {
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-inset">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 pb-2 pt-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isPressed = pressedTab === item.id;
          const Icon = item.icon;
          
          if (item.primary) {
            return (
              <button
                key={item.id}
                onClick={() => handleTabPress(item.id, item.path)}
                className={`
                  flex -mt-6 h-16 w-16 items-center justify-center rounded-full gradient-secondary shadow-lg 
                  transition-all duration-200
                  ${isPressed ? 'scale-90 shadow-md' : 'hover:shadow-xl active:scale-95'}
                `}
              >
                <Icon className={`h-7 w-7 text-secondary-foreground transition-transform duration-200 ${isPressed ? 'scale-90' : ''}`} />
              </button>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabPress(item.id, item.path)}
              className={`
                relative flex flex-col items-center gap-1 py-2 
                transition-all duration-200
                ${isPressed ? 'scale-90' : ''}
              `}
            >
              <div className="relative">
                <Icon 
                  className={`h-6 w-6 transition-all duration-200 ${
                    isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                  } ${isPressed ? 'scale-90' : ''}`} 
                />
                {item.badge && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
