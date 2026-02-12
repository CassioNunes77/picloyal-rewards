import { useState, useEffect } from "react";
import { Store, MapPin, Phone, Clock, Building2, X, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { updateStore, type StoreData } from "@/services/merchantsService";
import CityAutocomplete from "./CityAutocomplete";

interface MerchantStoreEditFormProps {
  store: StoreData;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function MerchantStoreEditForm({ store, onCancel, onSuccess }: MerchantStoreEditFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: store.name || "",
    cnpj: store.cnpj || "",
    address: store.address || "",
    city: store.city || "",
    phone: store.phone || "",
    hours: store.hours || "",
    active: store.active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name.trim()) {
      toast.error("Preencha o nome da loja");
      return;
    }
    if (!formData.cnpj.trim()) {
      toast.error("Preencha o CNPJ");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Preencha o endereço");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("Selecione uma cidade da lista");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Preencha o telefone");
      return;
    }

    if (!user?.uid) {
      toast.error("Você precisa estar autenticado para editar uma loja");
      return;
    }

    setLoading(true);
    
    try {
      await updateStore(store.id!, user.uid, {
        name: formData.name.trim(),
        cnpj: formData.cnpj.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        phone: formData.phone.trim(),
        hours: formData.hours.trim(),
        active: formData.active,
      });
      toast.success("Loja atualizada com sucesso!");
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao atualizar loja:", error);
      toast.error(error?.message || "Erro ao atualizar loja. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-card-foreground">
          Editar Loja
        </h2>
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
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-card-foreground flex items-center gap-2">
            <Store className="h-4 w-4" />
            Nome da Loja *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Ex: Loja Exemplo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-12 rounded-xl border-border bg-background"
            required
            disabled={loading}
          />
        </div>

        {/* CNPJ */}
        <div className="space-y-2">
          <Label htmlFor="cnpj" className="text-card-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            CNPJ *
          </Label>
          <Input
            id="cnpj"
            type="text"
            placeholder="00.000.000/0000-00"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
            className="h-12 rounded-xl border-border bg-background"
            maxLength={18}
            required
            disabled={loading}
          />
        </div>

        {/* Endereço */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-card-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Endereço *
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Rua, número, bairro"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="h-12 rounded-xl border-border bg-background"
            required
            disabled={loading}
          />
        </div>

        {/* Cidade */}
        <CityAutocomplete
          value={formData.city}
          onChange={(city) => setFormData({ ...formData, city })}
          label="Cidade"
          required
          disabled={loading}
          placeholder="Digite o nome da cidade"
        />

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-card-foreground flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Telefone *
          </Label>
          <Input
            id="phone"
            type="text"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
            className="h-12 rounded-xl border-border bg-background"
            maxLength={15}
            required
            disabled={loading}
          />
        </div>

        {/* Horário de Funcionamento */}
        <div className="space-y-2">
          <Label htmlFor="hours" className="text-card-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horário de Funcionamento *
          </Label>
          <Textarea
            id="hours"
            placeholder="Ex: Segunda a Sexta: 9h às 18h&#10;Sábado: 9h às 13h&#10;Domingo: Fechado"
            value={formData.hours}
            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
            className="rounded-xl border-border bg-background min-h-[100px]"
            required
            disabled={loading}
          />
        </div>

        {/* Status Ativo/Inativo */}
        <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <Power className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="active" className="text-card-foreground font-medium cursor-pointer">
                Loja Ativa
              </Label>
              <p className="text-sm text-muted-foreground">
                {formData.active ? "Loja visível para clientes" : "Loja oculta para clientes"}
              </p>
            </div>
          </div>
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            disabled={loading}
          />
        </div>

        {/* Logo - Placeholder para futuro */}
        <div className="space-y-2">
          <Label className="text-card-foreground">
            Logo da Loja
          </Label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Funcionalidade de upload de logo será implementada em breve
            </p>
          </div>
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
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
