import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async'; // <--- Importante
import './index.css';
import App from './App.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { GarageProvider } from './context/GarageContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <GarageProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </GarageProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);