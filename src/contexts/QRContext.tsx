import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface QRContextType {
  showQR: boolean;
  openQR: () => void;
  closeQR: () => void;
}

const QRContext = createContext<QRContextType | undefined>(undefined);

export function QRProvider({ children }: { children: ReactNode }) {
  const [showQR, setShowQR] = useState(false);
  const openQR = useCallback(() => setShowQR(true), []);
  const closeQR = useCallback(() => setShowQR(false), []);
  return (
    <QRContext.Provider value={{ showQR, openQR, closeQR }}>
      {children}
    </QRContext.Provider>
  );
}

export function useQR() {
  const context = useContext(QRContext);
  if (context === undefined) {
    throw new Error("useQR must be used within a QRProvider");
  }
  return context;
}
