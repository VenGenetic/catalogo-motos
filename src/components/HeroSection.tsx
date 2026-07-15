// src/components/HeroSection.tsx
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Truck, Users, MessageCircle } from 'lucide-react'; 
import { APP_CONFIG } from '../config/constants';

export const HeroSection = () => {
  
  const handleWhatsappClick = () => {
    const mensaje = "Hola LV PARTS, quisiera cotizar unos repuestos.";
    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative bg-brand-bg overflow-hidden font-sans min-h-[90vh] flex items-center justify-center py-20">
      
      {/* Fondo con Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-perchas.png" 
          alt="Perchas de Repuestos Daytona" 
          className="w-full h-full object-cover object-center opacity-40 grayscale brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg via-brand-bg/60 to-brand-bg z-10"></div>
        <div className="absolute inset-0 industrial-grid z-10 opacity-40"></div>
      </div>

      <div className="relative z-20 w-full max-w-7xl px-4 md:px-8 text-center flex flex-col items-center">
        
        {/* Etiqueta de Especialistas */}
        <div className="mb-6 inline-flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/20 px-4 py-1.5 rounded-full animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
          <span className="font-geist text-[10px] font-bold text-brand-orange tracking-widest uppercase">
            Especialistas en Alto Rendimiento
          </span>
        </div>

        {/* Título y Fondo con Outline */}
        <div className="relative group w-full mb-8">
          {/* Texto Outline Gigante de Fondo */}
          <h1 className="absolute -top-12 md:-top-20 left-1/2 -translate-x-1/2 w-full font-anton text-[70px] md:text-[160px] lg:text-[200px] hero-text-stroke opacity-15 select-none pointer-events-none uppercase leading-none tracking-widest text-center">
            ORIGINAL
          </h1>
          {/* Título Principal */}
          <h2 className="relative z-10 font-anton text-[40px] md:text-[80px] lg:text-[110px] text-white leading-none tracking-tight transition-transform duration-700 hover:scale-[1.01] uppercase">
            REPUESTOS <br />
            <span className="text-brand-orange">ORIGINALES</span>
          </h2>
        </div>

        <p className="max-w-2xl mx-auto font-hanken text-base md:text-xl text-gray-400 mb-12 uppercase tracking-wide leading-relaxed animate-fade-in-up delay-200">
          Especialistas en la marca Daytona. Recibe asesoría técnica personalizada y envíos seguros a todo el Ecuador.
        </p>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md md:max-w-xl mx-auto mb-16 animate-fade-in-up delay-300">
          <Link 
            to="/catalogo" 
            className="group relative w-full sm:w-auto px-10 py-4 bg-brand-orange text-white font-geist text-sm font-bold uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-95 primary-button-glow flex items-center justify-center gap-2"
          >
            <span>Ver Catálogo</span>
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <button 
            onClick={handleWhatsappClick}
            className="w-full sm:w-auto px-10 py-4 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-geist text-sm font-bold uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Insignias de Confianza */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10 w-full max-w-4xl mx-auto animate-fade-in-up delay-500 text-left">
          <div className="flex items-center gap-3 group">
            <div className="bg-brand-surface-2 p-2.5 rounded-xl text-brand-orange group-hover:text-white group-hover:bg-brand-orange transition-colors">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-white font-bold text-sm uppercase font-hanken">Garantía Total</p>
              <p className="text-gray-500 text-xs">En todos los productos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 group">
            <div className="bg-brand-surface-2 p-2.5 rounded-xl text-brand-orange group-hover:text-white group-hover:bg-brand-orange transition-colors">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-white font-bold text-sm uppercase font-hanken">Envíos Rápidos</p>
              <p className="text-gray-500 text-xs">Despachos diarios</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 group">
            <div className="bg-brand-surface-2 p-2.5 rounded-xl text-brand-orange group-hover:text-white group-hover:bg-brand-orange transition-colors">
              <Users size={24} />
            </div>
            <div>
              <p className="text-white font-bold text-sm uppercase font-hanken">Soporte Humano</p>
              <p className="text-gray-500 text-xs">Expertos te atienden</p>
            </div>
          </div>
        </div>

      </div>

      {/* Indicador de Desplazamiento */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-40">
        <span className="font-geist text-[10px] uppercase tracking-widest text-white">Explorar</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-brand-orange to-transparent animate-pulse"></div>
      </div>

    </div>
  );
};