import { useState } from "react";
import { MapPin, ChevronDown, Search, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const LOCATIONS = [
  "São Paulo, SP",
  "Rio de Janeiro, RJ",
  "Belo Horizonte, MG",
  "Brasília, DF",
  "Salvador, BA",
  "Curitiba, PR",
  "Porto Alegre, RS",
  "Recife, PE",
  "Fortaleza, CE",
  "Manaus, AM",
];

const LocationSelector = () => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("selectedLocation") || "São Paulo, SP";
  });
  const [showPicker, setShowPicker] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredLocations = LOCATIONS.filter((location) =>
    location.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    localStorage.setItem("selectedLocation", location);
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
        <span className="text-xs font-medium text-primary-foreground/90">
          Entregar em
        </span>
        <span className="text-xs font-semibold text-primary-foreground line-clamp-1 max-w-[120px]">
          {selectedLocation}
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
              {filteredLocations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma cidade encontrada</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredLocations.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleSelectLocation(location)}
                      className={`w-full flex items-center justify-between px-4 py-3 
                                hover:bg-accent transition-colors rounded-lg
                                ${
                                  selectedLocation === location
                                    ? "bg-accent"
                                    : ""
                                }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-card-foreground">
                          {location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Entregas disponíveis
                        </p>
                      </div>
                      {selectedLocation === location && (
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
