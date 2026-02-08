import { useState } from "react";
import { Store, Search, Check, X, Edit, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Store {
  id: string;
  name: string;
  region: string;
  active: boolean;
  offersCount: number;
  rating: number;
}

const AdminStoresPage = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const [stores, setStores] = useState<Store[]>([
    { id: "1", name: "Café Central", region: "São Paulo - Centro", active: true, offersCount: 5, rating: 4.8 },
    { id: "2", name: "Restaurante Sabor", region: "Rio de Janeiro - Zona Sul", active: true, offersCount: 3, rating: 4.6 },
    { id: "3", name: "Padaria Doce Vida", region: "Belo Horizonte - Centro", active: true, offersCount: 8, rating: 4.9 },
    { id: "4", name: "Supermercado Bom Preço", region: "São Paulo - Centro", active: false, offersCount: 12, rating: 4.5 },
    { id: "5", name: "Farmácia Saúde", region: "Porto Alegre - Centro", active: true, offersCount: 2, rating: 4.7 },
  ]);

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && store.active) ||
      (filterActive === "inactive" && !store.active);
    return matchesSearch && matchesFilter;
  });

  const handleToggleActive = (id: string) => {
    setStores(stores.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    toast.success("Status da loja atualizado");
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

      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground mb-1 truncate">{store.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{store.region}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>⭐ {store.rating}</span>
                    <span>{store.offersCount} ofertas</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleActive(store.id)}
                className={`p-2 rounded-lg transition-all shrink-0 ${
                  store.active
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {store.active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all">
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminStoresPage;
