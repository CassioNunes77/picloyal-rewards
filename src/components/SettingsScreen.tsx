import { 
  User, 
  Bell, 
  Moon, 
  Shield, 
  ShieldCheck,
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Smartphone,
  CreditCard,
  Share2,
  Star,
  MessageCircle,
  Trash2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth, AUTH_REQUIRES_RECENT_LOGIN } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDarkMode } from "@/hooks/use-dark-mode";

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
  delay?: number;
}

const SettingsItem = ({ 
  icon: Icon, 
  label, 
  description, 
  onClick, 
  rightElement,
  danger,
  delay = 0
}: SettingsItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 p-4 rounded-xl bg-card 
        transition-all duration-200 
        active:scale-[0.98] active:bg-muted
        hover:shadow-md
        animate-fade-in
        ${danger ? 'text-destructive' : 'text-card-foreground'}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`
        flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
        ${danger ? 'bg-destructive/10' : 'bg-accent'}
      `}>
        <Icon className={`h-5 w-5 ${danger ? 'text-destructive' : 'text-accent-foreground'}`} />
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
      
      {rightElement || <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
    </button>
  );
};

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    user,
    signOut,
    deleteAccount,
    reauthenticateWithPassword,
    reauthenticateWithGoogle,
  } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showReauthDialog, setShowReauthDialog] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthLoading, setReauthLoading] = useState(false);
  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "Usuário";
  const userEmail = user?.email ?? "";
  const isGoogleUser = user?.providerData?.some((p) => p.providerId === "google.com") ?? false;

  const handleToggleNotifications = (checked: boolean) => {
    setNotifications(checked);
    toast.success(checked ? "Notificações ativadas" : "Notificações desativadas");
  };

  const handleToggleDarkMode = async (checked: boolean) => {
    try {
      await toggleDarkMode(checked);
    toast.success(checked ? "Modo escuro ativado" : "Modo claro ativado");
    } catch (error) {
      toast.error("Erro ao salvar preferência. Tente novamente.");
    }
  };

  const handleAction = (action: string) => {
    toast.info(`Abrindo ${action}...`);
  };

  const handleLogout = async () => {
    if (!window.confirm("Deseja realmente sair da sua conta?")) return;
    try {
      await signOut();
    toast.success("Até logo! 👋");
      onBack();
    } catch {
      toast.error("Erro ao sair.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Esta ação é definitiva. Todos os dados do usuário serão perdidos. Deseja continuar?"
      )
    )
      return;
    try {
      await deleteAccount();
      toast.success("Conta excluída.");
      navigate("/", { replace: true });
    } catch (e: unknown) {
      const err = e as { code?: string } | null;
      if (err?.code === AUTH_REQUIRES_RECENT_LOGIN) {
        setShowReauthDialog(true);
        return;
      }
      const msg = e instanceof Error ? e.message : "Erro ao excluir conta.";
      toast.error(msg);
    }
  };

  const handleReauthAndDelete = async () => {
    setReauthLoading(true);
    try {
      if (isGoogleUser) {
        await reauthenticateWithGoogle();
      } else {
        if (!reauthPassword.trim()) {
          toast.error("Digite sua senha.");
          setReauthLoading(false);
          return;
        }
        await reauthenticateWithPassword(reauthPassword);
      }
      await deleteAccount();
      toast.success("Conta excluída.");
      setShowReauthDialog(false);
      setReauthPassword("");
      navigate("/", { replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao confirmar. Tente novamente.";
      toast.error(msg);
    } finally {
      setReauthLoading(false);
    }
  };

  const content = (
    <>
        {/* Profile Section */}
        <div className="mb-6 animate-fade-in">
          <button 
            onClick={() => handleAction("Perfil")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card shadow-md 
                       transition-all duration-200 active:scale-[0.98] hover:shadow-lg"
          >
            <div className="h-16 w-16 rounded-full overflow-hidden bg-primary flex items-center justify-center ring-2 ring-primary/20 shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
              <User className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-lg font-semibold text-card-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{userEmail || "—"}</p>
              <p className="text-xs text-primary font-medium mt-1">Membro VIP ⭐</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Preferences Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1 animate-fade-in">
            Preferências
          </h3>
          <div className="space-y-2">
            <SettingsItem
              icon={Bell}
              label="Notificações"
              description="Receber alertas de ofertas e pontos"
              delay={50}
              rightElement={
                <Switch 
                  checked={notifications} 
                  onCheckedChange={handleToggleNotifications}
                  className="data-[state=checked]:bg-primary"
                />
              }
            />
            <SettingsItem
              icon={Moon}
              label="Modo Escuro"
              description="Alterar aparência do app"
              delay={100}
              rightElement={
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={handleToggleDarkMode}
                  className="data-[state=checked]:bg-primary"
                />
              }
            />
            <SettingsItem
              icon={Smartphone}
              label="Instalar App"
              description="Adicionar à tela inicial"
              delay={150}
              onClick={() => handleAction("Instalação")}
            />
          </div>
        </div>

        {/* Account Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Conta
          </h3>
          <div className="space-y-2">
            <SettingsItem
              icon={CreditCard}
              label="Formas de Pagamento"
              description="Gerenciar cartões salvos"
              delay={250}
              onClick={() => handleAction("Pagamentos")}
            />
            <SettingsItem
              icon={Shield}
              label="Segurança"
              description="Senha e autenticação"
              delay={300}
              onClick={() => handleAction("Segurança")}
            />
            <SettingsItem
              icon={Share2}
              label="Indicar Amigos"
              description="Ganhe 50 pontos por indicação"
              delay={350}
              onClick={() => handleAction("Indicações")}
            />
          </div>
        </div>

        {/* Legal / Suporte */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1 animate-fade-in" style={{ animationDelay: '400ms' }}>
            Legal e Suporte
          </h3>
          <div className="space-y-2">
            <SettingsItem
              icon={ShieldCheck}
              label="Políticas de Privacidade"
              description="Leia nossa política de privacidade"
              delay={400}
              onClick={() => navigate("/privacy-policy")}
            />
            <SettingsItem
              icon={HelpCircle}
              label="Central de Ajuda"
              description="Perguntas frequentes"
              delay={450}
              onClick={() => handleAction("Ajuda")}
            />
            <SettingsItem
              icon={MessageCircle}
              label="Fale Conosco"
              description="Chat ou e-mail"
              delay={500}
              onClick={() => handleAction("Contato")}
            />
            <SettingsItem
              icon={Star}
              label="Avalie o App"
              description="Sua opinião é importante"
              delay={550}
              onClick={() => handleAction("Avaliação")}
            />
          </div>
        </div>

        {/* Account Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1 animate-fade-in" style={{ animationDelay: '550ms' }}>
            Ações da Conta
          </h3>
          <div className="space-y-2">
            <SettingsItem
              icon={Trash2}
              label="Excluir Conta"
              description="Excluir permanentemente sua conta e todos os dados"
              delay={600}
              danger
              onClick={() => void handleDeleteAccount()}
            />
            <SettingsItem
              icon={LogOut}
              label="Sair da Conta"
              delay={650}
              danger
              onClick={() => void handleLogout()}
            />
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground pb-4 animate-fade-in" style={{ animationDelay: '650ms' }}>
          Versão 1.0.0 • Core+
        </p>
    </>
  );

  if (!isMobile) {
    return (
      <div className="min-h-full bg-background w-full">
        <div className="pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-card-foreground">Configurações</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Coluna Esquerda: Perfil, Preferências e Conta */}
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <button 
                onClick={() => handleAction("Perfil")}
                className="w-full flex items-center gap-4 transition-all duration-200 active:scale-[0.98]"
              >
                <div className="h-16 w-16 rounded-full overflow-hidden bg-primary flex items-center justify-center ring-2 ring-primary/20 shrink-0">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-8 w-8 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-lg font-semibold text-card-foreground">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">{userEmail || "—"}</p>
                  <p className="text-xs text-primary font-medium mt-1">Membro VIP ⭐</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Preferences Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Preferências
              </h3>
              <div className="space-y-2">
                <SettingsItem
                  icon={Bell}
                  label="Notificações"
                  description="Receber alertas de ofertas e pontos"
                  delay={50}
                  rightElement={
                    <Switch 
                      checked={notifications} 
                      onCheckedChange={handleToggleNotifications}
                      className="data-[state=checked]:bg-primary"
                    />
                  }
                />
                <SettingsItem
                  icon={Moon}
                  label="Modo Escuro"
                  description="Alterar aparência do app"
                  delay={100}
                  rightElement={
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={handleToggleDarkMode}
                      className="data-[state=checked]:bg-primary"
                    />
                  }
                />
                <SettingsItem
                  icon={Smartphone}
                  label="Instalar App"
                  description="Adicionar à tela inicial"
                  delay={150}
                  onClick={() => handleAction("Instalação")}
                />
              </div>
            </div>

            {/* Account Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Conta
              </h3>
              <div className="space-y-2">
                <SettingsItem
                  icon={CreditCard}
                  label="Formas de Pagamento"
                  description="Gerenciar cartões salvos"
                  delay={250}
                  onClick={() => handleAction("Pagamentos")}
                />
                <SettingsItem
                  icon={Shield}
                  label="Segurança"
                  description="Senha e autenticação"
                  delay={300}
                  onClick={() => handleAction("Segurança")}
                />
                <SettingsItem
                  icon={Share2}
                  label="Indicar Amigos"
                  description="Ganhe 50 pontos por indicação"
                  delay={350}
                  onClick={() => handleAction("Indicações")}
                />
              </div>
            </div>
          </div>

          {/* Coluna Direita: Suporte e Ações da Conta */}
          <div className="space-y-6">
            {/* Legal / Support Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Legal e Suporte
              </h3>
              <div className="space-y-2">
                <SettingsItem
                  icon={ShieldCheck}
                  label="Políticas de Privacidade"
                  description="Leia nossa política de privacidade"
                  delay={400}
                  onClick={() => navigate("/privacy-policy")}
                />
                <SettingsItem
                  icon={HelpCircle}
                  label="Central de Ajuda"
                  description="Perguntas frequentes"
                  delay={450}
                  onClick={() => handleAction("Ajuda")}
                />
                <SettingsItem
                  icon={MessageCircle}
                  label="Fale Conosco"
                  description="Chat ou e-mail"
                  delay={500}
                  onClick={() => handleAction("Contato")}
                />
                <SettingsItem
                  icon={Star}
                  label="Avalie o App"
                  description="Sua opinião é importante"
                  delay={550}
                  onClick={() => handleAction("Avaliação")}
                />
              </div>
            </div>

            {/* Account Actions */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Ações da Conta
              </h3>
              <div className="space-y-2">
                <SettingsItem
                  icon={Trash2}
                  label="Excluir Conta"
                  description="Excluir permanentemente sua conta e todos os dados"
                  delay={600}
                  danger
                  onClick={() => void handleDeleteAccount()}
                />
                <SettingsItem
                  icon={LogOut}
                  label="Sair da Conta"
                  delay={650}
                  danger
                  onClick={() => void handleLogout()}
                />
              </div>
            </div>

            {/* Version */}
            <p className="text-xs text-muted-foreground pt-4">
              Versão 1.0.0 • Core+
            </p>
          </div>
        </div>

        <Dialog open={showReauthDialog} onOpenChange={setShowReauthDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar identidade</DialogTitle>
              <DialogDescription>
                Por segurança, confirme sua identidade para excluir a conta.
                {isGoogleUser
                  ? " Clique no botão abaixo para entrar novamente com Google."
                  : " Digite sua senha abaixo."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              {!isGoogleUser && (
                <Input
                  type="password"
                  placeholder="Sua senha"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  disabled={reauthLoading}
                  onKeyDown={(e) => e.key === "Enter" && void handleReauthAndDelete()}
                />
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowReauthDialog(false)}
                disabled={reauthLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleReauthAndDelete()}
                disabled={reauthLoading || (!isGoogleUser && !reauthPassword.trim())}
              >
                {reauthLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aguarde...
                  </>
                ) : isGoogleUser ? (
                  "Confirmar com Google"
                ) : (
                  "Confirmar e excluir"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-slide-in-right">
      <header className="gradient-hero px-6 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-all duration-200 active:scale-90 active:bg-primary-foreground/30"
          >
            <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Configurações</h1>
        </div>
      </header>
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">{content}</div>
      <Dialog open={showReauthDialog} onOpenChange={setShowReauthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar identidade</DialogTitle>
            <DialogDescription>
              Por segurança, confirme sua identidade para excluir a conta.
              {isGoogleUser
                ? " Clique no botão abaixo para entrar novamente com Google."
                : " Digite sua senha abaixo."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {!isGoogleUser && (
              <Input
                type="password"
                placeholder="Sua senha"
                value={reauthPassword}
                onChange={(e) => setReauthPassword(e.target.value)}
                disabled={reauthLoading}
                onKeyDown={(e) => e.key === "Enter" && void handleReauthAndDelete()}
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReauthDialog(false)}
              disabled={reauthLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleReauthAndDelete()}
              disabled={reauthLoading || (!isGoogleUser && !reauthPassword.trim())}
            >
              {reauthLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aguarde...
                </>
              ) : isGoogleUser ? (
                "Confirmar com Google"
              ) : (
                "Confirmar e excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsScreen;
