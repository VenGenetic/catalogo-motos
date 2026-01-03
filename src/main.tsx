import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext' // Importar

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider> {/* Envolver la App */}
      <App />
    </CartProvider>
  </StrictMode>,
)