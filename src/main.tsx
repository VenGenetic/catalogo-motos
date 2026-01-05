import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx'; // <--- IMPORTAR

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ToastProvider> {/* <--- ENVOLVER AQUI */}
        <CartProvider>
          <App />
        </CartProvider>
      </ToastProvider>
    </HelmetProvider>
  </StrictMode>,
);