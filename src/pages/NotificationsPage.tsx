import { useState } from "react";
import { Bell, Tag, Star, Gift, CheckCircle, Clock, Sparkles, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: "tag" | "star" | "gift" | "check" | "clock" | "sparkles";
  type: "offer" | "points" | "reward" | "system";
  isRead: boolean;
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Nova Oferta Disponível!",
      message: "20% OFF em todas as bebidas do Café Central",
      time: "Há 5 minutos",
      icon: "tag",
      type: "offer",
      isRead: false,
    },
    {
      id: 2,
      title: "Pontos Adicionados",
      message: "Você ganhou 50 pontos pela sua última compra",
      time: "Há 1 hora",
      icon: "star",
      type: "points",
      isRead: false,
    },
    {
      id: 3,
      title: "Recompensa Disponível",
      message: "Você pode resgatar: 1 Café Grátis",
      time: "Há 2 horas",
      icon: "gift",
      type: "reward",
      isRead: true,
    },
    {
      id: 4,
      title: "Lembrete de Oferta",
      message: "A oferta 'Compre 2, Leve 3' expira em 2 dias",
      time: "Há 3 horas",
      icon: "clock",
      type: "offer",
      isRead: true,
    },
    {
      id: 5,
      title: "Bem-vindo!",
      message: "Obrigado por se juntar ao nosso programa de fidelidade",
      time: "Há 1 dia",
      icon: "check",
      type: "system",
      isRead: true,
    },
    {
      id: 6,
      title: "Pontos em Dobro",
      message: "Esta semana você ganha o dobro de pontos em todas as compras",
      time: "Há 2 dias",
      icon: "sparkles",
      type: "points",
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "tag":
        return Tag;
      case "star":
        return Star;
      case "gift":
        return Gift;
      case "check":
        return CheckCircle;
      case "clock":
        return Clock;
      case "sparkles":
        return Sparkles;
      default:
        return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "offer":
        return "bg-primary/10 text-primary";
      case "points":
        return "bg-secondary/10 text-secondary";
      case "reward":
        return "bg-green-500/10 text-green-500";
      case "system":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const markAsRead = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );
    toast.success("Notificação marcada como lida");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("Todas as notificações foram marcadas como lidas");
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification);
    }
    // Aqui você pode adicionar navegação para detalhes da notificação
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                to="/home"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 
                           transition-all duration-200 active:scale-90 active:bg-primary-foreground/30"
              >
                <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
              </Link>
              <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary-foreground" />
                <h1 className="text-2xl font-bold text-primary-foreground">Notificações</h1>
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-medium text-primary-foreground/90 
                         hover:text-primary-foreground transition-colors"
              >
                Marcar todas
              </button>
            )}
          </div>
        </header>
      </div>

      {/* Content */}
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma notificação</p>
            <p className="text-sm text-muted-foreground">Você está em dia!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const IconComponent = getIcon(notification.icon);
              return (
                <div
                  key={notification.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${100 + index * 50}ms` }}
                >
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left rounded-xl p-4 shadow-sm 
                             transition-all duration-300 hover:shadow-md active:scale-[0.98]
                             ${notification.isRead ? "bg-card" : "bg-card/70"}`}
                    style={{
                      border: notification.isRead
                        ? "none"
                        : `1px solid ${notification.type === "offer" ? "rgba(var(--primary), 0.3)" : notification.type === "points" ? "rgba(var(--secondary), 0.3)" : notification.type === "reward" ? "rgba(34, 197, 94, 0.3)" : "rgba(var(--muted-foreground), 0.3)"}`,
                    }}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${getTypeColor(notification.type)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-card-foreground text-base">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 mt-2 ${
                                notification.type === "offer"
                                  ? "bg-primary"
                                  : notification.type === "points"
                                  ? "bg-secondary"
                                  : notification.type === "reward"
                                  ? "bg-green-500"
                                  : "bg-muted-foreground"
                              }`}
                            />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default NotificationsPage;
