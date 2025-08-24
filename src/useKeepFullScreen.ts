import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useKeepFullScreen() {
  const location = useLocation();

  useEffect(() => {
    if ((window.navigator as any).standalone) {
      window.scrollTo(0, 0);
    }
  }, [location]);
}
