import { useState, useEffect } from "react";
import { Bell, Tag, Star, Gift, CheckCircle, Clock, Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationData,
  type NotificationType,
} from "@/services/notificationsService";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

const NotificationsPage = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getNotifications(user.uid)
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [user?.uid]);

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

  const getTypeColor = (type: NotificationType | string) => {
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

  const markAsRead = async (notification: NotificationData) => {
    if (!user?.uid || notification.isRead) return;
    try {
      await markNotificationAsRead(notification.id, user.uid);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      toast.success("Notificação marcada como lida");
    } catch {
      toast.error("Erro ao marcar como lida");
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid || unreadCount === 0) return;
    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("Todas as notificações foram marcadas como lidas");
    } catch {
      toast.error("Erro ao marcar todas como lidas");
    }
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.isRead) {
      markAsRead(notification);
    }
  };

  const iconForNotification = (n: NotificationData) =>
    n.icon || (n.type === "offer" ? "tag" : n.type === "points" ? "star" : n.type === "reward" ? "gift" : "check");

  if (!isMobile) {
    return (
      <div className="min-h-full bg-background">
        <div className="pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-card-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
              {unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-sm font-medium text-primary hover:underline">
              Marcar todas
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma notificação</p>
            <p className="text-sm text-muted-foreground">Você está em dia!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const IconComponent = getIcon(iconForNotification(notification));
              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left rounded-xl p-4 shadow-sm transition-all hover:shadow-md border ${
                    notification.isRead ? "bg-card border-border" : "bg-card/70 border-primary/20"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${getTypeColor(notification.type)}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-card-foreground text-base">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-all duration-200 active:scale-90 active:bg-primary-foreground/30">
                <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
              </Link>
              <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary-foreground" />
                <h1 className="text-xl font-bold text-primary-foreground">Notificações</h1>
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                Marcar todas
              </button>
            )}
          </div>
        </header>
      </div>
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma notificação</p>
            <p className="text-sm text-muted-foreground">Você está em dia!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const IconComponent = getIcon(iconForNotification(notification));
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
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${getTypeColor(notification.type)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
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
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
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
    </div>
  );
};

export default NotificationsPage;
