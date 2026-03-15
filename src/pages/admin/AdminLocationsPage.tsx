import { useState, useEffect, useRef } from "react";
import { MapPin, Plus, Search, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllRegions,
  addRegion,
  updateRegion,
  deleteRegion,
  toggleRegionActive,
  subscribeToRegions,
  type Region,
} from "@/services/regionsService";
import { firestore } from "@/lib/firebase";

interface LocationOption {
  id: string;
  name: string;
  sigla?: string;
}

// Componente de Autocomplete
interface AutocompleteProps {
  value: string;
  onChange: (value: string, code?: string) => void;
  options: LocationOption[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}

function LocationAutocomplete({
  value,
  onChange,
  options,
  placeholder = "Digite para buscar...",
  loading = false,
  disabled = false,
}: AutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(query.toLowerCase()) ||
    opt.sigla?.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (option: LocationOption) => {
    onChange(option.name, option.sigla || option.id);
    setQuery(option.name);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredOptions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredOptions[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-10 pr-10 py-3 rounded-xl bg-background text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30",
            disabled && "bg-muted cursor-not-allowed opacity-60"
          )}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && !disabled && query.trim() && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors",
                index === selectedIndex && "bg-muted"
              )}
            >
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-card-foreground">{option.name}</div>
                {option.sigla && (
                  <div className="text-xs text-muted-foreground">{option.sigla}</div>
                )}
              </div>
              {query === option.name && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && !loading && !disabled && query.trim() && filteredOptions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg p-4 text-center text-sm text-muted-foreground">
          Nenhuma opção encontrada
        </div>
      )}
    </div>
  );
}

const AdminLocationsPage = () => {
  const { user: firebaseUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRegion, setNewRegion] = useState({
    state: "",
    stateName: "",
    stateCode: "",
    city: "",
    cityId: "",
  });
  const [states, setStates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Carregar estados do IBGE ao montar o componente
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
        const data = await response.json();
        const formattedStates = data.map((state: any) => ({
          id: state.id.toString(),
          name: state.nome,
          sigla: state.sigla,
        }));
        setStates(formattedStates);
      } catch (error) {
        console.error("Erro ao carregar estados:", error);
        toast.error("Erro ao carregar lista de estados");
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Carregar regiões do Firestore e escutar mudanças em tempo real
  useEffect(() => {
    // Verificar se Firestore está configurado
    if (!firestore) {
      console.error("❌ [AdminLocationsPage] Firestore não está configurado!");
      toast.error("Firebase não está configurado. Verifique as variáveis de ambiente.");
      setLoadingRegions(false);
      return;
    }

    // Log de autenticação Firebase (opcional, mas útil para debug)
    if (firebaseUser) {
      console.log("🔐 [AdminLocationsPage] Usuário Firebase Auth:", firebaseUser.uid);
    } else {
      console.log("ℹ️ [AdminLocationsPage] Nenhum usuário Firebase Auth (leitura pública permitida pelas regras)");
    }

    setLoadingRegions(true);
    console.log("🔍 [AdminLocationsPage] Iniciando carregamento de regiões do Firebase...");
    console.log("📁 [AdminLocationsPage] Firestore configurado:", !!firestore);
    
    let hasReceivedData = false;
    
    // Escuta mudanças em tempo real (isso carrega e atualiza automaticamente)
    const unsubscribe = subscribeToRegions(
      (updatedRegions) => {
        hasReceivedData = true;
        console.log("✅ [AdminLocationsPage] Regiões recebidas do Firebase:", updatedRegions.length);
        if (updatedRegions.length > 0) {
          console.log("📋 [AdminLocationsPage] Primeira região:", updatedRegions[0]);
        }
        setRegions(updatedRegions);
        setLoadingRegions(false);
      },
      false // false = carregar todas as regiões, não apenas ativas
    );

    // Fallback: se o subscribe não funcionar, tenta carregar manualmente após 3 segundos
    const timeoutId = setTimeout(async () => {
      if (!hasReceivedData) {
        console.warn("⚠️ [AdminLocationsPage] Timeout: Tentando carregar regiões manualmente...");
        try {
          const initialRegions = await getAllRegions();
          console.log("🔄 [AdminLocationsPage] Fallback: Regiões carregadas manualmente:", initialRegions.length);
          setRegions(initialRegions);
          setLoadingRegions(false);
        } catch (error) {
          console.error("❌ [AdminLocationsPage] Erro ao carregar regiões:", error);
          toast.error("Erro ao carregar regiões. Verifique sua conexão com o Firebase.");
          setLoadingRegions(false);
        }
      }
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [firebaseUser]);


  // Carregar cidades quando um estado é selecionado
  useEffect(() => {
    const fetchCities = async () => {
      if (!newRegion.stateCode) {
        setCities([]);
        return;
      }

      setLoadingCities(true);
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${newRegion.stateCode}/municipios?orderBy=nome`
        );
        const data = await response.json();
        const formattedCities = data.map((city: any) => ({
          id: city.id.toString(),
          name: city.nome,
        }));
        setCities(formattedCities);
      } catch (error) {
        console.error("Erro ao carregar cidades:", error);
        toast.error("Erro ao carregar lista de cidades");
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [newRegion.stateCode]);

  const filteredRegions = regions.filter((region) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      region.name?.toLowerCase().includes(query) ||
      region.state?.toLowerCase().includes(query) ||
      region.city?.toLowerCase().includes(query) ||
      region.stateName?.toLowerCase().includes(query);
    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && region.active) ||
      (filterActive === "inactive" && !region.active);
    return matchesSearch && matchesFilter;
  });

  // Debug: log para verificar o estado
  useEffect(() => {
    console.log("🔍 [AdminLocationsPage] Estado atual:", {
      loadingRegions,
      regionsCount: regions.length,
      filteredRegionsCount: filteredRegions.length,
      searchQuery,
      firestoreConfigured: !!firestore,
    });
    if (regions.length > 0) {
      console.log("📋 [AdminLocationsPage] Primeiras 3 regiões:", regions.slice(0, 3).map(r => ({
        id: r.id,
        name: r.name,
        city: r.city,
        state: r.state,
        stateName: r.stateName,
        country: r.country,
        active: r.active,
      })));
    }
  }, [regions.length, filteredRegions.length, loadingRegions, searchQuery]);

  const handleToggleActive = async (region: Region) => {
    if (!region.id) return;
    setTogglingId(region.id);
    try {
      await toggleRegionActive(region.id, region.active);
      setRegions((prev) => prev.map((r) => (r.id === region.id ? { ...r, active: !r.active } : r)));
      toast.success(region.active ? "Região desativada" : "Região ativada");
    } catch (error) {
      console.error("Erro ao atualizar status da região:", error);
      toast.error("Erro ao atualizar status da região");
    } finally {
      setTogglingId(null);
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
    if (selectedIds.size === filteredRegions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRegions.map((r) => r.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkSetActive = async (active: boolean) => {
    const ids = Array.from(selectedIds);
    const toUpdate = regions.filter((r) => ids.includes(r.id));
    if (toUpdate.length === 0) return;
    setTogglingId(ids[0] ?? null);
    let ok = 0;
    let fail = 0;
    try {
      for (const region of toUpdate) {
        try {
          await updateRegion(region.id, { active });
          setRegions((prev) => prev.map((r) => (r.id === region.id ? { ...r, active } : r)));
          ok++;
        } catch {
          fail++;
        }
      }
      setSelectedIds(new Set());
      if (ok) toast.success(ok === 1 ? (active ? "Região ativada" : "Região desativada") : `${ok} regiões atualizadas.`);
      if (fail) toast.error(`${fail} região(ões) não puderam ser atualizadas.`);
    } finally {
      setTogglingId(null);
    }
  };

  const openDeleteModal = () => setShowDeleteModal(true);

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    const toDelete = regions.filter((r) => ids.includes(r.id));
    if (toDelete.length === 0) return;
    setDeleting(true);
    let ok = 0;
    let fail = 0;
    try {
      for (const region of toDelete) {
        try {
          await deleteRegion(region.id);
          ok++;
        } catch {
          fail++;
        }
      }
      setSelectedIds(new Set());
      setShowDeleteModal(false);
      setRegions((prev) => prev.filter((r) => !ids.includes(r.id)));
      if (ok) toast.success(ok === 1 ? "Região excluída." : `${ok} regiões excluídas.`);
      if (fail) toast.error(`${fail} região(ões) não puderam ser excluídas.`);
    } finally {
      setDeleting(false);
    }
  };

  const handleAddRegion = async () => {
    if (!newRegion.state || !newRegion.city) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Verificar se a cidade já existe no mesmo estado
    const stateCode = newRegion.stateCode || newRegion.state;
    const cityExists = regions.some(
      (r) =>
        r.city?.toLowerCase() === newRegion.city.toLowerCase() &&
        r.state.toLowerCase() === stateCode.toLowerCase()
    );

    if (cityExists) {
      toast.error("Esta cidade já está cadastrada neste estado");
      return;
    }

    // Salvar dados antes de fechar o modal
    const regionData = {
      name: `${newRegion.city} - ${newRegion.stateName || newRegion.state}`,
      state: stateCode,
      stateName: newRegion.stateName,
      city: newRegion.city,
      cityId: newRegion.cityId,
      country: "Brasil",
      active: true,
    };

    // Adicionar região no Firebase ANTES de fechar o modal
    try {
      console.log("🚀 [AdminLocationsPage] Tentando salvar região:", regionData);
      const regionId = await addRegion(regionData);
      console.log("✅ [AdminLocationsPage] Região salva no Firebase com ID:", regionId);
      
      // Aguardar um pouco para garantir que o Firestore processou
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fechar modal e limpar campos apenas após sucesso
      setShowAddModal(false);
      setNewRegion({ state: "", stateName: "", stateCode: "", city: "", cityId: "" });
      setCities([]);
      
      // Toast de sucesso
      toast.success("Região adicionada com sucesso");
      
      // A lista será atualizada automaticamente pelo subscribeToRegions
    } catch (error: any) {
      console.error("❌ [AdminLocationsPage] Erro ao adicionar região no Firebase:", error);
      const errorMessage = error?.message || "Erro desconhecido ao salvar região";
      toast.error(`Erro ao salvar região: ${errorMessage}`);
      // NÃO fecha o modal em caso de erro para o usuário poder tentar novamente
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Regiões</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loadingRegions ? "—" : `${regions.length} região${regions.length !== 1 ? "ões" : ""} cadastrada${regions.length !== 1 ? "s" : ""}`}
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
          Adicionar Região
        </button>
      </div>

      <div className="mb-4 space-y-4">
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
          {filteredRegions.length} resultado{filteredRegions.length !== 1 ? "s" : ""} encontrado{filteredRegions.length !== 1 ? "s" : ""}.
        </p>
      )}

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium text-card-foreground">
            {selectedIds.size} região{selectedIds.size !== 1 ? "ões" : ""} selecionada{selectedIds.size !== 1 ? "s" : ""}
          </span>
          <button type="button" onClick={() => bulkSetActive(true)} disabled={!!togglingId} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">Ativar</button>
          <button type="button" onClick={() => bulkSetActive(false)} disabled={!!togglingId} className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">Desativar</button>
          <button type="button" onClick={openDeleteModal} disabled={!!togglingId} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">Excluir</button>
          <button type="button" onClick={clearSelection} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-card-foreground hover:bg-muted">Desmarcar</button>
        </div>
      )}

      {loadingRegions ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Carregando regiões...</p>
        </div>
      ) : filteredRegions.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-card-foreground font-medium mb-2">
            {regions.length === 0 ? "Nenhuma região cadastrada" : "Nenhuma região encontrada"}
          </p>
          <p className="text-sm text-muted-foreground">
            {regions.length === 0 ? "Adicione uma região para começar." : "Nenhuma região corresponde aos filtros."}
          </p>
          {!firestore && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto mt-4">
              <p className="text-sm text-destructive font-medium">⚠️ Firebase não configurado</p>
              <p className="text-xs text-destructive/80">Verifique as variáveis de ambiente no .env</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-12 py-3 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={filteredRegions.length > 0 && selectedIds.size === filteredRegions.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                      aria-label="Selecionar todas"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cidade</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Lojas</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRegions.map((region) => (
                  <tr
                    key={region.id}
                    className={`transition-colors ${
                      selectedIds.has(region.id) ? "bg-primary/10 hover:bg-primary/15" : "bg-card hover:bg-muted/30"
                    }`}
                  >
                    <td className="w-12 py-3 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(region.id)}
                        onChange={() => toggleSelect(region.id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                        aria-label={`Selecionar ${region.name}`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-card-foreground">{region.name}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {region.city || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {region.stateName || region.state || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {region.storesCount} lojas
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          region.active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {region.active ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(region)}
                        disabled={togglingId === region.id}
                        className={`p-2 rounded-lg transition-all inline-flex ${
                          region.active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={region.active ? "Desativar região" : "Ativar região"}
                      >
                        {togglingId === region.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : region.active ? (
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

      {/* Modal Adicionar Região */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold text-card-foreground mb-4">Adicionar Região</h2>
            <div className="space-y-4">
              {/* País - Fixo como Brasil */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  País
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value="Brasil"
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted text-card-foreground border border-border cursor-not-allowed opacity-60"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Apenas localizações brasileiras são suportadas no momento</p>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Estado <span className="text-destructive">*</span>
                </label>
                <LocationAutocomplete
                  value={newRegion.state}
                  onChange={(name, code) => {
                    const stateObj = states.find((s) => s.name === name);
                    setNewRegion({
                      ...newRegion,
                      state: name,
                      stateName: name,
                      stateCode: code || stateObj?.sigla || "",
                      city: "",
                      cityId: "",
                    });
                    setCities([]);
                  }}
                  options={states}
                  placeholder="Digite o nome do estado..."
                  loading={loadingStates}
                />
              </div>

              {/* Cidade */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Cidade <span className="text-destructive">*</span>
                </label>
                {newRegion.stateCode ? (
                  <LocationAutocomplete
                    value={newRegion.city}
                    onChange={(name, id) => {
                      setNewRegion({
                        ...newRegion,
                        city: name,
                        cityId: id || "",
                      });
                    }}
                    options={cities}
                    placeholder="Digite o nome da cidade..."
                    loading={loadingCities}
                  />
                ) : (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      disabled
                      placeholder="Selecione um estado primeiro"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted text-muted-foreground border border-border cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewRegion({ state: "", stateName: "", stateCode: "", city: "", cityId: "" });
                  setCities([]);
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

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Excluir regiões?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você está prestes a excluir <strong>{selectedIds.size}</strong> região
              {selectedIds.size !== 1 ? "ões" : ""}. Esta ação não pode ser desfeita.
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

export default AdminLocationsPage;
