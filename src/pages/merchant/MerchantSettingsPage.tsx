import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  ShieldCheck, 
  Moon, 
  Bell, 
  User, 
  Shield, 
  FileText,
  HelpCircle,
  MessageCircle,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useDarkMode } from "@/hooks/use-dark-mode";

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

const SettingsItem = ({ 
  icon: Icon, 
  label, 
  description, 
  onClick, 
  rightElement,
  danger
}: SettingsItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl bg-card 
        transition-all duration-200 
        active:scale-[0.98] active:bg-muted
        hover:shadow-sm
        ${danger ? 'text-destructive' : 'text-card-foreground'}
      `}
    >
      <div className={`
        flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
        ${danger ? 'bg-destructive/10' : 'bg-accent'}
      `}>
        <Icon className={`h-4 w-4 ${danger ? 'text-destructive' : 'text-accent-foreground'}`} />
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
      
      {rightElement || <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </button>
  );
};

export default function MerchantSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    try {
      if (!auth) {
        toast.error("Erro de configuração. Tente novamente.");
        navigate("/merchant/login", { replace: true });
        return;
      }
      await signOut(auth);
      toast.success("Logout realizado com sucesso");
      navigate("/merchant/login", { replace: true });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
      navigate("/merchant/login", { replace: true });
    }
  };

  const handleToggleDarkMode = async (checked: boolean) => {
    try {
      await toggleDarkMode(checked);
      toast.success(checked ? "Modo escuro ativado" : "Modo claro ativado");
    } catch {
      toast.error("Erro ao salvar preferência. Tente novamente.");
    }
  };

  const handleToggleNotifications = (checked: boolean) => {
    setNotifications(checked);
    toast.success(checked ? "Notificações ativadas" : "Notificações desativadas");
  };

  const handleAction = (action: string) => {
    toast.info(`${action} - Em breve!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero pb-8 pt-12 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Configurações
          </h1>
        </div>
      </div>

      <div className="px-6 -mt-6 pb-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Coluna Esquerda */}
          <div className="space-y-6">
            {/* Informações da conta */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Informações da Conta
              </h2>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-primary flex items-center justify-center ring-2 ring-primary/20 shrink-0">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-7 w-7 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-card-foreground truncate">
                    {user?.displayName || "Não informado"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Preferências */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                Preferências
              </h3>
              <div className="space-y-2">
                <SettingsItem
                  icon={Moon}
                  label="Modo Escuro"
                  description="Alterar aparência do painel"
                  rightElement={
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={handleToggleDarkMode}
                      className="data-[state=checked]:bg-primary"
                    />
                  }
                />
                <SettingsItem
                  icon={Bell}
                  label="Notificações"
                  description="Alertas de resgates e pedidos"
                  rightElement={
                    <Switch 
                      checked={notifications} 
                      onCheckedChange={handleToggleNotifications}
                      className="data-[state=checked]:bg-primary"
                    />
                  }
                />
              </div>
            </div>

            {/* Conta */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                Conta
              </h3>
              <div className="space-y-2">
                <SettingsItem
                  icon={User}
                  label="Editar Perfil"
                  description="Alterar nome e informações"
                  onClick={() => handleAction("Editar Perfil")}
                />
                <SettingsItem
                  icon={Shield}
                  label="Segurança"
                  description="Senha e autenticação"
                  onClick={() => handleAction("Segurança")}
                />
              </div>
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-6">
            {/* Legal e Suporte */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                Legal e Suporte
              </h3>
              <div className="space-y-2">
                <SettingsItem
                  icon={ShieldCheck}
                  label="Políticas de Privacidade"
                  description="Leia nossa política de privacidade"
                  onClick={() => navigate("/merchant/privacy-policy")}
                />
                <SettingsItem
                  icon={FileText}
                  label="Termos de Uso"
                  description="Leia nossos termos de uso"
                  onClick={() => navigate("/merchant/terms-of-use")}
                />
                <SettingsItem
                  icon={HelpCircle}
                  label="Central de Ajuda"
                  description="Perguntas frequentes"
                  onClick={() => handleAction("Central de Ajuda")}
                />
                <SettingsItem
                  icon={MessageCircle}
                  label="Fale Conosco"
                  description="Chat ou e-mail"
                  onClick={() => handleAction("Fale Conosco")}
                />
              </div>
            </div>

            {/* Ações da Conta */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                Ações da Conta
              </h3>
              <div className="space-y-2">
                <SettingsItem
                  icon={LogOut}
                  label="Sair da Conta"
                  danger
                  onClick={() => setShowLogoutDialog(true)}
                />
              </div>
            </div>

            {/* Versão */}
            <p className="text-xs text-muted-foreground px-1 pt-4">
              Versão 1.0.0 • Painel do Lojista
            </p>
          </div>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente sair da sua conta de lojista? Você precisará fazer login novamente para acessar o painel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => void handleLogout()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
