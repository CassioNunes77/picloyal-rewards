import { useState, useEffect, useMemo } from "react";
import { MapPin, ChevronDown, Search, Check, Loader2, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getActiveRegions, type Region } from "@/services/regionsService";
import { toast } from "sonner";

interface StateGroup {
  state: string;
  stateName: string;
  cities: Region[];
}

const LocationSelector = () => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("selectedLocation") || "";
  });
  const [showPicker, setShowPicker] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    if (showPicker) {
      loadLocations();
      setSelectedState(null); // Resetar estado selecionado ao abrir
    }
  }, [showPicker]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const fetchedRegions = await getActiveRegions();
      setRegions(fetchedRegions);
      
      // Se não houver localização selecionada e houver regiões, selecionar a primeira
      if (!selectedLocation && fetchedRegions.length > 0) {
        const firstLocation = `${fetchedRegions[0].city}, ${fetchedRegions[0].state}`;
        setSelectedLocation(firstLocation);
        localStorage.setItem("selectedLocation", firstLocation);
        localStorage.setItem("selectedRegionId", fetchedRegions[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar localizações:", error);
      toast.error("Erro ao carregar localizações");
    } finally {
      setLoading(false);
    }
  };

  // Agrupar regiões por estado
  const statesWithCities = useMemo(() => {
    const stateMap = new Map<string, StateGroup>();
    
    regions.forEach((region) => {
      const key = region.state;
      if (!stateMap.has(key)) {
        stateMap.set(key, {
          state: region.state,
          stateName: region.stateName || region.state,
          cities: [],
        });
      }
      stateMap.get(key)!.cities.push(region);
    });
    
    // Converter para array e ordenar por nome do estado
    return Array.from(stateMap.values()).sort((a, b) => 
      a.stateName.localeCompare(b.stateName)
    );
  }, [regions]);

  // Filtrar estados baseado na busca
  const filteredStates = useMemo(() => {
    if (!selectedState && searchText) {
      const searchLower = searchText.toLowerCase();
      return statesWithCities.filter((stateGroup) =>
        stateGroup.stateName.toLowerCase().includes(searchLower) ||
        stateGroup.state.toLowerCase().includes(searchLower) ||
        stateGroup.cities.some((city) =>
          city.city.toLowerCase().includes(searchLower)
        )
      );
    }
    return statesWithCities;
  }, [statesWithCities, searchText, selectedState]);

  // Filtrar cidades do estado selecionado
  const filteredCities = useMemo(() => {
    if (!selectedState) return [];
    
    const stateGroup = statesWithCities.find((sg) => sg.state === selectedState);
    if (!stateGroup) return [];
    
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return stateGroup.cities.filter((city) =>
        city.city.toLowerCase().includes(searchLower) ||
        city.name.toLowerCase().includes(searchLower)
      );
    }
    
    return stateGroup.cities.sort((a, b) => a.city.localeCompare(b.city));
  }, [selectedState, statesWithCities, searchText]);

  const formatLocation = (region: Region): string => {
    return `${region.city}, ${region.state}`;
  };

  const handleSelectState = (state: string) => {
    setSelectedState(state);
    setSearchText(""); // Limpar busca ao selecionar estado
  };

  const handleSelectCity = (region: Region) => {
    const locationString = formatLocation(region);
    setSelectedLocation(locationString);
    localStorage.setItem("selectedLocation", locationString);
    localStorage.setItem("selectedRegionId", region.id);
    setShowPicker(false);
    setSearchText("");
    setSelectedState(null);
  };

  const handleBackToStates = () => {
    setSelectedState(null);
    setSearchText("");
  };

  return (
    <>
      <button
        onClick={() => setShowPicker(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-primary-foreground/15 
                   hover:bg-primary-foreground/20 transition-all duration-200 
                   active:scale-95 animate-fade-in"
        style={{ animationDelay: "50ms" }}
      >
        <MapPin className="h-3.5 w-3.5 text-primary-foreground/90" />
        <span className="text-xs font-semibold text-primary-foreground line-clamp-1 max-w-[120px]">
          {selectedLocation || "Carregando..."}
        </span>
        <ChevronDown className="h-3 w-3 text-primary-foreground/80" />
      </button>

      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escolher localidade</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={selectedState ? "Buscar cidade..." : "Buscar estado..."}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* States or Cities List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : selectedState ? (
                // Mostrar cidades do estado selecionado
                <>
                  {/* Botão voltar */}
                  <button
                    onClick={handleBackToStates}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-accent transition-colors rounded-lg mb-1"
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
                    <span className="text-sm font-medium text-card-foreground">
                      Voltar para estados
                    </span>
                  </button>
                  
                  {filteredCities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhuma cidade encontrada</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {filteredCities.map((region) => {
                        const locationString = formatLocation(region);
                        return (
                          <button
                            key={region.id}
                            onClick={() => handleSelectCity(region)}
                            className={`w-full flex items-center justify-between px-4 py-3 
                                      hover:bg-accent transition-colors rounded-lg
                                      ${
                                        selectedLocation === locationString
                                          ? "bg-accent"
                                          : ""
                                      }`}
                          >
                            <div className="text-left">
                              <p className="text-sm font-medium text-card-foreground">
                                {region.city}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {region.storesCount > 0
                                    ? `${region.storesCount} loja${region.storesCount > 1 ? "s" : ""} disponível${region.storesCount > 1 ? "eis" : ""}`
                                    : "Lojas disponíveis"}
                              </p>
                            </div>
                            {selectedLocation === locationString && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : filteredStates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum estado encontrado</p>
                </div>
              ) : (
                // Mostrar lista de estados
                <div className="space-y-0">
                  {filteredStates.map((stateGroup) => (
                    <button
                      key={stateGroup.state}
                      onClick={() => handleSelectState(stateGroup.state)}
                      className="w-full flex items-center justify-between px-4 py-3 
                                hover:bg-accent transition-colors rounded-lg"
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-card-foreground">
                          {stateGroup.stateName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stateGroup.cities.length} cidade{stateGroup.cities.length > 1 ? "s" : ""} disponível{stateGroup.cities.length > 1 ? "eis" : ""}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationSelector;
