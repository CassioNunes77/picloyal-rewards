import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { getActiveNavId } from "@/config/nav";

export default function MobileLayout() {
  const { pathname } = useLocation();
  const activeTab = getActiveNavId(pathname);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Outlet />
      <BottomNav activeTab={activeTab} useScanQuery />
    </div>
  );
}
