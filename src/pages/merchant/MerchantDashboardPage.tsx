import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MerchantStoreForm from "@/components/merchant/MerchantStoreForm";

export default function MerchantDashboardPage() {
  const navigate = useNavigate();
  const [showStoreForm, setShowStoreForm] = useState(false);

  const handleLogout = () => {
    navigate("/merchant/login", { replace: true });
    toast.success("Logout realizado com sucesso");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero pb-8 pt-12 px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Painel do Lojista
            </h1>
            <p className="text-white/90 text-sm mt-1">
              Gerencie sua loja e clientes
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 pb-8">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          {!showStoreForm ? (
            <>
              <div className="text-center py-8">
                <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-card-foreground mb-2">
                  Cadastre sua loja
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Preencha os dados da sua loja para começar a usar o Core+
                </p>
                <Button
                  onClick={() => setShowStoreForm(true)}
                  className="gradient-primary text-primary-foreground hover:opacity-95 transition-opacity shadow-md"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Cadastrar Loja
                </Button>
              </div>
            </>
          ) : (
            <MerchantStoreForm
              onCancel={() => setShowStoreForm(false)}
              onSuccess={() => {
                setShowStoreForm(false);
                toast.success("Loja cadastrada com sucesso!");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
