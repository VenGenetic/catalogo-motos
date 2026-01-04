import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- ESTO FALTABA
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter> {/* <--- Importante: El Router debe envolver a la App */}
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)