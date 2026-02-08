import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MapPin,
  Tag,
  Store,
  Package,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Settings,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

const adminNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "dashboard" },
  { id: "locations", label: "Localização", icon: MapPin, path: "locations" },
  { id: "categories", label: "Categorias", icon: Tag, path: "categories" },
  { id: "stores", label: "Lojas", icon: Store, path: "stores" },
  { id: "products", label: "Produtos", icon: Package, path: "products" },
  { id: "feedback", label: "Feedback", icon: MessageSquare, path: "feedback" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "analytics" },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeId = adminNavItems.find((item) => pathname.includes(item.path))?.id || "dashboard";

  const handleLogout = () => {
    logout();
    navigate("/sys-admin-panel-7x9k/login", { replace: true });
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 shrink-0 h-14 px-4 border-b border-border bg-card/95 backdrop-blur flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-card-foreground hover:bg-muted"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h2 className="font-bold text-lg text-card-foreground">Admin Panel</h2>
          <div className="w-9" />
        </header>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-card-foreground">Menu</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg text-card-foreground hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(`/sys-admin-panel-7x9k/${item.path}`);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-card-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="font-bold text-xl text-card-foreground mb-1">Admin Panel</h2>
          <p className="text-xs text-muted-foreground">Painel Administrativo</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/sys-admin-panel-7x9k/${item.path}`)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-card-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
