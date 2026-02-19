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

    const validUntilDate = new Date(validUntil);
    if (validUntilDate < new Date()) {
      toast.error("A data de validade deve ser futura");
      return;
    }

    setLoading(true);
    try {
      const offerData = {
        title: title.trim(),
        description: description.trim(),
        discount: discount.trim() || undefined,
        category,
        validUntil: validUntilDate,
        pointsRequired: pointsRequired ? parseInt(pointsRequired, 10) : undefined,
        active,
      };

      if (isEdit && offer?.id) {
        await updateOffer(offer.id, merchantId, offerData);
      } else {
        await createOffer(storeId, merchantId, offerData);
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
    <div className="bg-background rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">
          {isEdit ? "Editar Oferta" : "Nova Oferta"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Ativo/Inativo */}
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
          <div>
            <Label className="text-sm font-medium">Status da Oferta</Label>
            <p className="text-xs text-muted-foreground mt-1">
              {active ? "Oferta está ativa e visível" : "Oferta está inativa e oculta"}
            </p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} disabled={loading} />
        </div>

        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Título da Oferta *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: 20% OFF em Bebidas"
            disabled={loading}
            required
          />
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Descrição *
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva a oferta em detalhes..."
            rows={4}
            disabled={loading}
            required
          />
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={category} onValueChange={setCategory} disabled={loading}>
            <SelectTrigger id="category">
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
        <div className="space-y-2">
          <Label htmlFor="discount" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Desconto (opcional)
          </Label>
          <Input
            id="discount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="Ex: 20%, R$ 10, Grátis"
            disabled={loading}
          />
        </div>

        {/* Data de Validade */}
        <div className="space-y-2">
          <Label htmlFor="validUntil" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
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
          />
        </div>

        {/* Pontos Necessários */}
        <div className="space-y-2">
          <Label htmlFor="pointsRequired" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Pontos Necessários (opcional)
          </Label>
          <Input
            id="pointsRequired"
            type="number"
            value={pointsRequired}
            onChange={(e) => setPointsRequired(e.target.value)}
            placeholder="Ex: 50"
            min="0"
            disabled={loading}
          />
        </div>

        {/* Botões */}
        <div className="space-y-3 pt-4">
          <div className="flex gap-3">
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
              disabled={loading || !title.trim() || !description.trim() || !validUntil}
              className="flex-1 gradient-primary text-primary-foreground hover:opacity-95"
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
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
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
