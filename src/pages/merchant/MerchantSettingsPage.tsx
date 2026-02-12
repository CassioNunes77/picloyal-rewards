import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
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
import MerchantBottomNav from "@/components/merchant/MerchantBottomNav";

export default function MerchantSettingsPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero pb-8 pt-12 px-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Configurações
        </h1>
      </div>

      <div className="px-6 -mt-6 pb-8">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          <div className="space-y-4">
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

      <MerchantBottomNav activeTab="settings" />
    </div>
  );
}
