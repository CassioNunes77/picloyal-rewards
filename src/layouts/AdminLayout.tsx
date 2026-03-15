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
  Mail,
  LogOut,
  Menu,
  X,
  BarChart3,
  Shield,
  Activity,
  Users,
  Megaphone,
  Star,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";

const adminNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "dashboard" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "analytics" },
  { id: "locations", label: "Regiões", icon: MapPin, path: "locations" },
  { id: "categories", label: "Categorias", icon: Tag, path: "categories" },
  { id: "stores", label: "Lojas", icon: Store, path: "stores" },
  { id: "products", label: "Ofertas", icon: Package, path: "products" },
  { id: "campaigns", label: "Campanhas", icon: Megaphone, path: "campaigns" },
  { id: "destaques", label: "Destaques", icon: Star, path: "destaques" },
  { id: "activities", label: "Atividades", icon: Activity, path: "activities" },
  { id: "feedback", label: "Feedback", icon: MessageSquare, path: "feedback" },
  { id: "messages", label: "Mensagens", icon: Mail, path: "messages" },
  { id: "admins", label: "Administradores", icon: Users, path: "admins" },
  { id: "privacy", label: "Política de Privacidade", icon: Shield, path: "privacy" },
  { id: "terms", label: "Termos de Uso", icon: FileText, path: "terms" },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeId = adminNavItems.find((item) => pathname.includes(item.path))?.id || "dashboard";

  // Atualizar título da página
  useEffect(() => {
    document.title = "Core+ Painel Administrativo";
    return () => {
      // Restaurar título padrão ao sair
      document.title = "Core+";
    };
  }, []);

  const handleLogout = async () => {
    await logout();
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
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-lg text-card-foreground">Core+</h2>
            <p className="text-xs text-muted-foreground">Painel Administrativo</p>
          </div>
          <div className="w-9" />
        </header>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur">
            <div className="flex flex-col h-full">
              <div className="px-3 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-card-foreground">Menu</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg text-card-foreground hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
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
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-sm",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-card-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="px-2 py-2 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all text-sm"
                >
                  <LogOut className="h-4 w-4" />
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
      {/* Sidebar - densidade aumentada */}
      <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="px-3 py-3 border-b border-border">
          <h2 className="font-bold text-base text-card-foreground">Core+</h2>
          <p className="text-[11px] text-muted-foreground">Painel Administrativo</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/sys-admin-panel-7x9k/${item.path}`)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-sm",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-card-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-2 py-2 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all text-sm"
          >
            <LogOut className="h-4 w-4 shrink-0" />
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
