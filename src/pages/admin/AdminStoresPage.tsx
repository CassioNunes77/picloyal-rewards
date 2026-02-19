import { useState, useEffect } from "react";
import { Store, Search, Check, X, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { getAllStores, updateStore, type StoreData } from "@/services/merchantsService";
import { getStoreOffers } from "@/services/offersService";

interface StoreWithOffers extends StoreData {
  offersCount: number;
}

const AdminStoresPage = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [stores, setStores] = useState<StoreWithOffers[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const storesData = await getAllStores();
      const withOffers = await Promise.all(
        storesData.map(async (s) => {
          const offers = await getStoreOffers(s.id!);
          return { ...s, offersCount: offers.filter((o) => o.active).length };
        })
      );
      setStores(withOffers);
    } catch (err) {
      console.error("Erro ao carregar lojas:", err);
      toast.error("Erro ao carregar lojas");
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter((store) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      store.name.toLowerCase().includes(searchLower) ||
      (store.city ?? "").toLowerCase().includes(searchLower) ||
      (store.address ?? "").toLowerCase().includes(searchLower);
    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && store.active) ||
      (filterActive === "inactive" && !store.active);
    return matchesSearch && matchesFilter;
  });

  const handleToggleActive = async (store: StoreWithOffers) => {
    if (!store.id || !store.merchantId) return;
    const newActive = !store.active;
    setTogglingId(store.id);
    try {
      await updateStore(store.id, store.merchantId, { active: newActive });
      setStores(stores.map((s) => (s.id === store.id ? { ...s, active: newActive } : s)));
      toast.success(newActive ? "Loja habilitada" : "Loja desabilitada");
    } catch (err) {
      console.error("Erro ao atualizar status da loja:", err);
      toast.error("Erro ao atualizar status da loja");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Lojas</h1>
        <p className="text-sm text-muted-foreground">Gerenciar lojas parceiras</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar loja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "inactive"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterActive(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterActive === filter
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-card-foreground border border-border hover:bg-muted"
              }`}
            >
              {filter === "all" ? "Todas" : filter === "active" ? "Ativas" : "Inativas"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Carregando lojas...</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="text-center py-16">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-card-foreground font-medium mb-2">Nenhuma loja encontrada</p>
          <p className="text-sm text-muted-foreground">
            {stores.length === 0
              ? "Não há lojas cadastradas no Firebase."
              : "Nenhuma loja corresponde aos filtros."}
          </p>
        </div>
      ) : (
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} gap-3`}>
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Store className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground text-sm truncate">{store.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{store.city || store.address || "—"}</p>
                  <span className="text-xs text-muted-foreground">{store.offersCount} ofertas</span>
                </div>
              </div>
              <button
                onClick={() => handleToggleActive(store)}
                disabled={togglingId === store.id}
                className={`p-2 rounded-lg transition-all shrink-0 ${
                  store.active
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={store.active ? "Desabilitar loja" : "Habilitar loja"}
              >
                {togglingId === store.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : store.active ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default AdminStoresPage;
