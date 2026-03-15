import { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Search,
  Edit,
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
  Briefcase,
  Package,
  Grid,
  Gift,
  Sparkles,
  Award,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  subscribeToCategories,
  type Category,
} from "@/services/categoriesService";
import { firestore } from "@/lib/firebase";

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
    { name: "Briefcase", icon: Briefcase, label: "Maleta" },
    { name: "Grid", icon: Grid, label: "Serviços" },
  ],
  geral: [
    { name: "Tag", icon: Tag, label: "Tag" },
    { name: "Package", icon: Package, label: "Pacote" },
    { name: "Award", icon: Award, label: "Geral" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "" });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategory, setEditCategory] = useState({ name: "", icon: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Carregar categorias do Firestore e escutar mudanças em tempo real
  useEffect(() => {
    // Verificar se Firestore está configurado
    if (!firestore) {
      console.error("❌ [AdminCategoriesPage] Firestore não está configurado!");
      toast.error("Firebase não está configurado. Verifique as variáveis de ambiente.");
      setLoadingCategories(false);
      return;
    }

    setLoadingCategories(true);
    console.log("🔍 [AdminCategoriesPage] Iniciando carregamento de categorias do Firebase...");
    console.log("📁 [AdminCategoriesPage] Firestore configurado:", !!firestore);
    
    let hasReceivedData = false;
    
    // Escuta mudanças em tempo real (isso carrega e atualiza automaticamente)
    const unsubscribe = subscribeToCategories(
      (updatedCategories) => {
        hasReceivedData = true;
        console.log("✅ [AdminCategoriesPage] Categorias recebidas do Firebase:", updatedCategories.length);
        if (updatedCategories.length > 0) {
          console.log("📋 [AdminCategoriesPage] Primeira categoria:", updatedCategories[0]);
        }
        setCategories(updatedCategories);
        setLoadingCategories(false);
      },
      false // false = carregar todas as categorias, não apenas ativas
    );

    // Fallback: se o subscribe não funcionar, tenta carregar manualmente após 3 segundos
    const timeoutId = setTimeout(async () => {
      if (!hasReceivedData) {
        console.warn("⚠️ [AdminCategoriesPage] Timeout: Tentando carregar categorias manualmente...");
        try {
          const initialCategories = await getAllCategories();
          console.log("🔄 [AdminCategoriesPage] Fallback: Categorias carregadas manualmente:", initialCategories.length);
          setCategories(initialCategories);
          setLoadingCategories(false);
        } catch (error) {
          console.error("❌ [AdminCategoriesPage] Erro ao carregar categorias:", error);
          toast.error("Erro ao carregar categorias. Verifique sua conexão com o Firebase.");
          setLoadingCategories(false);
        }
      }
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && cat.active) ||
      (filterActive === "inactive" && !cat.active);
    return matchesSearch && matchesFilter;
  });

  const handleToggleActive = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    setUpdatingCategoryId(id);
    try {
      await toggleCategoryActive(id, category.active);
      toast.success(`Categoria ${!category.active ? "ativada" : "desativada"} com sucesso`);
    } catch (error) {
      console.error("Erro ao atualizar status da categoria:", error);
      toast.error("Erro ao atualizar status da categoria");
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setEditCategory({ name: category.name, icon: category.icon });
    setShowEditIconPicker(false);
    setShowEditModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    if (!editCategory.name.trim()) {
      toast.error("Preencha o nome da categoria");
      return;
    }
    if (!editCategory.icon) {
      toast.error("Selecione um ícone para a categoria");
      return;
    }

    // Verificar se o nome foi alterado e se já existe outra categoria com esse nome
    if (editCategory.name.toLowerCase() !== editingCategory.name.toLowerCase()) {
      const categoryExists = categories.some(
        (c) => c.id !== editingCategory.id && c.name.toLowerCase() === editCategory.name.toLowerCase()
      );

      if (categoryExists) {
        toast.error("Esta categoria já está cadastrada");
        return;
      }
    }

    setUpdatingCategoryId(editingCategory.id);
    try {
      await updateCategory(editingCategory.id, {
        name: editCategory.name.trim(),
        icon: editCategory.icon,
      });
      toast.success("Categoria atualizada com sucesso");
      setShowEditModal(false);
      setEditingCategory(null);
      setEditCategory({ name: "", icon: "" });
      setShowEditIconPicker(false);
    } catch (error: any) {
      console.error("Erro ao atualizar categoria:", error);
      const errorMessage = error?.message || "Erro desconhecido ao atualizar categoria";
      toast.error(`Erro ao atualizar categoria: ${errorMessage}`);
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error("Preencha o nome da categoria");
      return;
    }
    if (!newCategory.icon) {
      toast.error("Selecione um ícone para a categoria");
      return;
    }

    // Verificar se a categoria já existe
    const categoryExists = categories.some(
      (c) => c.name.toLowerCase() === newCategory.name.toLowerCase()
    );

    if (categoryExists) {
      toast.error("Esta categoria já está cadastrada");
      return;
    }

    // Salvar dados antes de fechar o modal
    const categoryData = {
      name: newCategory.name.trim(),
      icon: newCategory.icon,
      active: true,
    };

    // Adicionar categoria no Firebase ANTES de fechar o modal
    try {
      console.log("🚀 [AdminCategoriesPage] Tentando salvar categoria:", categoryData);
      const categoryId = await addCategory(categoryData);
      console.log("✅ [AdminCategoriesPage] Categoria salva no Firebase com ID:", categoryId);
      
      // Aguardar um pouco para garantir que o Firestore processou
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fechar modal e limpar campos apenas após sucesso
      setShowAddModal(false);
      setShowIconPicker(false);
      setNewCategory({ name: "", icon: "" });
      
      // Toast de sucesso
      toast.success("Categoria adicionada e salva com sucesso");
      
      // A lista será atualizada automaticamente pelo subscribeToCategories
    } catch (error: any) {
      console.error("❌ [AdminCategoriesPage] Erro ao adicionar categoria no Firebase:", error);
      const errorMessage = error?.message || "Erro desconhecido ao salvar categoria";
      toast.error(`Erro ao salvar categoria: ${errorMessage}`);
      // NÃO fecha o modal em caso de erro para o usuário poder tentar novamente
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCategories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCategories.map((c) => c.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkSetActive = async (active: boolean) => {
    const ids = Array.from(selectedIds);
    const toUpdate = categories.filter((c) => ids.includes(c.id));
    if (toUpdate.length === 0) return;
    setUpdatingCategoryId(ids[0] ?? null);
    let ok = 0;
    let fail = 0;
    try {
      for (const cat of toUpdate) {
        try {
          await updateCategory(cat.id, { active });
          setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, active } : c)));
          ok++;
        } catch {
          fail++;
        }
      }
      setSelectedIds(new Set());
      if (ok) toast.success(ok === 1 ? (active ? "Categoria ativada" : "Categoria desativada") : `${ok} categorias atualizadas.`);
      if (fail) toast.error(`${fail} categoria(s) não puderam ser atualizadas.`);
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const openDeleteModal = () => setShowDeleteModal(true);

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    const toDelete = categories.filter((c) => ids.includes(c.id));
    if (toDelete.length === 0) return;
    setDeleting(true);
    let ok = 0;
    let fail = 0;
    try {
      for (const cat of toDelete) {
        try {
          await deleteCategory(cat.id);
          ok++;
        } catch {
          fail++;
        }
      }
      setSelectedIds(new Set());
      setShowDeleteModal(false);
      setCategories((prev) => prev.filter((c) => !ids.includes(c.id)));
      if (ok) toast.success(ok === 1 ? "Categoria excluída." : `${ok} categorias excluídas.`);
      if (fail) toast.error(`${fail} categoria(s) não puderam ser excluídas.`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loadingCategories ? "—" : `${categories.length} categoria${categories.length !== 1 ? "s" : ""} cadastrada${categories.length !== 1 ? "s" : ""}`}
          </p>
          {!firestore && (
            <p className="text-xs text-destructive mt-1">⚠️ Firebase não está configurado.</p>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-all"
        >
          <Plus className="h-5 w-5" />
          Adicionar Categoria
        </button>
      </div>

      <div className="mb-4 space-y-4">
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
        <div className="flex flex-wrap items-center gap-2">
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
          {filteredCategories.length} resultado{filteredCategories.length !== 1 ? "s" : ""} encontrado{filteredCategories.length !== 1 ? "s" : ""}.
        </p>
      )}

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium text-card-foreground">
            {selectedIds.size} categoria{selectedIds.size !== 1 ? "s" : ""} selecionada{selectedIds.size !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={() => bulkSetActive(true)}
            disabled={!!updatingCategoryId}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Ativar
          </button>
          <button
            type="button"
            onClick={() => bulkSetActive(false)}
            disabled={!!updatingCategoryId}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Desativar
          </button>
          <button
            type="button"
            onClick={openDeleteModal}
            disabled={!!updatingCategoryId}
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

      {loadingCategories ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          <span className="ml-3 text-muted-foreground">Carregando categorias...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-card-foreground font-medium mb-2">Nenhuma categoria cadastrada</p>
          <p className="text-sm text-muted-foreground mb-4">Adicione uma categoria para começar.</p>
          {!firestore && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-destructive font-medium">⚠️ Firebase não configurado</p>
              <p className="text-xs text-destructive/80">Verifique as variáveis de ambiente no .env</p>
            </div>
          )}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-card-foreground font-medium mb-2">Nenhuma categoria encontrada</p>
          <p className="text-sm text-muted-foreground">Nenhuma categoria corresponde aos filtros.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-12 py-3 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={filteredCategories.length > 0 && selectedIds.size === filteredCategories.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                      aria-label="Selecionar todas"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Ícone</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Ofertas</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    onClick={() => handleEditClick(category)}
                    className={`transition-colors cursor-pointer ${
                      selectedIds.has(category.id) ? "bg-primary/10 hover:bg-primary/15" : "bg-card hover:bg-muted/30"
                    }`}
                  >
                    <td className="w-12 py-3 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(category.id)}
                        onChange={() => toggleSelect(category.id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                        aria-label={`Selecionar ${category.name}`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {(() => {
                          const IconComponent = getIconComponent(category.icon);
                          return IconComponent ? (
                            <IconComponent className="h-4 w-4 text-primary" />
                          ) : (
                            <Tag className="h-4 w-4 text-primary" />
                          );
                        })()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-card-foreground">{category.name}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {category.productsCount} ofertas
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          category.active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {category.active ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(category)}
                          disabled={!!updatingCategoryId}
                          className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all disabled:opacity-50"
                          title="Editar categoria"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(category.id)}
                          disabled={updatingCategoryId === category.id}
                          className={`p-2 rounded-lg transition-all ${
                            category.active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={category.active ? "Desativar" : "Ativar"}
                        >
                          {updatingCategoryId === category.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : category.active ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
          <div
            className={`bg-card rounded-2xl border border-border shadow-lg p-6 w-full max-w-md max-h-[90vh] ${showIconPicker ? "overflow-visible" : "overflow-y-auto"}`}
            onClick={(e) => e.stopPropagation()}
          >
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
                    <div className="absolute z-10 mt-2 w-full bg-card border border-border rounded-xl shadow-lg p-3 max-h-[min(200px,40vh)] overflow-y-auto overscroll-contain">
                      <div className="space-y-2">
                        {Object.entries(iconCategories).map(([categoryName, icons]) => (
                          <div key={categoryName} className="mb-2 last:mb-0">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 px-1">
                              {categoryName === "compras" && "Compras"}
                              {categoryName === "comida" && "Comida"}
                              {categoryName === "saude" && "Saúde"}
                              {categoryName === "servico" && "Serviço"}
                              {categoryName === "geral" && "Geral"}
                              {categoryName === "brindes" && "Brindes"}
                            </h4>
                            <div className="grid grid-cols-4 gap-1.5">
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
                                      flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg
                                      border-2 transition-all
                                      ${isSelected
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border bg-background text-card-foreground hover:border-primary/50 hover:bg-muted/50"
                                      }
                                    `}
                                  >
                                    <IconComponent className="h-4 w-4" />
                                    <span className="text-[10px] leading-tight">{iconData.label}</span>
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

      {/* Modal de Edição */}
      {showEditModal && editingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setShowEditIconPicker(false);
              setEditingCategory(null);
              setEditCategory({ name: "", icon: "" });
            }
          }}
        >
          <div
            className={`bg-card rounded-2xl border border-border shadow-lg p-6 w-full max-w-md max-h-[90vh] ${showEditIconPicker ? "overflow-visible" : "overflow-y-auto"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-card-foreground mb-4">Editar Categoria</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={editCategory.name}
                  onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Ex: Eletrônicos"
                  disabled={updatingCategoryId === editingCategory.id}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Ícone
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEditIconPicker(!showEditIconPicker)}
                    disabled={updatingCategoryId === editingCategory.id}
                    className="w-full px-4 py-3 rounded-xl bg-background text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 flex items-center justify-between hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      {editCategory.icon ? (
                        <>
                          {(() => {
                            const IconComponent = getIconComponent(editCategory.icon);
                            return IconComponent ? (
                              <IconComponent className="h-5 w-5 text-primary" />
                            ) : null;
                          })()}
                          <span className="text-sm">{allIcons.find((i) => i.name === editCategory.icon)?.label || editCategory.icon}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Selecione um ícone</span>
                      )}
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showEditIconPicker ? "rotate-90" : ""}`} />
                  </button>

                  {showEditIconPicker && (
                    <div className="absolute z-10 mt-2 w-full bg-card border border-border rounded-xl shadow-lg p-3 max-h-[min(200px,40vh)] overflow-y-auto overscroll-contain">
                      <div className="space-y-2">
                        {Object.entries(iconCategories).map(([categoryName, icons]) => (
                          <div key={categoryName} className="mb-2 last:mb-0">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 px-1">
                              {categoryName === "compras" && "Compras"}
                              {categoryName === "comida" && "Comida"}
                              {categoryName === "saude" && "Saúde"}
                              {categoryName === "servico" && "Serviço"}
                              {categoryName === "geral" && "Geral"}
                              {categoryName === "brindes" && "Brindes"}
                            </h4>
                            <div className="grid grid-cols-4 gap-1.5">
                              {icons.map((iconData) => {
                                const IconComponent = iconData.icon;
                                const isSelected = editCategory.icon === iconData.name;
                                return (
                                  <button
                                    key={iconData.name}
                                    type="button"
                                    onClick={() => {
                                      setEditCategory({ ...editCategory, icon: iconData.name });
                                      setShowEditIconPicker(false);
                                    }}
                                    className={`
                                      flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg
                                      border-2 transition-all
                                      ${isSelected
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border bg-background text-card-foreground hover:border-primary/50 hover:bg-muted/50"
                                      }
                                    `}
                                  >
                                    <IconComponent className="h-4 w-4" />
                                    <span className="text-[10px] leading-tight">{iconData.label}</span>
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
                  setShowEditModal(false);
                  setShowEditIconPicker(false);
                  setEditingCategory(null);
                  setEditCategory({ name: "", icon: "" });
                }}
                disabled={updatingCategoryId === editingCategory.id}
                className="flex-1 px-4 py-3 rounded-xl bg-muted text-card-foreground font-medium hover:bg-muted/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateCategory}
                disabled={updatingCategoryId === editingCategory.id}
                className="flex-1 px-4 py-3 rounded-xl gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updatingCategoryId === editingCategory.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão em massa */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Excluir categorias?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você está prestes a excluir <strong>{selectedIds.size}</strong> categoria
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
    </div>
  );
};

export default AdminCategoriesPage;
