import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- Router Reactivado
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext' // <--- Carrito Reactivado

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter> {/* El Router envuelve la App dentro del Carrito */}
        <App />
      </BrowserRouter>
    </CartProvider>
  </StrictMode>,
)