import type { LucideIcon } from "lucide-react";
import { Home, Tag, QrCode, Store, User } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  primary?: boolean;
  badge?: number;
}

/** Configuração compartilhada de navegação (MobileLayout e DesktopLayout). */
export const navItems: NavItem[] = [
  { id: "home", label: "Início", path: "/home", icon: Home },
  { id: "offers", label: "Ofertas", path: "/offers", icon: Tag },
  { id: "scan", label: "Escanear", path: "/home", icon: QrCode, primary: true },
  { id: "stores", label: "Lojas", path: "/stores", icon: Store },
  { id: "profile", label: "Perfil", path: "/profile", icon: User },
];

/** Path para abrir o QR na home (usado pelo botão Escanear no mobile). */
export const HOME_QR_SEARCH = "?showQR=1";

/** Retorna o id do item de nav ativo com base no pathname. */
export function getActiveNavId(pathname: string): string {
  if (pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/offers")) return "offers";
  if (pathname.startsWith("/stores") || pathname.startsWith("/store/")) return "stores";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/notifications")) return "notifications";
  if (pathname.startsWith("/history")) return "history";
  if (pathname.startsWith("/rewards")) return "rewards";
  return "home";
}
