import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Search, Check, X, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { getAllStores, updateStore, deleteStore, type StoreData } from "@/services/merchantsService";
import { getStoreOffers, deleteOffer } from "@/services/offersService";
import { getAllRegions, type Region } from "@/services/regionsService";

interface StoreWithOffers extends StoreData {
  offersCount: number;
}

const AdminStoresPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [filterRegionId, setFilterRegionId] = useState<string>("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [stores, setStores] = useState<StoreWithOffers[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStores();
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const data = await getAllRegions();
      setRegions(data);
    } catch (err) {
      console.error("Erro ao carregar regiões:", err);
      toast.error("Erro ao carregar regiões");
    }
  };

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
    const matchesRegion =
      !filterRegionId ||
      (() => {
        const region = regions.find((r) => r.id === filterRegionId);
        if (!region) return true;
        const storeCityNorm = (store.city ?? "").trim();
        const regionCityNorm = `${region.city} - ${region.state}`.trim();
        return storeCityNorm === regionCityNorm || storeCityNorm.toLowerCase() === regionCityNorm.toLowerCase();
      })();
    return matchesSearch && matchesFilter && matchesRegion;
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

  const toggleSelect = (storeId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(storeId)) next.delete(storeId);
      else next.add(storeId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredStores.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStores.map((s) => s.id!).filter(Boolean)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkSetActive = async (active: boolean) => {
    const ids = Array.from(selectedIds);
    const toUpdate = stores.filter((s) => s.id && ids.includes(s.id) && s.merchantId);
    if (toUpdate.length === 0) return;
    setTogglingId(ids[0] ?? null);
    let ok = 0;
    let fail = 0;
    try {
      for (const store of toUpdate) {
        try {
          await updateStore(store.id!, store.merchantId!, { active });
          setStores((prev) => prev.map((s) => (s.id === store.id ? { ...s, active } : s)));
          ok++;
        } catch {
          fail++;
        }
      }
      setSelectedIds(new Set());
      if (ok) toast.success(ok === 1 ? (active ? "Loja habilitada" : "Loja desabilitada") : `${ok} lojas atualizadas.`);
      if (fail) toast.error(`${fail} loja(s) não puderam ser atualizadas.`);
    } finally {
      setTogglingId(null);
    }
  };

  const openDeleteModal = () => setShowDeleteModal(true);

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    const toDelete = stores.filter((s) => s.id && ids.includes(s.id) && s.merchantId);
    if (toDelete.length === 0) return;
    setDeleting(true);
    let ok = 0;
    let fail = 0;
    try {
      for (const store of toDelete) {
        try {
          const offers = await getStoreOffers(store.id!);
          for (const offer of offers) {
            if (offer.id) await deleteOffer(offer.id, store.merchantId!);
          }
          await deleteStore(store.id!, store.merchantId!);
          ok++;
        } catch {
          fail++;
        }
      }
      setSelectedIds(new Set());
      setShowDeleteModal(false);
      await loadStores();
      if (ok) toast.success(ok === 1 ? "Loja excluída." : `${ok} lojas excluídas.`);
      if (fail) toast.error(`${fail} loja(s) não puderam ser excluídas.`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-full bg-background">
      {/* Cabeçalho no estilo Locus: título + contagem */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Lojas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "—" : `${stores.length} loja${stores.length !== 1 ? "s" : ""} cadastrada${stores.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Toolbar: busca + filtros (estilo Locus) */}
      <div className="mb-4 space-y-4">
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
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterRegionId}
              onChange={(e) => setFilterRegionId(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-card text-card-foreground border border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Todas as regiões</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
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

      {searchQuery && (
        <p className="text-sm text-muted-foreground mb-3">
          {filteredStores.length} resultado{filteredStores.length !== 1 ? "s" : ""} encontrado{filteredStores.length !== 1 ? "s" : ""}.
        </p>
      )}

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium text-card-foreground">
            {selectedIds.size} loja{selectedIds.size !== 1 ? "s" : ""} selecionada{selectedIds.size !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={() => bulkSetActive(true)}
            disabled={!!togglingId}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Ativar
          </button>
          <button
            type="button"
            onClick={() => bulkSetActive(false)}
            disabled={!!togglingId}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Desativar
          </button>
          <button
            type="button"
            onClick={openDeleteModal}
            disabled={!!togglingId}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Excluir
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-card-foreground hover:bg-muted"
          >
            Desmarcar
          </button>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Excluir lojas?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você está prestes a excluir <strong>{selectedIds.size}</strong> loja
              {selectedIds.size !== 1 ? "s" : ""}. As ofertas vinculadas também serão removidas. Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                disabled={deleting}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={bulkDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
        /* Lista em tabela no modelo Locus (Imóveis) */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-12 py-3 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={filteredStores.length > 0 && selectedIds.size === filteredStores.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                      aria-label="Selecionar todas"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Foto</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loja</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cidade</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Ofertas</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStores.map((store) => (
                  <tr
                    key={store.id}
                    onClick={() => store.id && navigate(`/sys-admin-panel-7x9k/stores/${store.id}`)}
                    className={`transition-colors cursor-pointer ${
                      store.id && selectedIds.has(store.id) ? "bg-primary/10 hover:bg-primary/15" : "bg-card hover:bg-muted/30"
                    }`}
                  >
                    <td className="w-12 py-3 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={store.id ? selectedIds.has(store.id) : false}
                        onChange={() => store.id && toggleSelect(store.id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                        aria-label={`Selecionar ${store.name}`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                        {store.photoURL ? (
                          <img src={store.photoURL} alt={store.name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-card-foreground">{store.name}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {store.city || store.address || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {store.offersCount} ofertas
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          store.active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {store.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(store);
                        }}
                        disabled={togglingId === store.id}
                        className={`p-2 rounded-lg transition-all inline-flex ${
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStoresPage;
