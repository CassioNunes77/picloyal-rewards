import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Tag,
  ArrowLeft,
  Store,
  Calendar,
  Check,
  X,
  Loader2,
  FileText,
  Percent,
  Gift,
  Users,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { getOfferById, updateOffer, type OfferData } from "@/services/offersService";
import { getStoreById } from "@/services/merchantsService";

const AdminOfferDetailPage = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [storeName, setStoreName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (offerId) loadData();
  }, [offerId]);

  const loadData = async () => {
    if (!offerId) return;
    setLoading(true);
    try {
      const offerData = await getOfferById(offerId);
      if (offerData) {
        setOffer(offerData);
        if (offerData.storeId) {
          const store = await getStoreById(offerData.storeId);
          if (store) setStoreName(store.name);
        }
      } else {
        toast.error("Oferta não encontrada");
        navigate("/sys-admin-panel-7x9k/products");
      }
    } catch (err) {
      console.error("Erro ao carregar oferta:", err);
      toast.error("Erro ao carregar oferta");
      navigate("/sys-admin-panel-7x9k/products");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!offer?.id || !offer.merchantId) return;
    const newActive = !offer.active;
    setToggling(true);
    try {
      await updateOffer(offer.id, offer.merchantId, { active: newActive });
      setOffer((prev) => (prev ? { ...prev, active: newActive } : null));
      toast.success(newActive ? "Oferta ativada" : "Oferta desativada");
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      toast.error("Erro ao atualizar status da oferta");
    } finally {
      setToggling(false);
    }
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Carregando detalhes da oferta...</p>
      </div>
    );
  }

  if (!offer) return null;

  return (
    <div className="min-h-full bg-background">
      <button
        onClick={() => navigate("/sys-admin-panel-7x9k/products")}
        className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Voltar para Ofertas</span>
      </button>

      <div className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="p-4 rounded-xl bg-primary/10 shrink-0 w-fit">
              <Tag className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-card-foreground">{offer.title}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${
                    offer.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {offer.active ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {offer.active ? "Ativa" : "Inativa"}
                </span>
              </div>
              {storeName && (
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  {storeName}
                </p>
              )}
              <button
                onClick={handleToggleActive}
                disabled={toggling}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  offer.active
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {toggling ? (
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                ) : null}
                {offer.active ? "Desativar oferta" : "Ativar oferta"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Detalhes da oferta</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <dt className="text-muted-foreground">Descrição</dt>
                  <dd className="text-card-foreground">{offer.description || "—"}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Tag className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <dt className="text-muted-foreground">Categoria</dt>
                  <dd className="text-card-foreground">{offer.category || "—"}</dd>
                </div>
              </div>
              {offer.discount && (
                <div className="flex gap-3">
                  <Percent className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-muted-foreground">Desconto</dt>
                    <dd className="text-card-foreground font-medium">{offer.discount}</dd>
                  </div>
                </div>
              )}
              {offer.pointsRequired != null && (
                <div className="flex gap-3">
                  <Gift className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-muted-foreground">Pontos necessários</dt>
                    <dd className="text-card-foreground">{offer.pointsRequired}</dd>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <dt className="text-muted-foreground">Válida até</dt>
                  <dd className="text-card-foreground">{formatDate(offer.validUntil)}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
              Resgates
            </h2>
            <button
                type="button"
                onClick={() => {}}
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-4 p-3 rounded-xl bg-primary/10">
            <p className="text-2xl font-bold text-primary">12</p>
            <p className="text-sm text-muted-foreground">resgates realizados</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Resgates mais recentes</p>
            {[
                { userName: "Maria Silva", date: "19/02/2025 14:32", status: "Confirmado" },
                { userName: "João Santos", date: "18/02/2025 11:15", status: "Confirmado" },
                { userName: "Ana Costa", date: "17/02/2025 09:45", status: "Pendente" },
            ].map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-background border border-border"
              >
                <div>
                  <p className="font-medium text-card-foreground text-sm">{r.userName}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-lg ${
                    r.status === "Confirmado" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOfferDetailPage;
