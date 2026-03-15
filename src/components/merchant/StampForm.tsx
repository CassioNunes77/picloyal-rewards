import { useState, useEffect } from "react";
import { Star, Gift, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createStampReward, updateStampReward, type StampRewardData } from "@/services/stampRewardsService";

interface StampFormProps {
  storeId: string;
  merchantId: string;
  stamp?: StampRewardData | null;
  onCancel: () => void;
  onSuccess: () => void;
  onDelete?: () => void;
}

export default function StampForm({ storeId, merchantId, stamp, onCancel, onSuccess, onDelete }: StampFormProps) {
  const isEdit = !!stamp;
  const [totalStamps, setTotalStamps] = useState("10");
  const [rewardTitle, setRewardTitle] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (stamp) {
      setTotalStamps(stamp.totalStamps.toString());
      setRewardTitle(stamp.rewardTitle);
      setActive(stamp.active ?? true);
    } else {
      setTotalStamps("10");
      setRewardTitle("");
      setActive(true);
    }
  }, [stamp]);

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
      if (isEdit && stamp?.id) {
        await updateStampReward(stamp.id, merchantId, {
          totalStamps: stamps,
          rewardTitle: rewardTitle.trim(),
          active,
        });
        toast.success("Carimbo atualizado com sucesso!");
      } else {
        await createStampReward(storeId, merchantId, stamps, rewardTitle.trim());
        toast.success("Carimbo criado com sucesso!");
      }
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar carimbo:", error);
      toast.error("Erro ao salvar carimbo. Tente novamente.");
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
    <div className="bg-background rounded-lg p-3 border border-border -mx-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-card-foreground">
          {isEdit ? "Editar Carimbo" : "Novo Carimbo"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-7 w-7">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Status Ativo/Inativo */}
        {isEdit && (
          <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
            <div>
              <Label className="text-xs font-medium">Status do Carimbo</Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {active ? "Carimbo está ativo e visível" : "Carimbo está inativo e oculto"}
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} disabled={loading} />
          </div>
        )}

        {/* Quantidade de carimbos e Recompensa em linha */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="totalStamps" className="flex items-center gap-1.5 text-xs">
              <Star className="h-3.5 w-3.5" />
              Qtd. Carimbos *
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
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="rewardTitle" className="flex items-center gap-1.5 text-xs">
              <Gift className="h-3.5 w-3.5" />
              Recompensa *
            </Label>
            <Input
              id="rewardTitle"
              value={rewardTitle}
              onChange={(e) => setRewardTitle(e.target.value)}
              placeholder="Ex: 1 Café Grátis"
              disabled={loading}
              required
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-9 text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !isValid}
              className="flex-1 h-9 text-sm gradient-primary text-primary-foreground hover:opacity-95"
            >
              {loading
                ? isEdit
                  ? "Salvando..."
                  : "Criando..."
                : isEdit
                  ? "Salvar"
                  : "Criar Carimbo"}
            </Button>
          </div>
          {isEdit && onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="w-full h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Excluir Carimbo
            </Button>
          )}
        </div>
      </form>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Carimbo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este programa de carimbo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete?.();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
