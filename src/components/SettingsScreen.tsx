import { 
  User, 
  Bell, 
  Moon, 
  Shield, 
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
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "Usuário";
  const userEmail = user?.email ?? "";

  const handleToggleNotifications = (checked: boolean) => {
    setNotifications(checked);
    toast.success(checked ? "Notificações ativadas" : "Notificações desativadas");
  };

  const handleToggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
    toast.success(checked ? "Modo escuro ativado" : "Modo claro ativado");
  };

  const handleAction = (action: string) => {
    toast.info(`Abrindo ${action}...`);
  };

  const handleLogout = () => {
    toast.success("Até logo! 👋");
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-slide-in-right">
      {/* Header */}
      <header className="gradient-hero px-6 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 
                       transition-all duration-200 active:scale-90 active:bg-primary-foreground/30"
          >
            <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-primary-foreground">Configurações</h1>
        </div>
      </header>

      {/* Content */}
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        {/* Profile Section */}
        <div className="mb-6 animate-fade-in">
          <button 
            onClick={() => handleAction("Perfil")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card shadow-md 
                       transition-all duration-200 active:scale-[0.98] hover:shadow-lg"
          >
            <div className="h-16 w-16 rounded-full gradient-card flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
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

        {/* Support Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1 animate-fade-in" style={{ animationDelay: '400ms' }}>
            Suporte
          </h3>
          <div className="space-y-2">
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
              onClick={() => {
                // Aqui você pode adicionar a lógica para excluir a conta
                // Por exemplo, mostrar um diálogo de confirmação
                toast.error("Funcionalidade de exclusão de conta em desenvolvimento");
              }}
            />
            <SettingsItem
              icon={LogOut}
              label="Sair da Conta"
              delay={650}
              danger
              onClick={handleLogout}
            />
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground pb-4 animate-fade-in" style={{ animationDelay: '650ms' }}>
          Versão 1.0.0 • Cartão Fidelidade
        </p>
      </div>
    </div>
  );
};

export default SettingsScreen;
