import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserData, updateUserData } from "@/services/usersService";

/**
 * Hook para gerenciar o modo escuro com persistência no Firebase
 */
export function useDarkMode() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar preferência do Firebase quando o usuário faz login
  useEffect(() => {
    const loadDarkModePreference = async () => {
      if (!user?.uid) {
        // Se não há usuário, usar preferência do sistema ou padrão (false)
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setDarkMode(systemPrefersDark);
        document.documentElement.classList.toggle('dark', systemPrefersDark);
        setLoading(false);
        return;
      }

      try {
        const userData = await getUserData(user.uid);
        if (userData?.preferences?.darkMode !== undefined) {
          const savedDarkMode = userData.preferences.darkMode;
          setDarkMode(savedDarkMode);
          document.documentElement.classList.toggle('dark', savedDarkMode);
        } else {
          // Se não há preferência salva, usar preferência do sistema
          const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          setDarkMode(systemPrefersDark);
          document.documentElement.classList.toggle('dark', systemPrefersDark);
        }
      } catch (error) {
        console.error("Erro ao carregar preferência de modo escuro:", error);
        // Em caso de erro, usar preferência do sistema
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setDarkMode(systemPrefersDark);
        document.documentElement.classList.toggle('dark', systemPrefersDark);
      } finally {
        setLoading(false);
      }
    };

    loadDarkModePreference();
  }, [user?.uid]);

  // Função para alternar o modo escuro e salvar no Firebase
  const toggleDarkMode = async (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
    
    // Salvar preferência no Firebase se o usuário estiver autenticado
    if (user?.uid) {
      try {
        await updateUserData(user.uid, {
          preferences: {
            darkMode: checked,
          },
        });
      } catch (error) {
        console.error("Erro ao salvar preferência de modo escuro:", error);
        // Reverter a mudança em caso de erro
        setDarkMode(!checked);
        document.documentElement.classList.toggle('dark', !checked);
        throw error;
      }
    }
  };

  return { darkMode, toggleDarkMode, loading };
}
