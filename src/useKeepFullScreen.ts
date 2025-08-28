import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useKeepFullScreen() {
  const location = useLocation();

  useEffect(() => {
    // Check if running as standalone app (iOS home screen app)
    const isStandalone = (window.navigator as any).standalone || 
                        window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone) {
      // Force scroll to top to hide any residual browser UI
      window.scrollTo(0, 0);
      return;
    }
    
    // For regular Safari (not standalone), try to hide address bar
    const hideAddressBar = () => {
      setTimeout(() => {
        window.scrollTo(0, 1);
      }, 0);
    };
    
    // Hide on load and route change
    hideAddressBar();
    
    // Also hide when viewport changes (orientation change)
    const handleResize = () => {
      hideAddressBar();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [location]);
}
