import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. CAMBIO IMPORTANTE: Usar HashRouter
import { HashRouter } from 'react-router-dom' 
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. CAMBIO IMPORTANTE: HashRouter envuelve la App */}
    <HashRouter> 
      <CartProvider>
        <App />
      </CartProvider>
    </HashRouter>
  </StrictMode>,
)