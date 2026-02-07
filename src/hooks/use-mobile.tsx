import * as React from "react";

const MOBILE_BREAKPOINT = 768;

function getIsMobile() {
  if (typeof window === "undefined") return false;
  const w = window.innerWidth;
  if (w <= 0) return false;
  return w < MOBILE_BREAKPOINT;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => getIsMobile());

  React.useEffect(() => {
    setIsMobile(getIsMobile());
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(getIsMobile());
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
