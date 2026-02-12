import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Bell, Shield, LogOut, ArrowLeft } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import MerchantBottomNav from "@/components/merchant/MerchantBottomNav";

export default function MerchantSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    try {
      await signOut(auth);
      navigate("/merchant/login", { replace: true });
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero pb-8 pt-12 px-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/merchant/dashboard")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Configurações
            </h1>
            <p className="text-white/90 text-sm mt-1">
              Gerencie suas preferências
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 pb-8">
        <div className="space-y-4">
          {/* Notificações */}
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-card-foreground">
                    Notificações
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas e notificações
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-card-foreground">
                  Segurança
                </h3>
                <p className="text-sm text-muted-foreground">
                  Alterar senha e configurações de segurança
                </p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de confirmação de logout */}
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
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bottom Navigation */}
      <MerchantBottomNav />
    </div>
  );
}
