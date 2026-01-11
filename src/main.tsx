import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom' 
import { HelmetProvider } from 'react-helmet-async' // IMPORTANTE
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'

// Componente auxiliar para subir el scroll al cambiar de ruta
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter> 
        <ScrollToTop />
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)