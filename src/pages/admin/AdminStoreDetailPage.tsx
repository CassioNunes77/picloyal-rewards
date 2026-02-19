import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Store,
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Mail,
  User,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getStoreById, getMerchantData, updateStore, type StoreData } from "@/services/merchantsService";
import { getStoreOffers } from "@/services/offersService";

const AdminStoreDetailPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [merchantEmail, setMerchantEmail] = useState<string>("");
  const [merchantName, setMerchantName] = useState<string>("");
  const [offersCount, setOffersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (storeId) loadData();
  }, [storeId]);

  const loadData = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const [storeData, offers] = await Promise.all([
        getStoreById(storeId),
        getStoreOffers(storeId),
      ]);
      if (storeData) {
        setStore(storeData);
        setOffersCount(offers.filter((o) => o.active).length);
        if (storeData.merchantId) {
          const merchant = await getMerchantData(storeData.merchantId);
          if (merchant) {
            setMerchantEmail(merchant.email ?? "");
            setMerchantName(merchant.displayName ?? "");
          }
        }
      } else {
        toast.error("Loja não encontrada");
        navigate("/sys-admin-panel-7x9k/stores");
      }
    } catch (err) {
      console.error("Erro ao carregar loja:", err);
      toast.error("Erro ao carregar loja");
      navigate("/sys-admin-panel-7x9k/stores");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!store?.id || !store.merchantId) return;
    const newActive = !store.active;
    setToggling(true);
    try {
      await updateStore(store.id, store.merchantId, { active: newActive });
      setStore((prev) => (prev ? { ...prev, active: newActive } : null));
      toast.success(newActive ? "Loja habilitada" : "Loja desabilitada");
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      toast.error("Erro ao atualizar status da loja");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Carregando detalhes da loja...</p>
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="min-h-full bg-background">
      <button
        onClick={() => navigate("/sys-admin-panel-7x9k/stores")}
        className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Voltar para Lojas</span>
      </button>

      <div className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-20 h-20 rounded-xl bg-primary/10 shrink-0 overflow-hidden flex items-center justify-center">
              {store.photoURL ? (
                <img src={store.photoURL} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="h-10 w-10 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-card-foreground">{store.name}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${
                    store.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {store.active ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {store.active ? "Ativa" : "Inativa"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{offersCount} ofertas ativas</p>
              <button
                onClick={handleToggleActive}
                disabled={toggling}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  store.active
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {toggling ? (
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                ) : null}
                {store.active ? "Desabilitar loja" : "Habilitar loja"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Dados da loja</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <dt className="text-muted-foreground">Endereço</dt>
                  <dd className="text-card-foreground">{store.address || "—"}</dd>
                  <dd className="text-muted-foreground">{store.city || ""}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <dt className="text-muted-foreground">Telefone</dt>
                  <dd className="text-card-foreground">{store.phone || "—"}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <dt className="text-muted-foreground">Horário</dt>
                  <dd className="text-card-foreground">{store.hours || "—"}</dd>
                </div>
              </div>
              <div>
                <dt className="text-muted-foreground">CNPJ</dt>
                <dd className="text-card-foreground">{store.cnpj || "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Conta do lojista</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-3">
                <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <dt className="text-muted-foreground">Nome</dt>
                  <dd className="text-card-foreground">{merchantName || "—"}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="text-card-foreground">{merchantEmail || "—"}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStoreDetailPage;
