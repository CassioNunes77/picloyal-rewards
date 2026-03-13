import { useState, useEffect } from "react";
import { MapPin, Star, Clock, Phone, ChevronRight, Search, Filter, Store, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getStoresByCity } from "@/services/merchantsService";

interface StoreItem {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  openUntil: string;
  phone: string;
  image?: string;
  isOpen: boolean;
  offers: number;
}

const StoresPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    setSelectedLocation(localStorage.getItem("selectedLocation") || "");
  }, []);

  useEffect(() => {
    if (!selectedLocation) {
      setStores([]);
      return;
    }
    let cancelled = false;
    setLoadingStores(true);
    getStoresByCity(selectedLocation)
      .then((fbStores) => {
        if (!cancelled) {
          setStores(
            fbStores.map((s) => ({
              id: s.id!,
              name: s.name,
              address: s.address,
              distance: "-",
              rating: 0,
              openUntil: "-",
              phone: s.phone,
              image: s.photoURL ?? undefined,
              isOpen: true,
              offers: 0,
            }))
          );
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Erro ao carregar lojas:", error);
          setStores([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingStores(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedLocation]);

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStoreClick = (store: StoreItem) => {
    navigate(`/store/${store.id}`);
  };

  const handleDismissKeyboard = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("input, textarea")) {
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  const searchBar = (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${isMobile ? "text-white/60 dark:text-black/60" : "text-muted-foreground"}`} />
      <input
        type="text"
        placeholder="Buscar lojas..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={cn(
          "w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2",
          isMobile
            ? "bg-white/20 dark:bg-black/20 text-white dark:text-black placeholder:text-white/60 dark:placeholder:text-black/60 border-white/30 dark:border-black/30 focus:ring-white/50 dark:focus:ring-black/50"
            : "bg-card text-card-foreground placeholder:text-muted-foreground border-border focus:ring-primary/30"
        )}
      />
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200",
          isMobile ? "bg-white/20 dark:bg-black/20 text-white dark:text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        <Filter className="h-5 w-5" />
      </button>
    </div>
  );

  const contentArea = (
    <>
      {loadingStores ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Carregando lojas...</p>
        </div>
      ) : !selectedLocation ? (
        <div className="flex flex-col items-center justify-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-2">Selecione uma cidade</p>
          <p className="text-sm text-muted-foreground text-center">Escolha sua localidade na tela inicial para ver as lojas</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-2">Nenhuma loja encontrada</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Tente buscar com outros termos" : `Não há lojas em ${selectedLocation}`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredStores.map((store, index) => (
            <div key={store.id}>
              <button
                onClick={() => handleStoreClick(store)}
                className="w-full text-left bg-card rounded-xl p-3 shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                    {store.image ? (
                      <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="h-6 w-6 text-muted-foreground" />
                    )}
                    {store.isOpen ? (
                      <span className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded bg-primary text-primary-foreground text-[8px] font-medium">Aberto</span>
                    ) : (
                      <span className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded bg-muted-foreground/80 text-white text-[8px] font-medium">Fechado</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="mb-1">
                      <h3 className="font-medium text-card-foreground text-xs truncate">{store.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{store.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400 shrink-0" />
                          <span className="text-[10px] text-muted-foreground">{store.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-[10px] text-muted-foreground truncate">{store.phone}</span>
                        </div>
                      </div>
                      {store.offers > 0 && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-secondary/10 text-secondary text-[9px] font-medium">{store.offers} ofertas</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="h-6" />
    </>
  );

  if (!isMobile) {
    return (
      <div className="min-h-full bg-background" onClick={handleDismissKeyboard}>
        <div className="pb-4">
          <h1 className="text-xl font-bold text-card-foreground">Lojas</h1>
        </div>
        <div className="mb-4">{searchBar}</div>
        <div className="pt-2">
          {loadingStores ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Carregando lojas...</p>
            </div>
          ) : !selectedLocation ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-2">Selecione uma cidade</p>
              <p className="text-sm text-muted-foreground text-center">Escolha sua localidade na tela inicial para ver as lojas</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-2">Nenhuma loja encontrada</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Tente buscar com outros termos" : `Não há lojas em ${selectedLocation}`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filteredStores.map((store, index) => (
                <div key={store.id}>
                  <button
                    onClick={() => handleStoreClick(store)}
                    className="w-full text-left bg-card rounded-xl p-3 shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                        {store.image ? (
                          <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="h-6 w-6 text-muted-foreground" />
                        )}
                        {store.isOpen ? (
                          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded bg-primary text-primary-foreground text-[8px] font-medium">Aberto</span>
                        ) : (
                          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded bg-muted-foreground/80 text-white text-[8px] font-medium">Fechado</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="mb-1">
                          <h3 className="font-medium text-card-foreground text-xs truncate">{store.name}</h3>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{store.address}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400 shrink-0" />
                              <span className="text-[10px] text-muted-foreground">{store.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-[10px] text-muted-foreground truncate">{store.phone}</span>
                            </div>
                          </div>
                          {store.offers > 0 && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded bg-secondary/10 text-secondary text-[9px] font-medium">{store.offers} ofertas</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="h-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" onClick={handleDismissKeyboard}>
      <div className="gradient-hero">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-all duration-200 active:scale-90 active:bg-primary-foreground/30">
              <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
            </Link>
            <h1 className="text-xl font-bold text-primary-foreground flex-1">Lojas</h1>
          </div>
          <div className="relative">{searchBar}</div>
        </header>
      </div>
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        {contentArea}
      </div>
    </div>
  );
};

export default StoresPage;
