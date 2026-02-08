import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Gift, 
  Star,
  Edit,
  ChevronRight,
  Camera,
  Bell,
  Shield,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ProfilePage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, loading, signOut, updateEmail, getProfile, updatePhone } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [profilePhone, setProfilePhone] = useState("");
  const [editDialog, setEditDialog] = useState<"email" | "phone" | null>(null);
  const [tempEmail, setTempEmail] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !getProfile) return;
    getProfile()
      .then((p) => {
        if (p && typeof p === "object" && "phone" in p) {
          setProfilePhone(p.phone ?? "");
        }
      })
      .catch((err) => {
        console.warn("Failed to load profile:", err);
      });
  }, [user, getProfile]);

  const userStats = [
    { label: "Pontos", value: "650", icon: Star, color: "text-primary" },
    { label: "Carimbos", value: "7/10", icon: Gift, color: "text-secondary" },
    { label: "Recompensas", value: "12", icon: Star, color: "text-accent-foreground" },
  ];

  const handleEditProfile = () => {
    toast.info("Editando perfil...");
  };

  const closeEditDialog = () => {
    setEditDialog(null);
    setTempEmail("");
    setTempPassword("");
    setTempPhone("");
  };

  const handleSaveEmail = async () => {
    if (!tempEmail.trim()) {
      toast.error("Informe o novo e-mail.");
      return;
    }
    if (!tempPassword) {
      toast.error("Informe sua senha atual para confirmar.");
      return;
    }
    setSaving(true);
    try {
      await updateEmail(tempEmail.trim(), tempPassword);
      toast.success("E-mail atualizado.");
      closeEditDialog();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar e-mail.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePhone = async () => {
    const trimmed = tempPhone.trim();
    setSaving(true);
    try {
      await updatePhone(trimmed);
      setProfilePhone(trimmed);
      toast.success("Telefone atualizado.");
      closeEditDialog();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar telefone.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Deseja realmente sair da sua conta?")) return;
    try {
      await signOut();
      toast.success("Até logo! 👋");
    } catch {
      toast.error("Erro ao sair.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    navigate("/", { replace: true });
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecionando...</p>
      </div>
    );
  }

  const profileHeader = (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-primary flex items-center justify-center ring-2 ring-border">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="h-12 w-12 text-primary-foreground" />
          )}
        </div>
        <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center shadow transition-all active:scale-90">
          <Camera className="h-4 w-4 text-primary" />
        </button>
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-card-foreground mb-1">
          {user.displayName || user.email?.split("@")[0] || "Usuário"}
        </h2>
        <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Membro VIP ⭐</span>
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">Desde 2023</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!isMobile ? (
        <div className="min-h-full bg-background w-full">
          <div className="pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-card-foreground">Perfil</h1>
            </div>
            <button onClick={handleEditProfile} className="text-sm font-medium text-primary hover:underline">Editar</button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Coluna Esquerda: Informações Iniciais e Pessoais */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">{profileHeader}</div>
              <div className="grid grid-cols-3 gap-4">
                {userStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-card rounded-xl p-4 text-center shadow-md border border-border">
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                      <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Informações Pessoais</h3>
                <div className="space-y-2">
                  <ProfileInfoItem icon={Mail} label="E-mail" value={user.email ?? ""} delay={0} onEdit={() => {
                    setTempEmail(user?.email ?? "");
                    setTempPassword("");
                    setEditDialog("email");
                  }} />
                  <ProfileInfoItem icon={Phone} label="Telefone" value={profilePhone || "—"} delay={0} onEdit={() => {
                    setTempPhone(profilePhone);
                    setEditDialog("phone");
                  }} />
                </div>
              </div>
            </div>

            {/* Coluna Direita: Preferências e Conta */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Preferências</h3>
                <div className="space-y-2">
                  <ProfileInfoItem icon={Bell} label="Notificações" value={notifications ? "Ativadas" : "Desativadas"} delay={0} onEdit={() => setNotifications(!notifications)} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Conta</h3>
                <div className="space-y-2">
                  <button onClick={() => toast.info("Abrindo histórico...")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border text-left hover:bg-muted/50">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span className="text-card-foreground">Histórico de Recompensas</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                  <button onClick={() => toast.info("Abrindo configurações de segurança...")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border text-left hover:bg-muted/50">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <span className="text-card-foreground">Segurança</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20">
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sair da conta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="gradient-card">
            <header className="px-6 pt-12 pb-6">
              <div className="flex items-center gap-4 mb-4">
                <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-all duration-200 active:scale-90 active:bg-primary-foreground/30">
                  <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
                </Link>
                <h1 className="text-xl font-bold text-primary-foreground flex-1">Perfil</h1>
                <button onClick={handleEditProfile} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-all duration-200 active:scale-90 active:bg-primary-foreground/30">
                  <Edit className="h-5 w-5 text-primary-foreground" />
                </button>
              </div>
              <div>{profileHeader}</div>
            </header>
          </div>
          <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
              {userStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-card rounded-xl p-4 text-center shadow-md transition-all duration-200 active:scale-95"
                    style={{ animationDelay: `${200 + index * 50}ms` }}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Personal Information */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 animate-fade-in" style={{ animationDelay: '300ms' }}>
                Informações Pessoais
              </h3>
              <div className="space-y-2">
                <ProfileInfoItem
                  icon={Mail}
                  label="E-mail"
                  value={user.email ?? ""}
                  delay={350}
                  onEdit={() => {
                    setTempEmail(user?.email ?? "");
                    setTempPassword("");
                    setEditDialog("email");
                  }}
                />
                <ProfileInfoItem
                  icon={Phone}
                  label="Telefone"
                  value={profilePhone || "—"}
                  delay={400}
                  onEdit={() => {
                    setTempPhone(profilePhone);
                    setEditDialog("phone");
                  }}
                />
                <ProfileInfoItem
                  icon={MapPin}
                  label="Endereço"
                  value="Rua Exemplo, 123 - São Paulo, SP"
                  delay={450}
                />
                <ProfileInfoItem
                  icon={Calendar}
                  label="Data de Nascimento"
                  value="15/03/1990"
                  delay={500}
                />
              </div>
            </div>

            {/* Account Settings */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1 animate-fade-in" style={{ animationDelay: '550ms' }}>
                Configurações da Conta
              </h3>
              <div className="space-y-2">
                <ProfileActionItem
                  icon={CreditCard}
                  label="Formas de Pagamento"
                  description="Gerenciar cartões salvos"
                  delay={600}
                  onClick={() => toast.info("Abrindo formas de pagamento...")}
                />
                <ProfileActionItem
                  icon={Bell}
                  label="Notificações"
                  description="Gerenciar alertas e notificações"
                  delay={650}
                  rightElement={
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => {
                          setNotifications(e.target.checked);
                          toast.success(e.target.checked ? "Notificações ativadas" : "Notificações desativadas");
                        }}
                        className="w-5 h-5 rounded border-primary text-primary focus:ring-primary"
                      />
                    </div>
                  }
                />
                <ProfileActionItem
                  icon={Shield}
                  label="Segurança"
                  description="Senha e autenticação"
                  delay={700}
                  onClick={() => toast.info("Abrindo configurações de segurança...")}
                />
              </div>
            </div>

            {/* Activity */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 animate-fade-in" style={{ animationDelay: '750ms' }}>
                Atividade
              </h3>
              <div className="space-y-2">
                <ProfileActionItem
                  icon={Gift}
                  label="Histórico de Recompensas"
                  description="Ver todas as recompensas resgatadas"
                  delay={800}
                  onClick={() => toast.info("Abrindo histórico...")}
                />
                <ProfileActionItem
                  icon={Star}
                  label="Avaliações"
                  description="Suas avaliações de estabelecimentos"
                  delay={850}
                  onClick={() => toast.info("Abrindo avaliações...")}
                />
              </div>
            </div>

            {/* Logout */}
            <div className="mb-4">
              <button
                onClick={() => void handleLogout()}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-destructive/10 text-destructive
                         transition-all duration-200 active:scale-[0.98] active:bg-destructive/20
                         animate-fade-in"
                style={{ animationDelay: '900ms' }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/20">
                  <LogOut className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Sair da Conta</p>
                </div>
                <ChevronRight className="h-5 w-5 text-destructive shrink-0" />
              </button>
            </div>

            {/* Version */}
            <p className="text-center text-xs text-muted-foreground pb-2 animate-fade-in" style={{ animationDelay: '950ms' }}>
              Versão 1.0.0 • Core+
            </p>
          </div>
        </div>
      )}

      <Dialog open={editDialog !== null} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editDialog === "email" ? "Alterar e-mail" : "Alterar telefone"}</DialogTitle>
            <DialogDescription>
              {editDialog === "email"
                ? "Altere apenas o e-mail da sua conta. Informe sua senha atual para confirmar a alteração."
                : "Informe o novo número de telefone."}
            </DialogDescription>
          </DialogHeader>
          {editDialog === "email" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Novo e-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">Senha atual (confirmação)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}
          {editDialog === "phone" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={editDialog === "email" ? handleSaveEmail : handleSavePhone}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface ProfileInfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  delay?: number;
  onEdit?: () => void;
}

const ProfileInfoItem = ({ icon: Icon, label, value, delay = 0, onEdit }: ProfileInfoItemProps) => {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-md
                 transition-all duration-200 active:scale-[0.98]
                 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
        <Icon className="h-5 w-5 text-accent-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="font-medium text-card-foreground truncate">{value}</p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 p-2 rounded-lg bg-muted transition-all duration-200 active:scale-90"
        >
          <Edit className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};

interface ProfileActionItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  delay?: number;
  onClick?: () => void;
  rightElement?: React.ReactNode;
}

const ProfileActionItem = ({
  icon: Icon,
  label,
  description,
  delay = 0,
  onClick,
  rightElement
}: ProfileActionItemProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-card shadow-md
               transition-all duration-200 active:scale-[0.98] hover:shadow-lg
               animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
        <Icon className="h-5 w-5 text-accent-foreground" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-card-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {rightElement || <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
    </button>
  );
};

export default ProfilePage;
