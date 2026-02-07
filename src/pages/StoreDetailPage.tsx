import { useState } from "react";
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Share2, 
  Store,
  Tag,
  MessageSquare
} from "lucide-react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { toast } from "sonner";

interface Store {
  id: number;
  name: string;
  address: string;
  distance: string;
  rating: number;
  openUntil: string;
  phone: string;
  isOpen: boolean;
  offers: number;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  icon: string;
  category: string;
}

const StoreDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState<"info" | "offers" | "reviews">("info");

  // Mock data - em produção, buscar pelo ID
  const store: Store = {
    id: parseInt(id || "1"),
    name: "Café Central",
    address: "Rua das Flores, 123 - Centro",
    distance: "0.8 km",
    rating: 4.8,
    openUntil: "22:00",
    phone: "(11) 3456-7890",
    isOpen: true,
    offers: 5,
  };

  const storeOffers: Offer[] = [
    {
      id: 1,
      title: "20% OFF em Bebidas",
      description: "Desconto em todas as bebidas do cardápio",
      discount: "20%",
      validUntil: "31/12/2024",
      icon: "coffee",
      category: "bebidas",
    },
    {
      id: 2,
      title: "Café Expresso Grátis",
      description: "Um café expresso grátis com qualquer compra",
      discount: "100%",
      validUntil: "27/12/2024",
      icon: "coffee",
      category: "bebidas",
    },
  ];

  const reviews = [
    { name: "João Silva", comment: "Ótimo atendimento e produtos de qualidade!", rating: 5, date: "Há 2 dias" },
    { name: "Maria Santos", comment: "Adorei! Voltarei com certeza.", rating: 5, date: "Há 5 dias" },
    { name: "Pedro Costa", comment: "Bom, mas poderia melhorar o tempo de espera.", rating: 4, date: "Há 1 semana" },
  ];

  const handlePhoneClick = () => {
    window.location.href = `tel:${store.phone.replace(/[^0-9]/g, "")}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: store.name,
        text: `Confira ${store.name} - ${store.address}`,
        url: window.location.href,
      });
    } else {
      toast.success("Link copiado para a área de transferência!");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/stores"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 
                         transition-all duration-200 active:scale-90 active:bg-primary-foreground/30"
            >
              <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
            </Link>
            <h1 className="text-2xl font-bold text-primary-foreground flex-1 line-clamp-1">
              {store.name}
            </h1>
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 
                       transition-all duration-200 active:scale-90 active:bg-primary-foreground/30"
            >
              <Share2 className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>

          {/* Store Header Info */}
          <div className="flex gap-4 items-start animate-fade-in" style={{ animationDelay: '100ms' }}>
            {/* Store Image */}
            <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
              <Store className="h-12 w-12 text-primary-foreground" />
            </div>

            {/* Store Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {store.isOpen ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-primary-foreground">Aberto</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/20">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-primary-foreground">Fechado</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 mb-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-base font-semibold text-primary-foreground">
                  {store.rating.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-sm text-primary-foreground/90 mb-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{store.distance}</span>
              </div>

              {store.isOpen && (
                <div className="flex items-center gap-1 text-sm text-primary-foreground/90">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Até {store.openUntil}</span>
                </div>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* Content */}
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        {/* Tabs */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="flex border-b border-border">
            <button
              onClick={() => setSelectedTab("info")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                selectedTab === "info"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Informações
            </button>
            <button
              onClick={() => setSelectedTab("offers")}
              className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                selectedTab === "offers"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Ofertas
              {store.offers > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {store.offers}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedTab("reviews")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                selectedTab === "reviews"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Avaliações
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === "info" && (
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <InfoCard
              icon={MapPin}
              title="Endereço"
              content={store.address}
              color="text-primary"
            />
            <InfoCard
              icon={Phone}
              title="Telefone"
              content={store.phone}
              color="text-secondary"
              onClick={handlePhoneClick}
            />
            <InfoCard
              icon={Clock}
              title="Horário de Funcionamento"
              content={store.isOpen ? `Aberto até ${store.openUntil}` : "Fechado"}
              color={store.isOpen ? "text-green-500" : "text-red-500"}
            />
            <InfoCard
              icon={Star}
              title="Avaliação"
              content={`${store.rating.toFixed(1)} de 5.0`}
              color="text-yellow-500"
            />
          </div>
        )}

        {selectedTab === "offers" && (
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {storeOffers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma oferta disponível</p>
              </div>
            ) : (
              storeOffers.map((offer, index) => (
                <div
                  key={offer.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <button
                    onClick={() => {
                      toast.success(`🎉 Oferta "${offer.title}" ativada!`, {
                        description: `Apresente este cupom em ${store.name}`,
                      });
                    }}
                    className="w-full text-left bg-card rounded-2xl p-5 shadow-md 
                             transition-all duration-300 hover:shadow-lg active:scale-[0.98]
                             border-2 border-transparent hover:border-primary/20"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl shrink-0 gradient-primary">
                        <span className="text-2xl">☕</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-card-foreground text-lg mb-1">
                              {offer.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {offer.description}
                            </p>
                          </div>
                          <div className="gradient-secondary text-secondary-foreground font-bold text-lg px-3 py-2 rounded-xl shrink-0 ml-2">
                            {offer.discount}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Válido até {offer.validUntil}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2 self-center" />
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === "reviews" && (
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {reviews.map((review, index) => (
              <div
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${200 + index * 50}ms` }}
              >
                <div className="bg-card rounded-2xl p-4 shadow-sm">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-lg font-semibold text-primary-foreground">
                        {review.name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-card-foreground mb-1">{review.name}</h4>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{review.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* Bottom Navigation - Hidden on detail page */}
    </div>
  );
};

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  content: string;
  color: string;
  onClick?: () => void;
}

const InfoCard = ({ icon: Icon, title, content, color, onClick }: InfoCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-card rounded-xl p-4 shadow-sm 
               transition-all duration-200 hover:shadow-md active:scale-[0.98]
               ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex gap-3 items-start">
        <div className={`p-2 rounded-lg bg-muted ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-sm text-card-foreground">{content}</p>
        </div>
        {onClick && (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
        )}
      </div>
    </button>
  );
};

export default StoreDetailPage;
