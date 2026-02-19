import { useState } from "react";
import { Package, Search, Check, X, Edit, Tag } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  store: string;
  category: string;
  discount: string;
  active: boolean;
  redemptions: number;
}

const AdminProductsPage = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "20% OFF em Bebidas", store: "Café Central", category: "Bebidas", discount: "20%", active: true, redemptions: 234 },
    { id: "2", name: "Compre 2, Leve 3", store: "Restaurante Sabor", category: "Comida", discount: "33%", active: true, redemptions: 189 },
    { id: "3", name: "10% OFF em Tudo", store: "Supermercado Bom Preço", category: "Geral", discount: "10%", active: true, redemptions: 456 },
    { id: "4", name: "Brinde Especial", store: "Padaria Doce Vida", category: "Brindes", discount: "Grátis", active: false, redemptions: 67 },
    { id: "5", name: "15% OFF em Medicamentos", store: "Farmácia Saúde", category: "Saúde", discount: "15%", active: true, redemptions: 123 },
  ]);

  const categories = ["all", "Bebidas", "Comida", "Brindes", "Saúde", "Geral"];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.store.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && product.active) ||
      (filterActive === "inactive" && !product.active);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const handleToggleActive = (id: string) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
    toast.success("Status do produto atualizado");
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
              {filter === "all" ? "Todos" : filter === "active" ? "Ativos" : "Inativos"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
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

      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="font-semibold text-card-foreground truncate">{product.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{product.store}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded-md bg-secondary/10 text-secondary">
                    {product.category}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-bold">
                    {product.discount}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {product.redemptions} resgates
                </p>
              </div>
              <button
                onClick={() => handleToggleActive(product.id)}
                className={`p-2 rounded-lg transition-all shrink-0 ${
                  product.active
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {product.active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
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

export default AdminProductsPage;
