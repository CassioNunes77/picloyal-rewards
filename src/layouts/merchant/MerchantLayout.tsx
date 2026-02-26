import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import MerchantMobileLayout from "./MerchantMobileLayout";
import MerchantDesktopLayout from "./MerchantDesktopLayout";

export default function MerchantLayout() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/merchant/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return isMobile ? <MerchantMobileLayout /> : <MerchantDesktopLayout />;
}
