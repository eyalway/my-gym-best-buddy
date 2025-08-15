import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { useEffect } from 'react'

// RTL Enforcement Component
const RTLWrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Force RTL on mount and continuously for mobile
    const enforceRTL = () => {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.setAttribute('dir', 'rtl');
      document.documentElement.style.setProperty('direction', 'rtl', 'important');
      document.body.style.setProperty('direction', 'rtl', 'important');
      document.documentElement.style.setProperty('text-align', 'right', 'important');
      document.body.style.setProperty('text-align', 'right', 'important');
    };

    enforceRTL();
    
    // For mobile browsers, enforce more aggressively
    if (window.innerWidth <= 768) {
      const interval = setInterval(enforceRTL, 500);
      setTimeout(() => clearInterval(interval), 10000); // Stop after 10 seconds
    }
  }, []);

  return <div dir="rtl" style={{ direction: 'rtl', textAlign: 'right', width: '100%', minHeight: '100vh' }}>{children}</div>;
};

createRoot(document.getElementById("root")!).render(
  <RTLWrapper>
    <AuthProvider>
      <App />
    </AuthProvider>
  </RTLWrapper>
);
