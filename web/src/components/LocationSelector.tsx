import { useState, useEffect } from "react";
import { MapPin, ChevronDown, Search, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getActiveRegions, type Region } from "@/services/regionsService";
import { toast } from "sonner";

const LocationSelector = () => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("selectedLocation") || "";
  });
  const [showPicker, setShowPicker] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [locations, setLocations] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showPicker) {
      loadLocations();
    }
  }, [showPicker]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const regions = await getActiveRegions();
      setLocations(regions);
      
      // Se não houver localização selecionada e houver regiões, selecionar a primeira
      if (!selectedLocation && regions.length > 0) {
        const firstLocation = `${regions[0].city}, ${regions[0].state}`;
        setSelectedLocation(firstLocation);
        localStorage.setItem("selectedLocation", firstLocation);
      }
    } catch (error) {
      console.error("Erro ao carregar localizações:", error);
      toast.error("Erro ao carregar localizações");
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter((region) => {
    const searchLower = searchText.toLowerCase();
    return (
      region.city.toLowerCase().includes(searchLower) ||
      region.state.toLowerCase().includes(searchLower) ||
      region.name.toLowerCase().includes(searchLower)
    );
  });

  const formatLocation = (region: Region): string => {
    return `${region.city}, ${region.state}`;
  };

  const handleSelectLocation = (region: Region) => {
    const locationString = formatLocation(region);
    setSelectedLocation(locationString);
    localStorage.setItem("selectedLocation", locationString);
    localStorage.setItem("selectedRegionId", region.id);
    setShowPicker(false);
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
                placeholder="Buscar cidade..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Locations List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLocations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma localidade encontrada</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredLocations.map((region) => {
                    const locationString = formatLocation(region);
                    return (
                      <button
                        key={region.id}
                        onClick={() => handleSelectLocation(region)}
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
                            {locationString}
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationSelector;
