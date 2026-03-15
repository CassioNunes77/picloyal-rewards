import { useState, useEffect } from "react";
import { Calendar, Tag, FileText, Percent, Gift, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { createOffer, updateOffer, type OfferData } from "@/services/offersService";

interface OfferFormProps {
  storeId: string;
  merchantId: string;
  offer?: OfferData | null;
  onCancel: () => void;
  onSuccess: () => void;
  onDelete?: () => void;
}

export default function OfferForm({ storeId, merchantId, offer, onCancel, onSuccess, onDelete }: OfferFormProps) {
  const isEdit = !!offer;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [category, setCategory] = useState("geral");
  const [startImmediate, setStartImmediate] = useState(true);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [pointsRequired, setPointsRequired] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (offer) {
      setTitle(offer.title);
      setDescription(offer.description);
      setDiscount(offer.discount ?? "");
      setCategory(offer.category);
      setStartImmediate(!(offer as { validFrom?: Date }).validFrom);
      const vf = (offer as { validFrom?: Date }).validFrom;
      setValidFrom(vf ? (vf instanceof Date ? vf.toISOString().split("T")[0] : new Date(vf).toISOString().split("T")[0]) : "");
      setValidUntil(
        offer.validUntil instanceof Date
          ? offer.validUntil.toISOString().split("T")[0]
          : new Date(offer.validUntil).toISOString().split("T")[0]
      );
      setPointsRequired(offer.pointsRequired?.toString() ?? "");
      setActive(offer.active ?? true);
    } else {
      setTitle("");
      setDescription("");
      setDiscount("");
      setCategory("geral");
      setStartImmediate(true);
      setValidFrom("");
      setValidUntil("");
      setPointsRequired("");
      setActive(true);
    }
  }, [offer]);

  const categories = [
    { value: "geral", label: "Geral" },
    { value: "bebidas", label: "Bebidas" },
    { value: "comida", label: "Comida" },
    { value: "brinde", label: "Brinde" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !validUntil) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!startImmediate && !validFrom) {
      toast.error("Informe a data de início da oferta");
      return;
    }

    const validUntilDate = new Date(validUntil);
    if (validUntilDate < new Date()) {
      toast.error("A data de validade deve ser futura");
      return;
    }

    const validFromDate = !startImmediate && validFrom ? new Date(validFrom) : undefined;
    if (validFromDate && validFromDate < new Date()) {
      toast.error("A data de início deve ser hoje ou futura");
      return;
    }
    if (validFromDate && validFromDate > validUntilDate) {
      toast.error("A data de início deve ser anterior à data de validade");
      return;
    }

    setLoading(true);
    try {
      const offerData: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        discount: discount.trim() || undefined,
        category,
        validUntil: validUntilDate,
        pointsRequired: pointsRequired ? parseInt(pointsRequired, 10) : undefined,
        active,
      };
      if (startImmediate) {
        if (isEdit) offerData.validFrom = null;
      } else {
        offerData.validFrom = validFromDate;
      }

      if (isEdit && offer?.id) {
        await updateOffer(offer.id, merchantId, offerData as Parameters<typeof updateOffer>[2]);
      } else {
        const createData = { ...offerData };
        delete createData.validFrom;
        if (!startImmediate) createData.validFrom = validFromDate;
        await createOffer(storeId, merchantId, createData as Parameters<typeof createOffer>[2]);
      }
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar oferta:", error);
      toast.error("Erro ao salvar oferta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-background rounded-lg p-3 border border-border -mx-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-card-foreground">
          {isEdit ? "Editar Oferta" : "Nova Oferta"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-7 w-7"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Status Ativo/Inativo */}
        <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
          <div>
            <Label className="text-xs font-medium">Status da Oferta</Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {active ? "Oferta está ativa e visível" : "Oferta está inativa e oculta"}
            </p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} disabled={loading} />
        </div>

        {/* Título */}
        <div className="space-y-1">
          <Label htmlFor="title" className="flex items-center gap-1.5 text-xs">
            <Tag className="h-3.5 w-3.5" />
            Título da Oferta *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: 20% OFF em Bebidas"
            disabled={loading}
            required
            className="h-9 text-sm"
          />
        </div>

        {/* Descrição */}
        <div className="space-y-1">
          <Label htmlFor="description" className="flex items-center gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />
            Descrição *
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva a oferta em detalhes..."
            rows={3}
            disabled={loading}
            required
            className="text-sm"
          />
        </div>

        {/* Categoria e Desconto em linha */}
        <div className="grid grid-cols-2 gap-3">
          {/* Categoria */}
          <div className="space-y-1">
            <Label htmlFor="category" className="text-xs">Categoria</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger id="category" className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desconto */}
          <div className="space-y-1">
            <Label htmlFor="discount" className="flex items-center gap-1.5 text-xs">
              <Percent className="h-3.5 w-3.5" />
              Desconto
            </Label>
            <Input
              id="discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Ex: 20%"
              disabled={loading}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Início da oferta */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            Disponibilidade
          </Label>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="startType"
                checked={startImmediate}
                onChange={() => setStartImmediate(true)}
                disabled={loading}
                className="rounded-full border-border"
              />
              <span className="text-xs">Imediata</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="startType"
                checked={!startImmediate}
                onChange={() => setStartImmediate(false)}
                disabled={loading}
                className="rounded-full border-border"
              />
              <span className="text-xs">Agendar</span>
            </label>
          </div>
          {!startImmediate && (
            <Input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              min={minDate}
              disabled={loading}
              className="mt-1.5 h-9 text-sm"
            />
          )}
        </div>

        {/* Data de Validade e Pontos em linha */}
        <div className="grid grid-cols-2 gap-3">
          {/* Data de Validade */}
          <div className="space-y-1">
            <Label htmlFor="validUntil" className="flex items-center gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              Válido até *
            </Label>
            <Input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              min={minDate}
              disabled={loading}
              required
              className="h-9 text-sm"
            />
          </div>

          {/* Pontos Necessários */}
          <div className="space-y-1">
            <Label htmlFor="pointsRequired" className="flex items-center gap-1.5 text-xs">
              <Gift className="h-3.5 w-3.5" />
              Pontos
            </Label>
            <Input
              id="pointsRequired"
              type="number"
              value={pointsRequired}
              onChange={(e) => setPointsRequired(e.target.value)}
              placeholder="Ex: 50"
              min="0"
              disabled={loading}
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
              disabled={
                loading ||
                !title.trim() ||
                !description.trim() ||
                !validUntil ||
                (!startImmediate && !validFrom)
              }
              className="flex-1 h-9 text-sm gradient-primary text-primary-foreground hover:opacity-95"
            >
              {loading
                ? isEdit
                  ? "Salvando..."
                  : "Criando..."
                : isEdit
                  ? "Salvar"
                  : "Criar Oferta"}
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
              Excluir Oferta
            </Button>
          )}
        </div>
      </form>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Oferta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta oferta? Esta ação não pode ser desfeita.
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
