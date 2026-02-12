import { useState, useEffect } from "react";

const SPLASH_DURATION_MS = 2000;

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300); // Delay para animação de fade out
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] gradient-hero flex items-center justify-center"
      style={{
        animation: visible ? 'fadeOut 0.3s ease-out 1.7s forwards' : 'none',
      }}
    >
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[400px] md:h-[400px] flex items-center justify-center">
        <img 
          src="/logo-core-plus.png" 
          alt="Core+" 
          className="w-full h-full object-contain animate-pulse"
          style={{
            imageRendering: 'auto',
            mixBlendMode: 'normal',
            backgroundColor: 'transparent',
          }}
          onError={(e) => {
            console.error("❌ Erro ao carregar logo:", e);
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            const fallback = img.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
          onLoad={() => {
            console.log("✅ Logo carregada com sucesso");
          }}
        />
        {/* Fallback visual caso a imagem não carregue */}
        <div 
          className="hidden w-full h-full rounded-2xl bg-white/20 items-center justify-center"
          style={{ display: 'none' }}
        >
          <span className="text-4xl font-bold text-white">C+</span>
        </div>
      </div>
      <style>{`
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
      `}</style>
    </div>
  );
}
