import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'; // <--- Importante
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Envolvemos la App para que funcione el SEO */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)