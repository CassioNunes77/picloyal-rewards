import { useState, useEffect, useMemo } from "react";
import { MapPin, ChevronDown, Search, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getCitiesFromStores, type CityOption } from "@/services/merchantsService";
import { toast } from "sonner";

type LocationSelectorVariant = "hero" | "header";

interface LocationSelectorProps {
  variant?: LocationSelectorVariant;
}

const LocationSelector = ({ variant = "hero" }: LocationSelectorProps) => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("selectedLocation") || "";
  });
  const [showPicker, setShowPicker] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showPicker) {
      loadLocations();
    }
  }, [showPicker]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const fetchedCities = await getCitiesFromStores();
      setCities(fetchedCities);

      // Se não houver localização selecionada e houver cidades, selecionar a primeira
      if (!selectedLocation && fetchedCities.length > 0) {
        const firstLocation = fetchedCities[0].displayName;
        setSelectedLocation(firstLocation);
        localStorage.setItem("selectedLocation", firstLocation);
        window.dispatchEvent(new CustomEvent("locationChanged", { detail: firstLocation }));
      }
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
      toast.error("Erro ao carregar cidades");
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = useMemo(() => {
    if (!searchText.trim()) return cities;
    const searchLower = searchText.toLowerCase();
    return cities.filter(
      (c) =>
        c.city.toLowerCase().includes(searchLower) ||
        c.state.toLowerCase().includes(searchLower) ||
        c.displayName.toLowerCase().includes(searchLower)
    );
  }, [cities, searchText]);

  const handleSelectCity = (cityOption: CityOption) => {
    setSelectedLocation(cityOption.displayName);
    localStorage.setItem("selectedLocation", cityOption.displayName);
    window.dispatchEvent(new CustomEvent("locationChanged", { detail: cityOption.displayName }));
    setShowPicker(false);
    setSearchText("");
  };

  return (
    <>
      <button
        onClick={() => setShowPicker(true)}
        className={
          variant === "header"
            ? "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-card-foreground"
            : "flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-primary-foreground/15 hover:bg-primary-foreground/20 transition-all duration-200 active:scale-95 animate-fade-in"
        }
        style={variant === "hero" ? { animationDelay: "50ms" } : undefined}
      >
        <MapPin className={variant === "header" ? "h-4 w-4 shrink-0" : "h-3.5 w-3.5 text-primary-foreground/90"} />
        <span
          className={
            variant === "header"
              ? "text-sm font-medium line-clamp-1 max-w-[140px]"
              : "text-xs font-semibold text-primary-foreground line-clamp-1 max-w-[120px]"
          }
        >
          {selectedLocation || "Carregando..."}
        </span>
        <ChevronDown className={variant === "header" ? "h-4 w-4 shrink-0" : "h-3 w-3 text-primary-foreground/80"} />
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

            {/* Lista de cidades cadastradas no Firebase (com lojas) */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredCities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma cidade com lojas cadastradas</p>
                  <p className="text-sm mt-1">As cidades aparecem quando há lojas cadastradas</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredCities.map((cityOption) => (
                    <button
                      key={cityOption.displayName}
                      onClick={() => handleSelectCity(cityOption)}
                      className={`w-full flex items-center justify-between px-4 py-3 
                                hover:bg-accent transition-colors rounded-lg
                                ${selectedLocation === cityOption.displayName ? "bg-accent" : ""}`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-card-foreground">
                          {cityOption.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cityOption.storesCount} loja{cityOption.storesCount > 1 ? "s" : ""} disponível{cityOption.storesCount > 1 ? "eis" : ""}
                        </p>
                      </div>
                      {selectedLocation === cityOption.displayName && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
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
