import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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

export default function MerchantSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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
        <div>
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 max-w-2xl">
            <div className="space-y-6">
              {/* Informações da conta (ex-Perfil) */}
              <div>
                <h2 className="text-lg font-semibold text-card-foreground mb-4">
                  Informações da Conta
                </h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="text-base text-card-foreground">
                      {user?.displayName || "Não informado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-base text-card-foreground">
                      {user?.email || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground mb-4">
                  Legal
                </h2>
                <Button
                  variant="outline"
                  onClick={() => navigate("/merchant/privacy-policy")}
                  className="w-full justify-start"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Políticas de Privacidade
                </Button>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground mb-4">
                  Conta
                </h2>
                <Button
                  variant="destructive"
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair da Conta
                </Button>
              </div>
            </div>
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
