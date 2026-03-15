import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Store, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStoresByCity } from "@/services/merchantsService";

export interface NatalCoupon {
  id: string;
  storeId: string;
  storeName: string;
  storePhoto: string | null;
  title: string;
  validUntil: string;
  couponNumber: string;
}

const VALID_UNTIL = "31/12/2025";

function randomCouponNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function NatalPremiadoPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [cupons, setCupons] = useState<NatalCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(() => localStorage.getItem("selectedLocation") || "");

  useEffect(() => {
    setSelectedLocation(localStorage.getItem("selectedLocation") || "");
  }, []);

  useEffect(() => {
    const handler = () => setSelectedLocation(localStorage.getItem("selectedLocation") || "");
    window.addEventListener("locationChanged", handler);
    return () => window.removeEventListener("locationChanged", handler);
  }, []);

  useEffect(() => {
    if (!selectedLocation) {
      setCupons([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getStoresByCity(selectedLocation)
      .then((stores) => {
        const list: NatalCoupon[] = stores.map((store, index) => ({
          id: `natal-${store.id}-${index}`,
          storeId: store.id!,
          storeName: store.name,
          storePhoto: store.photoURL ?? null,
          title: "Desconto especial Natal Premiado",
          validUntil: VALID_UNTIL,
          couponNumber: randomCouponNumber(),
        }));

        const corevoStore = stores.find((s) => s.name?.toLowerCase().includes("corevo"));
        const corevoData = corevoStore
          ? {
              storeId: corevoStore.id!,
              storeName: corevoStore.name,
              storePhoto: corevoStore.photoURL ?? null,
            }
          : {
              storeId: "corevo-exemplo",
              storeName: "Corevo",
              storePhoto: null as string | null,
            };

        const cuponsCorevoExemplo: NatalCoupon[] = [
          {
            id: "natal-corevo-exemplo-1",
            ...corevoData,
            title: "Desconto especial Natal Premiado",
            validUntil: VALID_UNTIL,
            couponNumber: randomCouponNumber(),
          },
          {
            id: "natal-corevo-exemplo-2",
            ...corevoData,
            title: "Desconto especial Natal Premiado",
            validUntil: VALID_UNTIL,
            couponNumber: randomCouponNumber(),
          },
        ];

        setCupons([...list, ...cuponsCorevoExemplo]);
      })
      .catch(() => setCupons([]))
      .finally(() => setLoading(false));
  }, [selectedLocation]);

  const cuponsCount = cupons.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {isMobile ? (
        <div className="gradient-hero pb-6 pt-10 px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-all active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Natal Premiado</h1>
              <p className="text-white/90 text-xs mt-0.5">
                {loading ? "Carregando..." : `Você possui ${cuponsCount} cupon${cuponsCount !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Natal Premiado</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Carregando..." : `${cuponsCount} cupon${cuponsCount !== 1 ? "s" : ""}. Todas as lojas participam.`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`${isMobile ? "px-5 -mt-2 pb-8" : "max-w-3xl mx-auto px-6 py-4"}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
            <p className="text-xs text-muted-foreground">Carregando cupons...</p>
          </div>
        ) : !selectedLocation ? (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-card-foreground mb-1">Selecione uma cidade</p>
            <p className="text-xs text-muted-foreground">
              Escolha sua cidade na página inicial para ver os cupons Natal Premiado das lojas parceiras.
            </p>
          </div>
        ) : cupons.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-card-foreground mb-1">Nenhum cupom nesta cidade</p>
            <p className="text-xs text-muted-foreground">
              Não há lojas parceiras cadastradas em {selectedLocation} no momento.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {cupons.map((cupom) => (
                <div
                  key={cupom.id}
                  className="bg-card rounded-lg border border-border overflow-hidden shadow-sm"
                >
                  <div className="flex items-center gap-3 p-2">
                    {/* Foto da loja - centralizada na altura do card */}
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                      {cupom.storePhoto ? (
                        <img src={cupom.storePhoto} alt={cupom.storeName} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    {/* Conteúdo do cupom */}
                    <div className="flex-1 min-w-0 py-1 pr-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-xs font-semibold text-card-foreground">{cupom.storeName}</h2>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{cupom.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0">
                            <span>Data do cupom: {cupom.validUntil}</span>
                            <span className="text-muted-foreground/80">•</span>
                            <span>Nº do cupom: {cupom.couponNumber}</span>
                          </p>
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Gift className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] text-muted-foreground mt-4">
              Apresente o cupom na loja no momento da compra. Todas as lojas parceiras participam do Natal Premiado.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
