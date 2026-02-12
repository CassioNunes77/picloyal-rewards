import { LayoutDashboard, Store, User, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function MerchantBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/merchant/dashboard",
    },
    {
      id: "stores",
      label: "Lojas",
      icon: Store,
      path: "/merchant/stores",
    },
    {
      id: "profile",
      label: "Perfil",
      icon: User,
      path: "/merchant/profile",
    },
    {
      id: "settings",
      label: "Configurações",
      icon: Settings,
      path: "/merchant/settings",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-card-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className={cn("text-xs font-medium", active && "text-primary")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
