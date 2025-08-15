import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

// Set RTL direction for Hebrew
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'he';

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
