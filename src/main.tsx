import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 

import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { ScrollToTop } from './components/ScrollToTop'
import { HelmetProvider } from 'react-helmet-async'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter> 
        <ScrollToTop />
        <ThemeProvider>
          <CartProvider>
            <ToastProvider>
              <HelmetProvider>
                <App />
              </HelmetProvider>
            </ToastProvider>
          </CartProvider>
        </ThemeProvider>
      </BrowserRouter>
  </StrictMode>,
)