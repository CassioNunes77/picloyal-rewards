import { useState } from "react";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createMerchantAccount } from "@/services/merchantsService";

interface MerchantSignUpFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MerchantSignUpForm({ onSuccess, onCancel }: MerchantSignUpFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.email.trim()) {
      toast.error("Preencha o e-mail");
      return;
    }
    if (!formData.password) {
      toast.error("Preencha a senha");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);
    
    try {
      await createMerchantAccount(
        formData.email.trim(),
        formData.password,
        formData.displayName.trim() || undefined
      );
      toast.success("Conta criada com sucesso! Faça login para continuar.");
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      const errorMessage = error?.message || "Erro ao criar conta. Tente novamente.";
      if (error?.code === "auth/email-already-in-use") {
        toast.error("Este e-mail já está em uso");
      } else if (error?.code === "auth/invalid-email") {
        toast.error("E-mail inválido");
      } else if (error?.code === "auth/weak-password") {
        toast.error("Senha muito fraca. Use pelo menos 6 caracteres");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-card-foreground mb-1">
          Criar Conta de Lojista
        </h2>
        <p className="text-sm text-muted-foreground">
          Crie sua conta para gerenciar sua loja no Core+
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-card-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome (opcional)
          </Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Seu nome"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className="h-12 rounded-xl border-border bg-background"
            disabled={loading}
          />
        </div>

        {/* E-mail */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-card-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-mail *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-12 rounded-xl border-border bg-background"
            autoComplete="email"
            required
            disabled={loading}
          />
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-card-foreground flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Senha *
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="h-12 rounded-xl border-border bg-background"
            autoComplete="new-password"
            required
            disabled={loading}
          />
        </div>

        {/* Confirmar Senha */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-card-foreground">
            Confirmar Senha *
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Digite a senha novamente"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="h-12 rounded-xl border-border bg-background"
            autoComplete="new-password"
            required
            disabled={loading}
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground hover:opacity-95 transition-opacity shadow-md"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Conta"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
