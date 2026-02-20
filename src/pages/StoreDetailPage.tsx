import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  MapPin, 
  Building2,
  Phone, 
  Clock, 
  Star,
  Share2, 
  Store,
  Tag,
  Loader2
} from "lucide-react";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import type { OfferDetailData } from "./OfferDetailPage";
import { getStoreById } from "@/services/merchantsService";
import { getStoreOffers, type OfferData } from "@/services/offersService";

interface StoreDisplay {
  id: string;
  name: string;
  address: string;
  city: string;
  hours: string;
  phone: string;
  isOpen: boolean;
  offersCount: number;
  image?: string;
}

const categoryToIcon: Record<string, "coffee" | "pizza" | "gift" | "percent"> = {
  bebidas: "coffee",
  comida: "pizza",
  brinde: "gift",
  geral: "percent",
};

const StoreDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const params = useParams<{ id: string }>();
  // Garantir que o id venha da URL (params ou fallback do pathname)
  const id = params.id ?? (location.pathname.match(/^\/store\/([^/]+)/)?.[1] ?? null);
  const [selectedTab, setSelectedTab] = useState<"info" | "offers" | "reviews">("offers");
  const [store, setStore] = useState<StoreDisplay | null>(null);
  const [storeOffers, setStoreOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([getStoreById(id), getStoreOffers(id)])
      .then(([storeData, offers]) => {
        if (cancelled) return;
        if (storeData) {
          const now = new Date();
          const availableOffers = offers.filter((o) => {
            if (!o.active) return false;
            if (o.validFrom && o.validFrom > now) return false;
            if (o.validUntil < now) return false;
            return true;
          });
          setStore({
            id: storeData.id!,
            name: storeData.name,
            address: storeData.address,
            city: storeData.city ?? "",
            hours: storeData.hours ?? "",
            phone: storeData.phone,
            isOpen: storeData.active,
            offersCount: availableOffers.length,
            image: storeData.photoURL,
          });
          setStoreOffers(availableOffers);
        } else {
          setStore(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Erro ao carregar loja:", err);
          setStore(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const reviews = [
    { name: "João Silva", comment: "Ótimo atendimento e produtos de qualidade!", rating: 5, date: "Há 2 dias" },
    { name: "Maria Santos", comment: "Adorei! Voltarei com certeza.", rating: 5, date: "Há 5 dias" },
    { name: "Pedro Costa", comment: "Bom, mas poderia melhorar o tempo de espera.", rating: 4, date: "Há 1 semana" },
  ];

  const handlePhoneClick = () => {
    if (store) window.location.href = `tel:${store.phone.replace(/[^0-9]/g, "")}`;
  };

  const handleShare = () => {
    if (!store) return;
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

  const formatValidUntil = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <Store className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-card-foreground font-medium mb-2">Loja não encontrada</p>
        <button onClick={() => navigate("/stores")} className="text-primary font-medium hover:underline">
          Voltar para lojas
        </button>
      </div>
    );
  }

  const tabsAndContent = (
    <>
      <div className="mb-6">
        <div className="flex border-b border-border text-sm">
          <button
            onClick={() => setSelectedTab("offers")}
            className={`flex-1 py-3 text-center font-medium transition-colors relative ${
              selectedTab === "offers" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Ofertas
            {store.offersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {store.offersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab("info")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              selectedTab === "info" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Informações
          </button>
          <button
            onClick={() => setSelectedTab("reviews")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              selectedTab === "reviews" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Avaliações
          </button>
        </div>
      </div>
      {selectedTab === "info" && (
        <div className="space-y-3">
          <InfoCard icon={MapPin} title="Endereço" content={store.address} color="text-primary" />
          {store.city && <InfoCard icon={Building2} title="Cidade" content={store.city} color="text-primary" />}
          <InfoCard icon={Phone} title="Telefone" content={store.phone} color="text-secondary" onClick={handlePhoneClick} />
          <InfoCard icon={Clock} title="Horário de Funcionamento" content={store.hours || (store.isOpen ? "Aberto" : "Fechado")} color={store.isOpen ? "text-green-500" : "text-red-500"} />
        </div>
      )}
      {selectedTab === "offers" && (
        <div className="space-y-4">
          {storeOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Tag className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma oferta disponível</p>
            </div>
          ) : (
            storeOffers.map((offer) => (
              <div key={offer.id}>
                <button
                  onClick={() => {
                    navigate("/offer", {
                      state: {
                        offer: {
                          id: offer.id!,
                          title: offer.title,
                          description: offer.description,
                          discount: offer.discount ?? "—",
                          validUntil: formatValidUntil(offer.validUntil),
                          storeId: store.id,
                          storeName: store.name,
                          storeAddress: store.address,
                          merchantId: offer.merchantId,
                          icon: categoryToIcon[offer.category] ?? "percent",
                          category: offer.category,
                          pointsRequired: offer.pointsRequired,
                        } as OfferDetailData,
                        storeName: store.name,
                      },
                    });
                  }}
                  className="w-full text-left bg-card rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg active:scale-[0.98] border-2 border-transparent hover:border-primary/20"
                >
                  <div className="flex gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl shrink-0 ${
                      offer.category === "bebidas" ? "gradient-primary" :
                      offer.category === "comida" ? "bg-orange-500" :
                      offer.category === "brinde" ? "gradient-secondary" : "bg-blue-500"
                    }`}>
                      <span className="text-xl">
                        {offer.category === "bebidas" ? "☕" : offer.category === "comida" ? "🍕" : offer.category === "brinde" ? "🎁" : "🏷️"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-card-foreground text-sm truncate mb-0.5">{offer.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{offer.description}</p>
                        </div>
                        <div className="gradient-secondary text-secondary-foreground font-bold text-sm px-2.5 py-1.5 rounded-lg shrink-0">
                          {offer.discount ?? "—"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>Válido até {formatValidUntil(offer.validUntil)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
                  </div>
                </button>
              </div>
            ))
          )}
        </div>
      )}
      {selectedTab === "reviews" && (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={index} className="bg-card rounded-2xl p-4 shadow-sm">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-lg font-semibold text-primary-foreground">{review.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground mb-1">{review.name}</h4>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{review.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (!isMobile) {
    return (
      <div className="min-h-full bg-background">
        <div className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-card-foreground line-clamp-1">{store.name}</h1>
            <button onClick={handleShare} className="p-2 rounded-full hover:bg-muted text-card-foreground" aria-label="Compartilhar">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex gap-4 items-start mb-6">
          <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shrink-0 overflow-hidden">
            {store.image ? (
              <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="h-12 w-12 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {store.isOpen ? (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-card-foreground">Aberto</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/20">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-card-foreground">Fechado</span>
                </div>
              )}
            </div>
            {store.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{store.city}</span>
              </div>
            )}
            {store.hours && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="line-clamp-2">{store.hours}</span>
              </div>
            )}
          </div>
        </div>
        {tabsAndContent}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/stores" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-all duration-200 active:scale-90 active:bg-primary-foreground/30">
              <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
            </Link>
            <h1 className="text-xl font-bold text-primary-foreground flex-1 line-clamp-1">{store.name}</h1>
            <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-all duration-200 active:scale-90 active:bg-primary-foreground/30">
              <Share2 className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shrink-0 overflow-hidden">
              {store.image ? (
                <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="h-12 w-12 text-primary-foreground" />
              )}
            </div>
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
              {store.city && (
                <div className="flex items-center gap-1 text-sm text-primary-foreground/90 mb-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{store.city}</span>
                </div>
              )}
              {store.hours && (
                <div className="flex items-center gap-1 text-sm text-primary-foreground/90">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="line-clamp-2">{store.hours}</span>
                </div>
              )}
            </div>
          </div>
        </header>
      </div>
      <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
        {tabsAndContent}
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
