import { ReactNode, useEffect, useState } from "react";

interface PageTransitionProps {
  children: ReactNode;
  show: boolean;
  direction?: "left" | "right" | "up" | "down";
}

const PageTransition = ({ children, show, direction = "right" }: PageTransitionProps) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    }
  }, [show]);

  const handleAnimationEnd = () => {
    if (!show) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) return null;

  const animations = {
    left: show ? "animate-slide-in-left" : "animate-fade-out",
    right: show ? "animate-slide-in-right" : "animate-fade-out",
    up: show ? "animate-slide-up" : "animate-fade-out",
    down: show ? "animate-slide-down" : "animate-fade-out",
  };

  return (
    <div
      className={`${animations[direction]} ${!show ? "pointer-events-none" : ""}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
};

export default PageTransition;
