import { useState, useEffect, useRef } from "react";
import { Store, MapPin, Phone, Building2, X, Power, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import StorePhotoUpload from "./StorePhotoUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { updateStore, type StoreData } from "@/services/merchantsService";
import { validateCnpj } from "@/services/cnpjService";
import { formatBusinessHours, DEFAULT_SCHEDULE } from "@/lib/businessHours";
import CityAutocomplete from "./CityAutocomplete";
import BusinessHoursPicker from "./BusinessHoursPicker";

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
    hours: store.hours?.trim()
      ? store.hours
      : formatBusinessHours(DEFAULT_SCHEDULE),
    active: store.active ?? true,
    photoURL: store.photoURL ?? null,
  });
  const [loading, setLoading] = useState(false);
  const [cnpjStatus, setCnpjStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const cnpjDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const digits = formData.cnpj.replace(/\D/g, "");
    if (digits.length !== 14) {
      setCnpjStatus("idle");
      return;
    }
    if (cnpjDebounceRef.current) clearTimeout(cnpjDebounceRef.current);
    cnpjDebounceRef.current = setTimeout(async () => {
      setCnpjStatus("loading");
      const result = await validateCnpj(formData.cnpj);
      setCnpjStatus(result.valid ? "valid" : "invalid");
    }, 500);
    return () => {
      if (cnpjDebounceRef.current) clearTimeout(cnpjDebounceRef.current);
    };
  }, [formData.cnpj]);

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
        photoURL: formData.photoURL ?? undefined,
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-card-foreground">
          Editar Loja
        </h2>
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
        {/* Nome */}
        <div className="space-y-1">
          <Label htmlFor="name" className="text-card-foreground flex items-center gap-1.5 text-xs">
            <Store className="h-3.5 w-3.5" />
            Nome da Loja *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Ex: Loja Exemplo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-9 rounded-lg border-border bg-background text-sm"
            required
            disabled={loading}
          />
        </div>

        {/* CNPJ */}
        <div className="space-y-1">
          <Label htmlFor="cnpj" className="text-card-foreground flex items-center gap-1.5 text-xs">
            <Building2 className="h-3.5 w-3.5" />
            CNPJ *
          </Label>
          <Input
            id="cnpj"
            type="text"
            placeholder="00.000.000/0000-00"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
            className="h-9 rounded-lg border-border bg-background text-sm"
            maxLength={18}
            required
            disabled={loading}
          />
          {cnpjStatus === "loading" && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Validando CNPJ...
            </p>
          )}
          {cnpjStatus === "valid" && (
            <p className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              CNPJ válido
            </p>
          )}
          {cnpjStatus === "invalid" && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              CNPJ inválido
            </p>
          )}
        </div>

        {/* Endereço */}
        <div className="space-y-1">
          <Label htmlFor="address" className="text-card-foreground flex items-center gap-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5" />
            Endereço *
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Rua, número, bairro"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="h-9 rounded-lg border-border bg-background text-sm"
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
        <div className="space-y-1">
          <Label htmlFor="phone" className="text-card-foreground flex items-center gap-1.5 text-xs">
            <Phone className="h-3.5 w-3.5" />
            Telefone *
          </Label>
          <Input
            id="phone"
            type="text"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
            className="h-9 rounded-lg border-border bg-background text-sm"
            maxLength={15}
            required
            disabled={loading}
          />
        </div>

        {/* Horário de Funcionamento */}
        <BusinessHoursPicker
          value={formData.hours}
          onChange={(hours) => setFormData(prev => ({ ...prev, hours }))}
          disabled={loading}
          required
        />

        {/* Status Ativo/Inativo */}
        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Power className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label htmlFor="active" className="text-card-foreground font-medium cursor-pointer text-xs">
                Loja Ativa
              </Label>
              <p className="text-[10px] text-muted-foreground">
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

        {/* Logo da Loja */}
        <StorePhotoUpload
          value={formData.photoURL}
          onChange={(url) => setFormData({ ...formData, photoURL: url })}
          disabled={loading}
        />

        {/* Botões */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-9 rounded-lg text-sm"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 h-9 rounded-lg text-sm gradient-primary text-primary-foreground hover:opacity-95 transition-opacity shadow-md"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
