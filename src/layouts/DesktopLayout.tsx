import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { navItems, getActiveNavId } from "@/config/nav";
import { cn } from "@/lib/utils";
import QRCodeCard from "@/components/QRCodeCard";
import LoyaltyCard from "@/components/LoyaltyCard";
import LocationSelector from "@/components/LocationSelector";
import { useQR } from "@/contexts/QRContext";
import { useAuth } from "@/contexts/AuthContext";
import { User, Bell, Settings, Crown } from "lucide-react";
import { Link } from "react-router-dom";

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
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 pl-2 border-l border-border text-sm text-card-foreground hover:bg-muted/50 rounded-lg px-2 py-1.5 -mr-2 transition-colors"
          >
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium truncate max-w-[140px] sm:max-w-[180px]">
              {displayName}
            </span>
          </button>
        </div>
      </header>

      {/* Área principal: cartão e conteúdo no mesmo fluxo, sem divisória */}
      <main className="flex-1 min-h-0 overflow-auto">
        <div className="p-6 flex gap-6 min-h-full">
          <div className="w-[300px] shrink-0 flex flex-col gap-4">
            <LoyaltyCard
              currentPoints={650}
              totalPoints={1000}
              userName={displayName}
              cardNumber="**** **** **** 4589"
            />
            <Link
              to="/premium"
              className="w-full overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-5 text-white
                         transition-all duration-300 hover:shadow-md flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium opacity-90">Seja Premium</p>
                <p className="text-xs opacity-80">Desbloqueie benefícios exclusivos</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Crown className="h-6 w-6" />
              </div>
            </Link>
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
