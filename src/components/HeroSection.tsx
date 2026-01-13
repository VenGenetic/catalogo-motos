// src/components/HeroSection.tsx
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Truck, Users, MessageCircle } from 'lucide-react'; // <--- 1. Agregamos MessageCircle
import { APP_CONFIG } from '../config/constants'; // <--- 2. Importamos la config para el número

export const HeroSection = () => {
  
  // Función para abrir WhatsApp directo
  const handleWhatsappClick = () => {
    const mensaje = "Hola LV PARTS, vi su anuncio en Google. Quiero cotizar unos repuestos.";
    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative bg-slate-900 overflow-hidden font-sans min-h-[600px] flex items-center">
      {/* Fondo con Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-nueva.png" 
          alt="Repuestos Daytona" 
          className="w-full h-full object-cover object-center opacity-40 md:opacity-50 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="lg:w-3/4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-6 backdrop-blur-sm animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-red-400 text-xs md:text-sm font-bold tracking-wide uppercase">
                Catálogo Actualizado {new Date().getFullYear()}
              </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight animate-fade-in-up delay-100">
            Repuestos Originales <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              Al Mejor Precio
            </span>
          </h1>
          
          <p className="text-base md:text-xl text-gray-400 mb-8 max-w-2xl leading-relaxed animate-fade-in-up delay-200">
            Especialistas en la marca Daytona. Recibe asesoría técnica personalizada y envíos seguros a todo el Ecuador.
          </p>

          {/* --- BOTONES DE ACCIÓN (MODIFICADO) --- */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up delay-300">
              <Link to="/catalogo" className="inline-flex items-center justify-center px-8 py-4 text-base md:text-lg font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/25 active:scale-95 group">
                Ver Repuestos <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              {/* CAMBIO APLICADO AQUÍ: Botón WhatsApp Directo */}
              <button 
                onClick={handleWhatsappClick}
                className="inline-flex items-center justify-center px-8 py-4 text-base md:text-lg font-bold rounded-xl text-white border-2 border-green-500 bg-green-500/10 hover:bg-green-600 hover:border-green-600 transition-all active:scale-95 gap-2 shadow-lg shadow-green-900/20"
              >
                <MessageCircle className="w-6 h-6" />
                Cotizar por WhatsApp
              </button>
          </div>

          {/* Insignias de Confianza */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10 animate-fade-in-up delay-500">
              <div className="flex items-center gap-3 group">
                  <div className="bg-slate-800 p-2 rounded-lg text-red-500 group-hover:text-white group-hover:bg-red-600 transition-colors">
                      <ShieldCheck size={24} />
                  </div>
                  <div>
                      <p className="text-white font-bold text-sm">Garantía Total</p>
                      <p className="text-gray-500 text-xs">En todos los productos</p>
                  </div>
              </div>
              
              <div className="flex items-center gap-3 group">
                   <div className="bg-slate-800 p-2 rounded-lg text-red-500 group-hover:text-white group-hover:bg-red-600 transition-colors">
                      <Truck size={24} />
                  </div>
                  <div>
                      <p className="text-white font-bold text-sm">Envíos Rápidos</p>
                      <p className="text-gray-500 text-xs">Despachos diarios</p>
                  </div>
              </div>
              
               <div className="flex items-center gap-3 group">
                   <div className="bg-slate-800 p-2 rounded-lg text-red-500 group-hover:text-white group-hover:bg-red-600 transition-colors">
                      <Users size={24} />
                  </div>
                  <div>
                      <p className="text-white font-bold text-sm">Soporte Humano</p>
                      <p className="text-gray-500 text-xs">Expertos te atienden</p>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};