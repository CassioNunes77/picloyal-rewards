import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "./MobileLayout";
import DesktopLayout from "./DesktopLayout";

export default function AppLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLayout />;
  }

  return <DesktopLayout />;
}
