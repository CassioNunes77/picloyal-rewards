import { useEffect } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import QRCodeCard from "@/components/QRCodeCard";
import { getActiveNavId } from "@/config/nav";
import { useQR } from "@/contexts/QRContext";

export default function MobileLayout() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getActiveNavId(pathname);
  const { showQR, openQR, closeQR } = useQR();

  useEffect(() => {
    if (searchParams.get("showQR") === "1") {
      openQR();
      setSearchParams({}, { replace: true });
    }
  }, [pathname, searchParams, openQR, setSearchParams]);

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      <Outlet />
      <BottomNav activeTab={activeTab} />
      <QRCodeCard isOpen={showQR} onClose={closeQR} />
    </div>
  );
}
