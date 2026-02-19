import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { navItems, getActiveNavId } from "@/config/nav";
import { cn } from "@/lib/utils";
import QRCodeCard from "@/components/QRCodeCard";
import LoyaltyCard from "@/components/LoyaltyCard";
import LocationSelector from "@/components/LocationSelector";
import { useQR } from "@/contexts/QRContext";
import { useAuth } from "@/contexts/AuthContext";
import { User, Bell, Settings } from "lucide-react";

export default function DesktopLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeId = getActiveNavId(pathname);
  const { showQR, openQR, closeQR } = useQR();
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "Usuário";

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col">
      {/* Top menu: logo + nav + notif/config + usuário */}
      <header className="sticky top-0 z-30 shrink-0 h-14 px-4 sm:px-6 border-b border-border bg-card/95 backdrop-blur flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <h2 className="font-bold text-lg text-card-foreground truncate shrink-0">
            Core+
          </h2>
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              const isPrimary = item.primary;

              if (isPrimary) {
                return (
                  <button
                    key={item.id}
                    onClick={() => openQR()}
                    className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm hover:shadow transition-all"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              }

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
          <LocationSelector variant="header" />
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors"
            aria-label="Configurações"
          >
            <Settings className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-border text-sm text-card-foreground">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium truncate max-w-[140px] sm:max-w-[180px]">
              {displayName}
            </span>
          </div>
        </div>
      </header>

      {/* Área principal: cartão e conteúdo no mesmo fluxo, sem divisória */}
      <main className="flex-1 min-h-0 overflow-auto">
        <div className="p-6 flex gap-6 min-h-full">
          <div className="w-[300px] shrink-0">
            <LoyaltyCard
              currentPoints={650}
              totalPoints={1000}
              userName={displayName}
              cardNumber="**** **** **** 4589"
            />
          </div>
          <div
            className="flex-1 min-w-0 min-h-[60vh] flex flex-col overflow-auto bg-background rounded-lg"
            style={{ minHeight: "400px" }}
          >
            <Outlet />
          </div>
        </div>
      </main>
      <QRCodeCard isOpen={showQR} onClose={closeQR} />
    </div>
  );
}
