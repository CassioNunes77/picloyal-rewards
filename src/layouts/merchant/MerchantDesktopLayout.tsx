import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Store, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", path: "/merchant/dashboard" },
  { icon: Store, label: "Lojas", id: "stores", path: "/merchant/stores" },
  { icon: User, label: "Perfil", id: "profile", path: "/merchant/profile" },
  { icon: Settings, label: "Configurações", id: "settings", path: "/merchant/settings" },
];

export default function MerchantDesktopLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "Lojista";

  const getActiveId = () => {
    if (pathname.includes("/merchant/profile")) return "profile";
    if (pathname.includes("/merchant/settings")) return "settings";
    if (pathname.includes("/merchant/stores") || pathname.includes("/merchant/store/")) return "stores";
    return "dashboard";
  };

  const activeId = getActiveId();

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col">
      {/* Top menu: logo + nav + usuário */}
      <header className="sticky top-0 z-30 shrink-0 h-14 px-4 sm:px-6 border-b border-border bg-card/95 backdrop-blur flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <h2 className="font-bold text-lg text-card-foreground truncate shrink-0">
            Core+ Lojista
          </h2>
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 pl-2 border-l border-border text-sm text-card-foreground">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium truncate max-w-[140px] sm:max-w-[180px]">
              {displayName}
            </span>
          </div>
        </div>
      </header>

      {/* Área principal - sem container para permitir hero edge-to-edge */}
      <main className="flex-1 min-h-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
