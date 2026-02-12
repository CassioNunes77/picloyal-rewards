import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import MerchantBottomNav from "@/components/merchant/MerchantBottomNav";

export default function MerchantProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background" style={{ paddingBottom: '88px' }}>
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
              Perfil
            </h1>
            <p className="text-white/90 text-sm mt-1">
              Informações da conta
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 pb-8">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          <div className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Nome
              </label>
              <p className="text-card-foreground">
                {user?.displayName || "Não informado"}
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                E-mail
              </label>
              <p className="text-card-foreground">
                {user?.email || "Não informado"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MerchantBottomNav activeTab="profile" />
    </div>
  );
}
