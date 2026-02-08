import { useState, useEffect, useRef } from "react";
import { MapPin, Plus, Search, Edit, Trash2, Check, X, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Region {
  id: string;
  name: string;
  state: string;
  stateName?: string;
  city?: string;
  country: string;
  active: boolean;
  storesCount: number;
}

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
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
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

  // Dados mockados
  const [regions, setRegions] = useState<Region[]>([
    { id: "1", name: "São Paulo - Centro", state: "SP", stateName: "São Paulo", city: "São Paulo", country: "Brasil", active: true, storesCount: 245 },
    { id: "2", name: "Rio de Janeiro - Zona Sul", state: "RJ", stateName: "Rio de Janeiro", city: "Rio de Janeiro", country: "Brasil", active: true, storesCount: 189 },
    { id: "3", name: "Belo Horizonte - Centro", state: "MG", stateName: "Minas Gerais", city: "Belo Horizonte", country: "Brasil", active: true, storesCount: 156 },
    { id: "4", name: "Porto Alegre - Centro", state: "RS", stateName: "Rio Grande do Sul", city: "Porto Alegre", country: "Brasil", active: false, storesCount: 98 },
  ]);

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

  const filteredRegions = regions.filter((region) =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    region.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    region.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleActive = (id: string) => {
    setRegions(regions.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    toast.success("Status da região atualizado");
  };

  const handleAddRegion = () => {
    if (!newRegion.state || !newRegion.city) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    const regionName = `${newRegion.city} - ${newRegion.stateName || newRegion.state}`;
    const region: Region = {
      id: Date.now().toString(),
      name: regionName,
      state: newRegion.stateCode || newRegion.state,
      stateName: newRegion.stateName,
      city: newRegion.city,
      country: "Brasil",
      active: true,
      storesCount: 0,
    };
    setRegions([...regions, region]);
    setNewRegion({ state: "", stateName: "", stateCode: "", city: "", cityId: "" });
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
                  <p className="text-sm text-muted-foreground">
                    {region.city && `${region.city}, `}
                    {region.stateName || region.state}
                    {region.country && ` - ${region.country}`}
                  </p>
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
    </div>
  );
};

export default AdminLocationsPage;
