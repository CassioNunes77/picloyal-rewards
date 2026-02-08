import { useDarkMode } from "@/hooks/use-dark-mode";

/**
 * Componente que carrega a preferência de modo escuro do Firebase
 * Deve ser usado em um nível alto da árvore de componentes para garantir
 * que a preferência seja carregada assim que o usuário faz login
 */
export default function DarkModeLoader() {
  useDarkMode(); // Apenas carrega a preferência, não precisa do retorno aqui
  return null;
}
