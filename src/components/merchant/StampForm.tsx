import { useState } from "react";
import { Star, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createStampReward } from "@/services/stampRewardsService";

interface StampFormProps {
  storeId: string;
  merchantId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function StampForm({ storeId, merchantId, onCancel, onSuccess }: StampFormProps) {
  const [totalStamps, setTotalStamps] = useState("10");
  const [rewardTitle, setRewardTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stamps = parseInt(totalStamps, 10);
    if (isNaN(stamps) || stamps < 2 || stamps > 100) {
      toast.error("Informe entre 2 e 100 carimbos");
      return;
    }

    if (!rewardTitle.trim()) {
      toast.error("Informe a recompensa ao completar");
      return;
    }

    setLoading(true);
    try {
      await createStampReward(storeId, merchantId, stamps, rewardTitle.trim());
      onSuccess();
      toast.success("Carimbo criado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao criar carimbo:", error);
      toast.error("Erro ao criar carimbo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const stampsNum = parseInt(totalStamps, 10);
  const isValid =
    rewardTitle.trim() &&
    !isNaN(stampsNum) &&
    stampsNum >= 2 &&
    stampsNum <= 100;

  return (
    <div className="bg-background rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Novo Carimbo</h3>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quantidade de carimbos */}
        <div className="space-y-2">
          <Label htmlFor="totalStamps" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Quantidade de carimbos para ganhar *
          </Label>
          <Input
            id="totalStamps"
            type="number"
            value={totalStamps}
            onChange={(e) => setTotalStamps(e.target.value)}
            placeholder="Ex: 10"
            min={2}
            max={100}
            disabled={loading}
            required
          />
        </div>

        {/* Recompensa */}
        <div className="space-y-2">
          <Label htmlFor="rewardTitle" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Recompensa ao completar *
          </Label>
          <Input
            id="rewardTitle"
            value={rewardTitle}
            onChange={(e) => setRewardTitle(e.target.value)}
            placeholder="Ex: 1 Café Grátis"
            disabled={loading}
            required
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !isValid}
            className="flex-1 gradient-primary text-primary-foreground hover:opacity-95"
          >
            {loading ? "Criando..." : "Criar Carimbo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
