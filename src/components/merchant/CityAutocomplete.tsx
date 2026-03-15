import { useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllCities } from "@/services/regionsService";
import { toast } from "sonner";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function CityAutocomplete({
  value,
  onChange,
  label = "Cidade",
  required = false,
  disabled = false,
  placeholder = "Digite o nome da cidade",
}: CityAutocompleteProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carregar cidades do Firebase
  useEffect(() => {
    const loadCities = async () => {
      setLoading(true);
      try {
        const allCities = await getAllCities();
        setCities(allCities);
        setFilteredCities(allCities);
      } catch (error: any) {
        console.error("Erro ao carregar cidades:", error);
        toast.error("Erro ao carregar lista de cidades");
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  // Filtrar cidades conforme o usuário digita
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.trim() === "") {
      setFilteredCities(cities);
      setShowSuggestions(false);
      return;
    }

    // Filtrar cidades que contenham o texto digitado (case-insensitive)
    const filtered = cities.filter((city) =>
      city.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredCities(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // Selecionar cidade da lista
  const handleSelectCity = (city: string) => {
    onChange(city);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // Limpar campo
  const handleClear = () => {
    onChange("");
    setFilteredCities(cities);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Verificar se o valor atual é uma cidade válida
  const isValidCity = value.trim() !== "" && cities.includes(value);

  return (
    <div className="space-y-1" ref={containerRef}>
      <Label htmlFor="city" className="text-card-foreground flex items-center gap-1.5 text-xs">
        <MapPin className="h-3.5 w-3.5" />
        {label} {required && "*"}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="city"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (filteredCities.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className={`h-9 rounded-lg border-border bg-background text-sm pr-8 ${
            !isValidCity && value.trim() !== "" && required
              ? "border-red-500 focus:border-red-500"
              : ""
          }`}
          required={required}
          disabled={disabled || loading}
          autoComplete="off"
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {showSuggestions && filteredCities.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredCities.map((city, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectCity(city)}
                className="w-full text-left px-3 py-2 hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 text-sm"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-card-foreground">{city}</span>
              </button>
            ))}
          </div>
        )}
        {showSuggestions && filteredCities.length === 0 && value.trim() !== "" && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-3">
            <p className="text-xs text-muted-foreground text-center">
              Nenhuma cidade encontrada
            </p>
          </div>
        )}
      </div>
      {!isValidCity && value.trim() !== "" && required && (
        <p className="text-xs text-red-500">
          Selecione uma cidade da lista
        </p>
      )}
    </div>
  );
}
