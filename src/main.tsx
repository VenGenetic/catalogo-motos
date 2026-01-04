import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext' // <--- Importamos el carrito

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Envolvemos la App con el CartProvider para que funcione */}
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
)import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- Activamos el Router
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter> {/* Envolvemos todo aquí */}
        <App />
      </BrowserRouter>
    </CartProvider>
  </StrictMode>,
)