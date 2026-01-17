import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import { HelmetProvider } from 'react-helmet-async' // IMPORTANTE
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'
import { ScrollToTop } from './components/ScrollToTop'

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