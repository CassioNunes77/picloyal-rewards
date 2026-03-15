import { useState, useEffect } from "react";
import { Loader2, Tag, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMerchantStores, type StoreData } from "@/services/merchantsService";
import {
  getMerchantRedemptions,
  confirmRedemption,
  type RedemptionData,
} from "@/services/redemptionsService";
import { createNotification } from "@/services/notificationsService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilter = "all" | "pending" | "confirmed";

export default function MerchantRedemptionsPage() {
  const { user } = useAuth();
  const [redemptions, setRedemptions] = useState<RedemptionData[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    loadStores();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    loadRedemptions();
  }, [user?.uid, selectedStoreId]);

  const loadStores = async () => {
    if (!user?.uid) return;
    try {
      const merchantStores = await getMerchantStores(user.uid);
      setStores(merchantStores);
    } catch (err) {
      console.error("Erro ao carregar lojas:", err);
    }
  };

  const loadRedemptions = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getMerchantRedemptions(user.uid, selectedStoreId);
      setRedemptions(data);
    } catch (err) {
      console.error("Erro ao carregar resgates:", err);
      setRedemptions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const filteredRedemptions = redemptions.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  const handleConfirm = async (r: RedemptionData) => {
    if (!user?.uid || r.status === "confirmed") return;
    setConfirmingId(r.id);
    try {
      await confirmRedemption(r.id, user.uid);
      setRedemptions((prev) =>
        prev.map((x) =>
          x.id === r.id ? { ...x, status: "confirmed" as const } : x
        )
      );
      await createNotification({
        userId: r.userId,
        type: "reward",
        title: "Oferta Resgatada!",
        message: `Sua oferta "${r.offerTitle}" foi confirmada em ${r.storeName}. Apresente o cupom no estabelecimento.`,
        icon: "gift",
        data: { offerId: r.offerId, storeId: r.storeId },
      });
    } catch (err) {
      console.error("Erro ao confirmar resgate:", err);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero pb-6 pt-10 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Resgates
          </h1>
          <p className="text-white/90 text-xs mt-1">
            Solicitações de ofertas por usuários
          </p>
        </div>
      </div>

      <div className="px-6 -mt-6 pb-6 max-w-7xl mx-auto w-full">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-3 max-w-2xl">
          {/* Filtros */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Filtro por Loja */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Loja
              </label>
              <Select
                value={selectedStoreId ?? "all"}
                onValueChange={(v) => setSelectedStoreId(v === "all" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as lojas</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id!}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Solicitações</SelectItem>
                  <SelectItem value="confirmed">Resgatados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
              <p className="text-xs text-muted-foreground">
                Carregando resgates...
              </p>
            </div>
          ) : filteredRedemptions.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-card-foreground mb-1">
                Nenhum resgate encontrado
              </h3>
              <p className="text-xs text-muted-foreground">
                {statusFilter === "pending"
                  ? "Não há solicitações pendentes."
                  : statusFilter === "confirmed"
                    ? "Não há resgates confirmados."
                    : selectedStoreId
                      ? "Não há resgates para esta loja."
                      : "Quando usuários solicitarem ofertas, elas aparecerão aqui."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {filteredRedemptions.length}{" "}
                {filteredRedemptions.length === 1 ? "resgate" : "resgates"}
              </p>
              <div className="space-y-1.5">
                {filteredRedemptions.map((r) => (
                  <div
                    key={r.id}
                    className="bg-background rounded-lg p-3 border border-border"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm text-card-foreground truncate">
                          {r.offerTitle}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">
                          {r.storeName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-muted-foreground block">
                          {formatDate(r.createdAt)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            r.status === "confirmed"
                              ? "text-green-500"
                              : "text-orange-500"
                          }`}
                        >
                          {r.status === "confirmed" ? "Resgatada" : "Solicitada"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{r.userName}</span>
                      {r.userEmail && (
                        <>
                          <span>•</span>
                          <span className="truncate">{r.userEmail}</span>
                        </>
                      )}
                    </div>
                    {r.status !== "confirmed" && (
                      <button
                        type="button"
                        onClick={() => handleConfirm(r)}
                        disabled={confirmingId === r.id || r.status === "confirmed"}
                        className="mt-2 w-full py-1.5 rounded-md gradient-primary text-primary-foreground font-medium text-xs
                                 transition-all duration-200 disabled:opacity-50"
                      >
                        {confirmingId === r.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                        ) : (
                          "Confirmar resgate"
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
