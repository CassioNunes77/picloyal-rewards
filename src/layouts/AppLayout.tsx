import { useIsMobile } from "@/hooks/use-mobile";
import { QRProvider } from "@/contexts/QRContext";
import DarkModeLoader from "@/components/DarkModeLoader";
import MobileLayout from "./MobileLayout";
import DesktopLayout from "./DesktopLayout";

export default function AppLayout() {
  const isMobile = useIsMobile();

  return (
    <QRProvider>
      <DarkModeLoader />
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </QRProvider>
  );
}
