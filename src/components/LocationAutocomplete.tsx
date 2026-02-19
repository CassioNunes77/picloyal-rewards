import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LocationOption {
  id: string;
  name: string;
  sigla?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, code?: string) => void;
  options: LocationOption[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function LocationAutocomplete({
  value,
  onChange,
  options,
  placeholder = "Digite para buscar...",
  loading = false,
  disabled = false,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const filteredOptions = options.filter(
    (opt) =>
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
