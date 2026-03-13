import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, Tag, Gift, Store, Sparkles, MessageCircle, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getUserData, updateUserData } from "@/services/usersService";
import { useIsMobile } from "@/hooks/use-mobile";

interface NotificationSetting {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  key: keyof NotificationPreferences;
}

interface NotificationPreferences {
  offers: boolean;
  rewards: boolean;
  stores: boolean;
  points: boolean;
  messages: boolean;
  pushEnabled: boolean;
}

const defaultPreferences: NotificationPreferences = {
  offers: true,
  rewards: true,
  stores: true,
  points: true,
  messages: true,
  pushEnabled: true,
};

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  const settings: NotificationSetting[] = [
    {
      id: "offers",
      icon: Tag,
      label: "Ofertas",
      description: "Novas ofertas e promoções",
      key: "offers",
    },
    {
      id: "rewards",
      icon: Gift,
      label: "Recompensas",
      description: "Resgates e recompensas disponíveis",
      key: "rewards",
    },
    {
      id: "stores",
      icon: Store,
      label: "Lojas",
      description: "Novidades das lojas parceiras",
      key: "stores",
    },
    {
      id: "points",
      icon: Sparkles,
      label: "Pontos",
      description: "Acúmulo e expiração de pontos",
      key: "points",
    },
    {
      id: "messages",
      icon: MessageCircle,
      label: "Mensagens",
      description: "Comunicados e atualizações",
      key: "messages",
    },
  ];

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      try {
        const data = await getUserData(user.uid);
        if (data?.notificationPreferences) {
          setPreferences({ ...defaultPreferences, ...data.notificationPreferences });
        }
      } catch (error) {
        console.error("Erro ao carregar preferências:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user?.uid) return;
    
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    setSaving(true);
    try {
      await updateUserData(user.uid, { notificationPreferences: newPreferences });
      toast.success(value ? "Notificação ativada" : "Notificação desativada");
    } catch (error) {
      console.error("Erro ao salvar preferência:", error);
      toast.error("Erro ao salvar. Tente novamente.");
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAll = async (enabled: boolean) => {
    if (!user?.uid) return;
    
    const newPreferences: NotificationPreferences = {
      offers: enabled,
      rewards: enabled,
      stores: enabled,
      points: enabled,
      messages: enabled,
      pushEnabled: enabled,
    };
    setPreferences(newPreferences);
    
    setSaving(true);
    try {
      await updateUserData(user.uid, { notificationPreferences: newPreferences });
      toast.success(enabled ? "Todas as notificações ativadas" : "Todas as notificações desativadas");
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
          <p className="text-xs text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-xl p-3 mb-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Notificações Push</p>
                  <p className="text-[10px] text-muted-foreground">Ativar ou desativar todas</p>
                </div>
              </div>
              <Switch
                checked={preferences.pushEnabled}
                onCheckedChange={(checked) => handleToggleAll(checked)}
                disabled={saving}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">Tipos de notificação</p>
            {settings.map((setting) => {
              const Icon = setting.icon;
              return (
                <div
                  key={setting.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border transition-opacity ${
                    !preferences.pushEnabled ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                      <Icon className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{setting.label}</p>
                      <p className="text-[10px] text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[setting.key]}
                    onCheckedChange={(checked) => handleToggle(setting.key, checked)}
                    disabled={saving || !preferences.pushEnabled}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-6 px-4">
            As notificações ajudam você a ficar por dentro das melhores ofertas e recompensas.
          </p>
        </>
      )}
    </>
  );

  if (!isMobile) {
    return (
      <div className="min-h-full bg-background w-full">
        <div className="pb-4">
          <h1 className="text-xl font-bold text-card-foreground">Notificações</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie suas preferências de notificação</p>
        </div>
        <div className="max-w-lg">{content}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero pb-6 pt-10 px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-all duration-200 active:scale-90"
          >
            <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">Notificações</h1>
            <p className="text-xs text-primary-foreground/80 mt-0.5">Gerencie suas preferências</p>
          </div>
        </div>
      </div>

      <div className="relative -mt-4 rounded-t-3xl bg-background px-5 pt-5 pb-8">
        {content}
      </div>
    </div>
  );
}
