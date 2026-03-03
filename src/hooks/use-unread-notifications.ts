import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUnreadCount } from "@/services/notificationsService";

/**
 * Hook que retorna o número de notificações não lidas do usuário.
 * Atualiza ao navegar, ao voltar da tela de notificações e quando a janela recupera o foco.
 */
export function useUnreadNotifications() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!user?.uid) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await getUnreadCount(user.uid);
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount, pathname]);

  useEffect(() => {
    const handleFocus = () => fetchCount();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchCount]);

  return { unreadCount, refresh: fetchCount };
}
