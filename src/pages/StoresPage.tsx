import { useState } from "react";
import { MapPin, Star, Clock, Phone, ChevronRight, Search, Filter, Store } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

interface Store {
  id: number;
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
  const [activeTab, setActiveTab] = useState("stores");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const stores: Store[] = [
    {
      id: 1,
      name: "Café Central",
      address: "Rua das Flores, 123 - Centro",
      distance: "0.8 km",
      rating: 4.8,
      openUntil: "22:00",
      phone: "(11) 3456-7890",
      isOpen: true,
      offers: 5,
    },
    {
      id: 2,
      name: "Restaurante Sabor",
      address: "Av. Principal, 456 - Jardim",
      distance: "1.2 km",
      rating: 4.6,
      openUntil: "23:30",
      phone: "(11) 3456-7891",
      isOpen: true,
      offers: 3,
    },
    {
      id: 3,
      name: "Padaria Doce Vida",
      address: "Rua Comercial, 789 - Vila Nova",
      distance: "2.5 km",
      rating: 4.9,
      openUntil: "20:00",
      phone: "(11) 3456-7892",
      isOpen: true,
      offers: 8,
    },
    {
      id: 4,
      name: "Supermercado Bom Preço",
      address: "Av. Shopping, 321 - Centro",
      distance: "3.1 km",
      rating: 4.5,
      openUntil: "23:00",
      phone: "(11) 3456-7893",
      isOpen: false,
      offers: 12,
    },
    {
      id: 5,
      name: "Farmácia Saúde",
      address: "Rua da Saúde, 654 - Centro",
      distance: "1.8 km",
      rating: 4.7,
      openUntil: "24:00",
      phone: "(11) 3456-7894",
      isOpen: true,
      offers: 2,
    },
  ];

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStoreClick = (store: Store) => {
    toast.info(`Abrindo ${store.name}...`);
    // Aqui você pode navegar para detalhes da loja
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 
                         transition-all duration-200 active:scale-90 active:bg-primary-foreground/30"
            >
              <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
            </Link>
            <h1 className="text-2xl font-bold text-primary-foreground flex-1">Lojas Parceiras</h1>
          </div>

          {/* Search Bar */}
          <div className="relative animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar lojas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-primary-foreground/20 text-primary-foreground 
                       placeholder:text-primary-foreground/60 border border-primary-foreground/30
                       focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary-foreground/20 
                       transition-all duration-200 active:scale-90"
            >
              <Filter className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
        </header>
      </div>

      {/* Content */}
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        {filteredStores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <p className="text-muted-foreground mb-2">Nenhuma loja encontrada</p>
            <p className="text-sm text-muted-foreground">Tente buscar com outros termos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStores.map((store, index) => (
              <div
                key={store.id}
                className="animate-fade-in"
                style={{ animationDelay: `${150 + index * 50}ms` }}
              >
                <button
                  onClick={() => handleStoreClick(store)}
                  className="w-full text-left bg-card rounded-2xl p-4 shadow-md 
                           transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                >
                  <div className="flex gap-4">
                    {/* Store Image Placeholder */}
                    <div className="w-20 h-20 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                      <Store className="h-10 w-10 text-primary-foreground" />
                    </div>

                    {/* Store Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-card-foreground text-lg mb-1">
                            {store.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{store.address}</span>
                          </div>
                        </div>
                        {store.isOpen ? (
                          <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                            Aberto
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
                            Fechado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{store.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{store.distance}</span>
                        </div>
                        {store.isOpen && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Até {store.openUntil}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{store.phone}</span>
                        </div>
                        {store.offers > 0 && (
                          <span className="px-2 py-1 rounded-lg bg-secondary/10 text-secondary text-xs font-medium">
                            {store.offers} ofertas
                          </span>
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

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default StoresPage;
