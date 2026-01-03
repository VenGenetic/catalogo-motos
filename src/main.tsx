import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// CAMBIO AQUÍ: Importa HashRouter en lugar de BrowserRouter
import { HashRouter } from 'react-router-dom' 
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* CAMBIO AQUÍ: Usa HashRouter */}
    <HashRouter> 
      <CartProvider>
        <App />
      </CartProvider>
    </HashRouter>
  </StrictMode>,
)