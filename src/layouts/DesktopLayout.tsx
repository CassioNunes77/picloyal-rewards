import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { navItems, getActiveNavId } from "@/config/nav";
import { cn } from "@/lib/utils";
import QRCodeCard from "@/components/QRCodeCard";
import { useQR } from "@/contexts/QRContext";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";

const SIDEBAR_WIDTH = 220;

export default function DesktopLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeId = getActiveNavId(pathname);
  const { showQR, openQR, closeQR } = useQR();
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "Usuário";

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 w-[220px] border-r border-border bg-card shadow-sm flex flex-col"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg text-card-foreground truncate">Cartão Fidelidade</h2>
        </div>
        <nav className="flex-1 py-4 gap-1 px-3 flex flex-col overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            const isPrimary = item.primary;

            if (isPrimary) {
              return (
                <button
                  key={item.id}
                  onClick={() => openQR()}
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-all"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex h-11 w-full items-center gap-3 rounded-lg px-3 transition-colors",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Dashboard area: header + full-width content */}
      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: SIDEBAR_WIDTH }}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 shrink-0 h-14 px-6 border-b border-border bg-card/95 backdrop-blur flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground capitalize">
            {activeId === "home" && "Início"}
            {activeId === "offers" && "Ofertas"}
            {activeId === "stores" && "Lojas"}
            {activeId === "profile" && "Perfil"}
            {activeId === "notifications" && "Notificações"}
            {activeId === "history" && "Atividades"}
            {activeId === "rewards" && "Recompensas"}
          </div>
          <div className="flex items-center gap-2 text-sm text-card-foreground">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium truncate max-w-[180px]">{displayName}</span>
          </div>
        </header>

        {/* Main content - usa toda a área útil */}
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="w-full h-full min-h-full p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <QRCodeCard isOpen={showQR} onClose={closeQR} />
    </div>
  );
}
