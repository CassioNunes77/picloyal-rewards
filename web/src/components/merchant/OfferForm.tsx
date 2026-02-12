import { useState } from "react";
import { X, Tag, Calendar, Percent, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createOffer } from "@/services/offersService";

interface OfferFormProps {
  storeId: string;
  merchantId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: "geral", label: "Geral" },
  { value: "bebidas", label: "Bebidas" },
  { value: "comida", label: "Comida" },
  { value: "brinde", label: "Brinde" },
];

export default function OfferForm({ storeId, merchantId, onCancel, onSuccess }: OfferFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount: "",
    category: "geral",
    validUntil: "",
    pointsRequired: "",
    active: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.title.trim()) {
      toast.error("Preencha o título da oferta");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Preencha a descrição da oferta");
      return;
    }
    if (!formData.validUntil) {
      toast.error("Selecione a data de validade");
      return;
    }

    const validUntilDate = new Date(formData.validUntil);
    if (validUntilDate < new Date()) {
      toast.error("A data de validade deve ser futura");
      return;
    }

    setLoading(true);
    
    try {
      await createOffer(storeId, merchantId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        discount: formData.discount.trim() || undefined,
        category: formData.category,
        validUntil: validUntilDate,
        pointsRequired: formData.pointsRequired ? parseInt(formData.pointsRequired) : undefined,
        active: formData.active,
      });
      toast.success("Oferta criada com sucesso!");
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao criar oferta:", error);
      toast.error(error?.message || "Erro ao criar oferta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Calcular data mínima (hoje)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 border-t border-border pt-6 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">
          Nova Oferta
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
        <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
          <div className="space-y-0.5">
            <Label htmlFor="active" className="text-card-foreground font-medium">
              Status da Oferta
            </Label>
            <p className="text-sm text-muted-foreground">
              {formData.active ? "Oferta está ativa e visível" : "Oferta está inativa e oculta"}
            </p>
          </div>
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            disabled={loading}
          />
        </div>

        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-card-foreground flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Título da Oferta *
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="Ex: 20% OFF em Bebidas"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="h-12 rounded-xl border-border bg-background"
            required
            disabled={loading}
          />
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-card-foreground">
            Descrição *
          </Label>
          <Textarea
            id="description"
            placeholder="Descreva os detalhes da oferta..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="rounded-xl border-border bg-background min-h-[100px]"
            required
            disabled={loading}
          />
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-card-foreground">
            Categoria *
          </Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-12 rounded-xl border border-border bg-background px-4 text-card-foreground"
            required
            disabled={loading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desconto */}
        <div className="space-y-2">
          <Label htmlFor="discount" className="text-card-foreground flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Desconto (opcional)
          </Label>
          <Input
            id="discount"
            type="text"
            placeholder="Ex: 20%, R$ 10, Grátis"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            className="h-12 rounded-xl border-border bg-background"
            disabled={loading}
          />
        </div>

        {/* Data de Validade */}
        <div className="space-y-2">
          <Label htmlFor="validUntil" className="text-card-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Válido até *
          </Label>
          <Input
            id="validUntil"
            type="date"
            min={today}
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            className="h-12 rounded-xl border-border bg-background"
            required
            disabled={loading}
          />
        </div>

        {/* Pontos Necessários */}
        <div className="space-y-2">
          <Label htmlFor="pointsRequired" className="text-card-foreground flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Pontos Necessários (opcional)
          </Label>
          <Input
            id="pointsRequired"
            type="number"
            min="0"
            placeholder="Ex: 50"
            value={formData.pointsRequired}
            onChange={(e) => setFormData({ ...formData, pointsRequired: e.target.value })}
            className="h-12 rounded-xl border-border bg-background"
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
            {loading ? "Salvando..." : "Criar Oferta"}
          </Button>
        </div>
      </form>
    </div>
  );
}
