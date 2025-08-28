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
      
      // Only prevent rubber band effect when already at top
      let isAtTop = true;
      
      const handleScroll = () => {
        isAtTop = window.scrollY <= 0;
      };
      
      const preventOverscroll = (e: TouchEvent) => {
        // Only prevent if we're at the very top and pulling down
        if (isAtTop && window.scrollY <= 0) {
          const touch = e.touches[0];
          if (touch && touch.clientY > touch.screenY) {
            e.preventDefault();
          }
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      document.addEventListener('touchmove', preventOverscroll, { passive: false });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('touchmove', preventOverscroll);
      };
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
