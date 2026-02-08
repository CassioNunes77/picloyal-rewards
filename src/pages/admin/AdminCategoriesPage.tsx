import { useState } from "react";
import { Tag, Plus, Search, Edit, Trash2, Check, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  productsCount: number;
}

const AdminCategoriesPage = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "" });

  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Bebidas", icon: "☕", active: true, productsCount: 45 },
    { id: "2", name: "Comida", icon: "🍕", active: true, productsCount: 78 },
    { id: "3", name: "Brindes", icon: "🎁", active: true, productsCount: 23 },
    { id: "4", name: "Saúde", icon: "💊", active: false, productsCount: 12 },
  ]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleActive = (id: string) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
    toast.success("Status da categoria atualizado");
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast.error("Preencha o nome da categoria");
      return;
    }
    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      icon: newCategory.icon || "📦",
      active: true,
      productsCount: 0,
    };
    setCategories([...categories, category]);
    setNewCategory({ name: "", icon: "" });
    setShowAddModal(false);
    toast.success("Categoria adicionada com sucesso");
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta categoria?")) {
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Categoria removida");
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2">Categorias</h1>
          <p className="text-sm text-muted-foreground">Gerenciar categorias de produtos</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-all"
        >
          <Plus className="h-5 w-5" />
          Adicionar Categoria
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"} gap-4`}>
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{category.icon}</div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.productsCount} produtos</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleActive(category.id)}
                className={`p-2 rounded-lg transition-all ${
                  category.active
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category.active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all">
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-card-foreground mb-4">Adicionar Categoria</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Ex: Eletrônicos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Ícone (emoji)
                </label>
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Ex: 📱"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategory({ name: "", icon: "" });
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-muted text-card-foreground font-medium hover:bg-muted/80 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 px-4 py-3 rounded-xl gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-all"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
