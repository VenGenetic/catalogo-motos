import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 

import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { MotoProvider } from './context/MotoContext'
import { ScrollToTop } from './components/ScrollToTop'
import { initMetaPixel } from './utils/tracking'
import { initAttribution } from './utils/attribution'
import { cargarDespiece } from './utils/cargarDespiece'

// Antes de renderizar: los identificadores del anuncio viven en la query de la
// primera carga y se pierden en cuanto el cliente navega.
initAttribution()
initMetaPixel()
// El despiece viene en su propio archivo: se pide ya, mientras se dibuja la página.
cargarDespiece()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
        <ScrollToTop />
        <ThemeProvider>
          <CartProvider>
            <ToastProvider>
              <MotoProvider>
                <App />
              </MotoProvider>
            </ToastProvider>
          </CartProvider>
        </ThemeProvider>
      </BrowserRouter>
  </StrictMode>,
)