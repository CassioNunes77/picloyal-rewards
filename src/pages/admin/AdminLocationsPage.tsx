import { useState } from "react";
import { MapPin, Plus, Search, Edit, Trash2, Check, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Region {
  id: string;
  name: string;
  state: string;
  active: boolean;
  storesCount: number;
}

const AdminLocationsPage = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRegion, setNewRegion] = useState({ name: "", state: "" });

  // Dados mockados
  const [regions, setRegions] = useState<Region[]>([
    { id: "1", name: "São Paulo - Centro", state: "SP", active: true, storesCount: 245 },
    { id: "2", name: "Rio de Janeiro - Zona Sul", state: "RJ", active: true, storesCount: 189 },
    { id: "3", name: "Belo Horizonte - Centro", state: "MG", active: true, storesCount: 156 },
    { id: "4", name: "Porto Alegre - Centro", state: "RS", active: false, storesCount: 98 },
  ]);

  const filteredRegions = regions.filter((region) =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    region.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleActive = (id: string) => {
    setRegions(regions.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    toast.success("Status da região atualizado");
  };

  const handleAddRegion = () => {
    if (!newRegion.name || !newRegion.state) {
      toast.error("Preencha todos os campos");
      return;
    }
    const region: Region = {
      id: Date.now().toString(),
      name: newRegion.name,
      state: newRegion.state,
      active: true,
      storesCount: 0,
    };
    setRegions([...regions, region]);
    setNewRegion({ name: "", state: "" });
    setShowAddModal(false);
    toast.success("Região adicionada com sucesso");
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2">Localização</h1>
          <p className="text-sm text-muted-foreground">Gerenciar regiões e localizações</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-all"
        >
          <Plus className="h-5 w-5" />
          Adicionar Região
        </button>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar região..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Lista de Regiões */}
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
        {filteredRegions.map((region) => (
          <div
            key={region.id}
            className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">{region.name}</h3>
                  <p className="text-sm text-muted-foreground">{region.state}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleActive(region.id)}
                className={`p-2 rounded-lg transition-all ${
                  region.active
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {region.active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {region.storesCount} lojas
              </span>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Adicionar Região */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-card-foreground mb-4">Adicionar Região</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Nome da Região
                </label>
                <input
                  type="text"
                  value={newRegion.name}
                  onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Ex: São Paulo - Centro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  value={newRegion.state}
                  onChange={(e) => setNewRegion({ ...newRegion, state: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-xl bg-background text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Ex: SP"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewRegion({ name: "", state: "" });
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-muted text-card-foreground font-medium hover:bg-muted/80 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddRegion}
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

export default AdminLocationsPage;
