import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// VOLVEMOS A: BrowserRouter (Para URLs limpias sin #)
import { BrowserRouter } from 'react-router-dom' 
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> 
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)