import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Search, Check, X, Loader2, MapPin, Tag } from "lucide-react";
import { toast } from "sonner";
import { getAllStores } from "@/services/merchantsService";
import { getStoreOffers, updateOffer, deleteOffer, type OfferData } from "@/services/offersService";
import { getAllRegions, type Region } from "@/services/regionsService";

interface OfferWithStore extends OfferData {
  storeName: string;
  storeCity: string;
}

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [filterRegionId, setFilterRegionId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [offers, setOffers] = useState<OfferWithStore[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
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

  const loadData = async () => {
    setLoading(true);
    try {
      const storesData = await getAllStores();
      const allOffers: OfferWithStore[] = [];
      for (const store of storesData) {
        if (!store.id) continue;
        const storeOffers = await getStoreOffers(store.id);
        for (const offer of storeOffers) {
          allOffers.push({
            ...offer,
            storeName: store.name,
            storeCity: store.city ?? "",
          });
        }
      }
      allOffers.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setOffers(allOffers);
    } catch (err) {
      console.error("Erro ao carregar ofertas:", err);
      toast.error("Erro ao carregar ofertas");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", ...Array.from(new Set(offers.map((o) => o.category).filter(Boolean)))].sort();

  const filteredOffers = offers.filter((offer) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      offer.title.toLowerCase().includes(searchLower) ||
      offer.storeName.toLowerCase().includes(searchLower) ||
      (offer.description ?? "").toLowerCase().includes(searchLower);
    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && offer.active) ||
      (filterActive === "inactive" && !offer.active);
    const matchesCategory = selectedCategory === "all" || offer.category === selectedCategory;
    const matchesRegion =
      !filterRegionId ||
      (() => {
        const region = regions.find((r) => r.id === filterRegionId);
        if (!region) return true;
        const storeCityNorm = offer.storeCity.trim();
        const regionCityNorm = `${region.city} - ${region.state}`.trim();
        return storeCityNorm === regionCityNorm || storeCityNorm.toLowerCase() === regionCityNorm.toLowerCase();
      })();
    return matchesSearch && matchesFilter && matchesCategory && matchesRegion;
  });

  const handleToggleActive = async (offer: OfferWithStore) => {
    if (!offer.id || !offer.merchantId) return;
    const newActive = !offer.active;
    setTogglingId(offer.id);
    try {
      await updateOffer(offer.id, offer.merchantId, { active: newActive });
      setOffers(offers.map((o) => (o.id === offer.id ? { ...o, active: newActive } : o)));
      toast.success(newActive ? "Oferta ativada" : "Oferta desativada");
    } catch (err) {
      console.error("Erro ao atualizar oferta:", err);
      toast.error("Erro ao atualizar status da oferta");
    } finally {
      setTogglingId(null);
    }
  };

  const toggleSelect = (offerId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(offerId)) next.delete(offerId);
      else next.add(offerId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOffers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOffers.map((o) => o.id!).filter(Boolean)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkSetActive = async (active: boolean) => {
    const ids = Array.from(selectedIds);
    const toUpdate = offers.filter((o) => o.id && ids.includes(o.id) && o.merchantId);
    if (toUpdate.length === 0) return;
    setTogglingId(ids[0] ?? null);
    let ok = 0;
    let fail = 0;
    try {
      for (const offer of toUpdate) {
        try {
          await updateOffer(offer.id!, offer.merchantId!, { active });
          setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, active } : o)));
          ok++;
        } catch {
          fail++;
        }
      }
      setSelectedIds(new Set());
      if (ok) toast.success(ok === 1 ? (active ? "Oferta ativada" : "Oferta desativada") : `${ok} ofertas atualizadas.`);
      if (fail) toast.error(`${fail} oferta(s) não puderam ser atualizadas.`);
    } finally {
      setTogglingId(null);
    }
  };

  const openDeleteModal = () => setShowDeleteModal(true);

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    const toDelete = offers.filter((o) => o.id && ids.includes(o.id) && o.merchantId);
    if (toDelete.length === 0) return;
    setDeleting(true);
    let ok = 0;
    let fail = 0;
    try {
      for (const offer of toDelete) {
        try {
          await deleteOffer(offer.id!, offer.merchantId!);
          ok++;
        } catch {
          fail++;
        }
      }
      setSelectedIds(new Set());
      setShowDeleteModal(false);
      await loadData();
      if (ok) toast.success(ok === 1 ? "Oferta excluída." : `${ok} ofertas excluídas.`);
      if (fail) toast.error(`${fail} oferta(s) não puderam ser excluídas.`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-full bg-background">
      {/* Cabeçalho: título + contagem */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Ofertas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "—" : `${offers.length} oferta${offers.length !== 1 ? "s" : ""} cadastrada${offers.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Toolbar: busca + filtros */}
      <div className="mb-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar oferta..."
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
              {filter === "all" ? "Todos" : filter === "active" ? "Ativos" : "Inativos"}
            </button>
          ))}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-secondary text-secondary-foreground shadow-md"
                  : "bg-card text-card-foreground border border-border hover:bg-muted"
              }`}
            >
              {cat === "all" ? "Todas cat." : cat}
            </button>
          ))}
        </div>
      </div>

      {searchQuery && (
        <p className="text-sm text-muted-foreground mb-3">
          {filteredOffers.length} resultado{filteredOffers.length !== 1 ? "s" : ""} encontrado{filteredOffers.length !== 1 ? "s" : ""}.
        </p>
      )}

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium text-card-foreground">
            {selectedIds.size} oferta{selectedIds.size !== 1 ? "s" : ""} selecionada{selectedIds.size !== 1 ? "s" : ""}
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
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Excluir ofertas?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você está prestes a excluir <strong>{selectedIds.size}</strong> oferta
              {selectedIds.size !== 1 ? "s" : ""}. Esta ação não pode ser desfeita.
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
          <p className="text-sm text-muted-foreground">Carregando ofertas...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-card-foreground font-medium mb-2">Nenhuma oferta encontrada</p>
          <p className="text-sm text-muted-foreground">
            {offers.length === 0
              ? "Não há ofertas cadastradas no Firebase."
              : "Nenhuma oferta corresponde aos filtros."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-10 py-2 pl-3 pr-1.5">
                    <input
                      type="checkbox"
                      checked={filteredOffers.length > 0 && selectedIds.size === filteredOffers.length}
                      onChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/30"
                      aria-label="Selecionar todas"
                    />
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">Foto</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Oferta</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loja</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cidade</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Categoria</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Desconto</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Status</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOffers.map((offer) => (
                  <tr
                    key={offer.id}
                    onClick={() => offer.id && navigate(`/sys-admin-panel-7x9k/products/${offer.id}`)}
                    className={`transition-colors cursor-pointer ${
                      offer.id && selectedIds.has(offer.id) ? "bg-primary/10 hover:bg-primary/15" : "bg-card hover:bg-muted/30"
                    }`}
                  >
                    <td className="w-10 py-2 pl-3 pr-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={offer.id ? selectedIds.has(offer.id) : false}
                        onChange={() => offer.id && toggleSelect(offer.id)}
                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/30"
                        aria-label={`Selecionar ${offer.title}`}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <div className="w-8 h-8 rounded-md bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                        <Tag className="h-3 w-3 text-primary" />
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-medium text-card-foreground">{offer.title}</span>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {offer.storeName}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {offer.storeCity || "—"}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-secondary/20 text-secondary-foreground">
                        {offer.category || "—"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {offer.discount || "—"}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium ${
                          offer.active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {offer.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(offer);
                        }}
                        disabled={togglingId === offer.id}
                        className={`p-1.5 rounded-md transition-all inline-flex ${
                          offer.active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={offer.active ? "Desativar oferta" : "Ativar oferta"}
                      >
                        {togglingId === offer.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : offer.active ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
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

export default AdminProductsPage;
