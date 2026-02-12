import { useIsMobile } from "@/hooks/use-mobile";
import MerchantMobileLayout from "./MerchantMobileLayout";
import MerchantDesktopLayout from "./MerchantDesktopLayout";

export default function MerchantLayout() {
  const isMobile = useIsMobile();

  return isMobile ? <MerchantMobileLayout /> : <MerchantDesktopLayout />;
}
