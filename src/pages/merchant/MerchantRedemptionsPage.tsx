import { useState, useEffect } from "react";
import { Loader2, Tag, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMerchantStores, type StoreData } from "@/services/merchantsService";
import {
  getMerchantRedemptions,
  confirmRedemption,
  type RedemptionData,
} from "@/services/redemptionsService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MerchantRedemptionsPage() {
  const { user } = useAuth();
  const [redemptions, setRedemptions] = useState<RedemptionData[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
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
    } catch (err) {
      console.error("Erro ao confirmar resgate:", err);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero pb-8 pt-12 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Resgates
          </h1>
          <p className="text-white/90 text-sm mt-1">
            Solicitações de ofertas por usuários
          </p>
        </div>
      </div>

      <div className="px-6 -mt-6 pb-8 max-w-7xl mx-auto w-full">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 max-w-2xl">
          {/* Filtro por Loja */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-muted-foreground block mb-2">
              Filtrar por Loja
            </label>
            <Select
              value={selectedStoreId ?? "all"}
              onValueChange={(v) => setSelectedStoreId(v === "all" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as lojas" />
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

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Carregando resgates...
              </p>
            </div>
          ) : redemptions.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Nenhum resgate encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedStoreId
                  ? "Não há resgates para esta loja."
                  : "Quando usuários solicitarem ofertas, elas aparecerão aqui."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">
                {redemptions.length}{" "}
                {redemptions.length === 1 ? "resgate" : "resgates"}
              </p>
              <div className="space-y-2">
                {redemptions.map((r) => (
                  <div
                    key={r.id}
                    className="bg-background rounded-xl p-4 border border-border"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-card-foreground">
                          {r.offerTitle}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {r.storeName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-muted-foreground block">
                          {formatDate(r.createdAt)}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            r.status === "confirmed"
                              ? "text-green-500"
                              : "text-orange-500"
                          }`}
                        >
                          {r.status === "confirmed" ? "Resgatada" : "Solicitada"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4 shrink-0" />
                      <span>{r.userName}</span>
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
                        className="mt-3 w-full py-2 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm
                                 transition-all duration-200 disabled:opacity-50"
                      >
                        {confirmingId === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
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
