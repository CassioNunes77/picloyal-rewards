import { Outlet } from "react-router-dom";
import MerchantBottomNav from "@/components/merchant/MerchantBottomNav";
import { useLocation } from "react-router-dom";

export default function MerchantMobileLayout() {
  const { pathname } = useLocation();
  
  // Determinar tab ativo baseado na rota atual
  const getActiveTab = () => {
    if (pathname.includes("/merchant/profile")) return "profile";
    if (pathname.includes("/merchant/settings")) return "settings";
    return "dashboard"; // Dashboard é o padrão
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      <Outlet />
      <MerchantBottomNav activeTab={activeTab} />
    </div>
  );
}
