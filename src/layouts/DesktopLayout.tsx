import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { navItems, getActiveNavId } from "@/config/nav";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 200;

export default function DesktopLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeId = getActiveNavId(pathname);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 border-r border-border bg-card/95 backdrop-blur flex flex-col py-4 gap-1 px-3"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          const isPrimary = item.primary;

          if (isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(`${item.path}?showQR=1`)}
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
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 max-w-full flex justify-center" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <div className="w-full max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
