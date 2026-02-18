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

  const searchBar = (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        placeholder="Buscar lojas..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={cn(
          "w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2",
          isMobile
            ? "bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 border-primary-foreground/30 focus:ring-primary-foreground/50"
            : "bg-card text-card-foreground placeholder:text-muted-foreground border-border focus:ring-primary/30"
        )}
      />
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200",
          isMobile ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
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
        <div className="space-y-4">
          {filteredStores.map((store, index) => (
            <div key={store.id}>
              <button
                onClick={() => handleStoreClick(store)}
                className="w-full text-left bg-card rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                    <Store className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-card-foreground text-sm truncate mb-0.5">{store.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{store.address}</span>
                        </div>
                      </div>
                      {store.isOpen ? (
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium whitespace-nowrap">Aberto</span>
                      ) : (
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium whitespace-nowrap">Fechado</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                        <span>{store.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{store.distance}</span>
                      </div>
                      {store.isOpen && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>Até {store.openUntil}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{store.phone}</span>
                      </div>
                      {store.offers > 0 && (
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-medium">{store.offers} ofertas</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
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
      <div className="min-h-full bg-background">
        <div className="pb-4">
          <h1 className="text-xl font-bold text-card-foreground">Lojas Parceiras</h1>
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
            <div className="grid grid-cols-2 gap-4">
              {filteredStores.map((store, index) => (
                <div key={store.id}>
                  <button
                    onClick={() => handleStoreClick(store)}
                    className="w-full text-left bg-card rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                        <Store className="h-10 w-10 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-card-foreground text-sm truncate mb-0.5">{store.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{store.address}</span>
                            </div>
                          </div>
                          {store.isOpen ? (
                            <span className="shrink-0 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium whitespace-nowrap">Aberto</span>
                          ) : (
                            <span className="shrink-0 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium whitespace-nowrap">Fechado</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                            <span>{store.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{store.distance}</span>
                          </div>
                          {store.isOpen && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>Até {store.openUntil}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{store.phone}</span>
                          </div>
                          {store.offers > 0 && (
                            <span className="shrink-0 px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-medium">{store.offers} ofertas</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
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
    <div className="min-h-screen bg-background">
      <div className="gradient-hero">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-all duration-200 active:scale-90 active:bg-primary-foreground/30">
              <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
            </Link>
            <h1 className="text-xl font-bold text-primary-foreground flex-1">Lojas Parceiras</h1>
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
