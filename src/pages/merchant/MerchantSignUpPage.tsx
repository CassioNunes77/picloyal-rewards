import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import MerchantSignUpForm from "@/components/merchant/MerchantSignUpForm";
import { toast } from "sonner";

export default function MerchantSignUpPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in" style={{
      background: 'linear-gradient(135deg, hsl(155 50% 15%) 0%, hsl(160 45% 22%) 50%, hsl(155 55% 28%) 100%)'
    }}>
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          {/* Topo: gradiente verde + nome do app */}
          <div className="gradient-primary pb-8 pt-10 px-6">
            <div className="flex items-center justify-center mb-4">
              <Store className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight text-center">
              Painel do Lojista
            </h1>
            <p className="text-white/90 text-sm mt-2 text-center">
              Crie sua conta para gerenciar sua loja
            </p>
          </div>

          {/* Card branco central com formulário */}
          <div className="p-8 animate-fade-in">
            <MerchantSignUpForm
              onCancel={() => navigate("/merchant/login")}
              onSuccess={() => {
                toast.success("Conta criada com sucesso! Faça login para continuar.");
                navigate("/merchant/login", { replace: true });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
