import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Search, Check, X, Loader2, MapPin, Tag } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { getAllStores } from "@/services/merchantsService";
import { getStoreOffers, updateOffer, type OfferData } from "@/services/offersService";
import { getAllRegions, type Region } from "@/services/regionsService";

interface OfferWithStore extends OfferData {
  storeName: string;
  storeCity: string;
}

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [filterRegionId, setFilterRegionId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [offers, setOffers] = useState<OfferWithStore[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  return (
    <div className="min-h-full bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Ofertas</h1>
        <p className="text-sm text-muted-foreground">Gerenciar ofertas e descontos</p>
      </div>

      <div className="mb-6 space-y-4">
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
              {cat === "all" ? "Todas" : cat}
            </button>
          ))}
        </div>
      </div>

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
        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-5"} gap-3`}>
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              onClick={() => offer.id && navigate(`/sys-admin-panel-7x9k/products/${offer.id}`)}
              className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground text-sm truncate">{offer.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{offer.storeName}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">
                        {offer.category}
                      </span>
                      {offer.discount && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                          {offer.discount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActive(offer);
                  }}
                  disabled={togglingId === offer.id}
                  className={`p-2 rounded-lg transition-all shrink-0 ${
                    offer.active
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={offer.active ? "Desativar oferta" : "Ativar oferta"}
                >
                  {togglingId === offer.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : offer.active ? (
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

export default AdminProductsPage;
