import { useState } from "react";
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  ChevronRight,
  ShoppingCart,
  ShoppingBag,
  Store,
  Pizza,
  Coffee,
  Utensils,
  Apple,
  Heart,
  Activity,
  Pill,
  Stethoscope,
  Wrench,
  Settings,
  Tool,
  Briefcase,
  Package,
  Grid,
  Gift,
  Sparkles,
  Award,
  type LucideIcon,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  icon: string; // Nome do ícone da Lucide React
  active: boolean;
  productsCount: number;
}

// Ícones organizados por categoria
const iconCategories = {
  compras: [
    { name: "ShoppingCart", icon: ShoppingCart, label: "Carrinho" },
    { name: "ShoppingBag", icon: ShoppingBag, label: "Sacola" },
    { name: "Store", icon: Store, label: "Loja" },
    { name: "Package", icon: Package, label: "Pacote" },
  ],
  comida: [
    { name: "Pizza", icon: Pizza, label: "Pizza" },
    { name: "Coffee", icon: Coffee, label: "Café" },
    { name: "Utensils", icon: Utensils, label: "Talheres" },
    { name: "Apple", icon: Apple, label: "Maçã" },
  ],
  saude: [
    { name: "Heart", icon: Heart, label: "Coração" },
    { name: "Activity", icon: Activity, label: "Atividade" },
    { name: "Pill", icon: Pill, label: "Remédio" },
    { name: "Stethoscope", icon: Stethoscope, label: "Estetoscópio" },
  ],
  servico: [
    { name: "Wrench", icon: Wrench, label: "Chave" },
    { name: "Settings", icon: Settings, label: "Configurações" },
    { name: "Tool", icon: Tool, label: "Ferramenta" },
    { name: "Briefcase", icon: Briefcase, label: "Maleta" },
  ],
  geral: [
    { name: "Tag", icon: Tag, label: "Tag" },
    { name: "Grid", icon: Grid, label: "Grade" },
    { name: "Package", icon: Package, label: "Pacote" },
  ],
  brindes: [
    { name: "Gift", icon: Gift, label: "Presente" },
    { name: "Sparkles", icon: Sparkles, label: "Brilho" },
    { name: "Award", icon: Award, label: "Prêmio" },
  ],
};

// Mapa de todos os ícones disponíveis
const allIcons = Object.values(iconCategories).flat();

// Função para obter o componente do ícone pelo nome
const getIconComponent = (iconName: string): LucideIcon | null => {
  const iconData = allIcons.find((i) => i.name === iconName);
  return iconData ? iconData.icon : null;
};

const AdminCategoriesPage = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "" });

  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Bebidas", icon: "Coffee", active: true, productsCount: 45 },
    { id: "2", name: "Comida", icon: "Pizza", active: true, productsCount: 78 },
    { id: "3", name: "Brindes", icon: "Gift", active: true, productsCount: 23 },
    { id: "4", name: "Saúde", icon: "Heart", active: false, productsCount: 12 },
  ]);
  const [showIconPicker, setShowIconPicker] = useState(false);

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
    if (!newCategory.icon) {
      toast.error("Selecione um ícone para a categoria");
      return;
    }
    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      icon: newCategory.icon || "Tag",
      active: true,
      productsCount: 0,
    };
    setCategories([...categories, category]);
    setNewCategory({ name: "", icon: "" });
    setShowAddModal(false);
    setShowIconPicker(false);
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {(() => {
                    const IconComponent = getIconComponent(category.icon);
                    return IconComponent ? (
                      <IconComponent className="h-6 w-6" />
                    ) : (
                      <Tag className="h-6 w-6" />
                    );
                  })()}
                </div>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              setShowIconPicker(false);
              setNewCategory({ name: "", icon: "" });
            }
          }}
        >
          <div className="bg-card rounded-2xl border border-border shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
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
                  Ícone
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full px-4 py-3 rounded-xl bg-background text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {newCategory.icon ? (
                        <>
                          {(() => {
                            const IconComponent = getIconComponent(newCategory.icon);
                            return IconComponent ? (
                              <IconComponent className="h-5 w-5 text-primary" />
                            ) : null;
                          })()}
                          <span className="text-sm">{allIcons.find((i) => i.name === newCategory.icon)?.label || newCategory.icon}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Selecione um ícone</span>
                      )}
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showIconPicker ? "rotate-90" : ""}`} />
                  </button>

                  {showIconPicker && (
                    <div className="absolute z-10 mt-2 w-full bg-card border border-border rounded-xl shadow-lg p-4 max-h-96 overflow-y-auto">
                      <div className="space-y-4">
                        {Object.entries(iconCategories).map(([categoryName, icons]) => (
                          <div key={categoryName}>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
                              {categoryName === "compras" && "Compras"}
                              {categoryName === "comida" && "Comida"}
                              {categoryName === "saude" && "Saúde"}
                              {categoryName === "servico" && "Serviço"}
                              {categoryName === "geral" && "Geral"}
                              {categoryName === "brindes" && "Brindes"}
                            </h4>
                            <div className="grid grid-cols-4 gap-2">
                              {icons.map((iconData) => {
                                const IconComponent = iconData.icon;
                                const isSelected = newCategory.icon === iconData.name;
                                return (
                                  <button
                                    key={iconData.name}
                                    type="button"
                                    onClick={() => {
                                      setNewCategory({ ...newCategory, icon: iconData.name });
                                      setShowIconPicker(false);
                                    }}
                                    className={`
                                      flex flex-col items-center justify-center gap-1 p-3 rounded-lg
                                      border-2 transition-all
                                      ${isSelected
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border bg-background text-card-foreground hover:border-primary/50 hover:bg-muted/50"
                                      }
                                    `}
                                  >
                                    <IconComponent className="h-5 w-5" />
                                    <span className="text-xs">{iconData.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowIconPicker(false);
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
