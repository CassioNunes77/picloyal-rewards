import { useState } from "react";
import { Tag, Clock, MapPin, Percent, Gift, Coffee, Pizza, Sparkles, ChevronRight, Search } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: string;
  storeName: string;
  storeAddress: string;
  validUntil: string;
  icon: "percent" | "gift" | "coffee" | "pizza";
  category: string;
  pointsRequired?: number;
  isNew?: boolean;
}

const OffersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("offers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const offers: Offer[] = [
    {
      id: 1,
      title: "20% OFF em Bebidas",
      description: "Desconto em todas as bebidas do cardápio",
      discount: "20%",
      storeName: "Café Central",
      storeAddress: "Rua das Flores, 123",
      validUntil: "31/12/2024",
      icon: "coffee",
      category: "bebidas",
      isNew: true,
    },
    {
      id: 2,
      title: "Compre 2, Leve 3",
      description: "Na compra de 2 pizzas, ganhe 1 grátis",
      discount: "33%",
      storeName: "Restaurante Sabor",
      storeAddress: "Av. Principal, 456",
      validUntil: "25/12/2024",
      icon: "pizza",
      category: "comida",
    },
    {
      id: 3,
      title: "10% OFF em Tudo",
      description: "Desconto em qualquer produto da loja",
      discount: "10%",
      storeName: "Supermercado Bom Preço",
      storeAddress: "Av. Shopping, 321",
      validUntil: "30/12/2024",
      icon: "percent",
      category: "geral",
      pointsRequired: 50,
    },
    {
      id: 4,
      title: "Brinde Especial",
      description: "Ganhe um brinde na compra acima de R$ 50",
      discount: "Grátis",
      storeName: "Padaria Doce Vida",
      storeAddress: "Rua Comercial, 789",
      validUntil: "28/12/2024",
      icon: "gift",
      category: "brinde",
      isNew: true,
    },
    {
      id: 5,
      title: "15% OFF em Medicamentos",
      description: "Desconto em toda a farmácia",
      discount: "15%",
      storeName: "Farmácia Saúde",
      storeAddress: "Rua da Saúde, 654",
      validUntil: "29/12/2024",
      icon: "percent",
      category: "saude",
    },
    {
      id: 6,
      title: "Café Expresso Grátis",
      description: "Um café expresso grátis com qualquer compra",
      discount: "100%",
      storeName: "Café Central",
      storeAddress: "Rua das Flores, 123",
      validUntil: "27/12/2024",
      icon: "coffee",
      category: "bebidas",
    },
  ];

  const categories = [
    { id: "all", label: "Todas", icon: Tag },
    { id: "bebidas", label: "Bebidas", icon: Coffee },
    { id: "comida", label: "Comida", icon: Pizza },
    { id: "brinde", label: "Brindes", icon: Gift },
    { id: "geral", label: "Geral", icon: Percent },
  ];

  const iconMap = {
    percent: Percent,
    gift: Gift,
    coffee: Coffee,
    pizza: Pizza,
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || offer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOfferClick = (offer: Offer) => {
    toast.success(`🎉 Oferta "${offer.title}" ativada!`, {
      description: `Apresente este cupom em ${offer.storeName}`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-secondary">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-foreground/20 
                         transition-all duration-200 active:scale-90 active:bg-secondary-foreground/30"
            >
              <ChevronRight className="h-5 w-5 text-secondary-foreground rotate-180" />
            </Link>
            <h1 className="text-2xl font-bold text-secondary-foreground flex-1 flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Ofertas Especiais
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-foreground/60" />
            <input
              type="text"
              placeholder="Buscar ofertas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary-foreground/20 text-secondary-foreground 
                       placeholder:text-secondary-foreground/60 border border-secondary-foreground/30
                       focus:outline-none focus:ring-2 focus:ring-secondary-foreground/50"
            />
          </div>
        </header>
      </div>

      {/* Content */}
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        {/* Categories */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2 animate-fade-in" style={{ animationDelay: '150ms' }}>
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap
                    transition-all duration-200
                    ${isActive
                      ? 'gradient-secondary text-secondary-foreground shadow-md'
                      : 'bg-card text-card-foreground'
                    }
                    active:scale-95
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Offers List */}
        {filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma oferta encontrada</p>
            <p className="text-sm text-muted-foreground">Tente buscar com outros termos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map((offer, index) => {
              const Icon = iconMap[offer.icon];
              return (
                <div
                  key={offer.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <button
                    onClick={() => handleOfferClick(offer)}
                    className="w-full text-left bg-card rounded-2xl p-5 shadow-md 
                             transition-all duration-300 hover:shadow-lg active:scale-[0.98]
                             border-2 border-transparent hover:border-primary/20"
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`
                        flex h-16 w-16 items-center justify-center rounded-xl shrink-0
                        transition-all duration-300
                        ${offer.icon === 'coffee' ? 'gradient-primary' :
                          offer.icon === 'pizza' ? 'bg-orange-500' :
                          offer.icon === 'gift' ? 'gradient-secondary' :
                          'bg-blue-500'
                        }
                      `}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-card-foreground text-lg">
                                {offer.title}
                              </h3>
                              {offer.isNew && (
                                <span className="px-2 py-0.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold">
                                  NOVO
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {offer.description}
                            </p>
                          </div>
                          <div className={`
                            flex items-center justify-center rounded-xl px-3 py-2
                            gradient-secondary text-secondary-foreground
                            font-bold text-lg shrink-0 ml-2
                          `}>
                            {offer.discount}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{offer.storeName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Válido até {offer.validUntil}</span>
                          </div>
                        </div>

                        {offer.pointsRequired && (
                          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-accent w-fit">
                            <Sparkles className="h-3 w-3 text-accent-foreground" />
                            <span className="text-xs font-medium text-accent-foreground">
                              {offer.pointsRequired} pontos necessários
                            </span>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2 self-center" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default OffersPage;
