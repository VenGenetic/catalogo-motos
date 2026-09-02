// src/components/HeroSection.tsx
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Truck, Users, MessageCircle } from 'lucide-react'; 
import { APP_CONFIG } from '../config/constants';
import { trackContact } from '../utils/tracking';

export const HeroSection = () => {

  const handleWhatsappClick = () => {
    trackContact('hero');
    const mensaje = "Hola LV PARTS, quisiera cotizar unos repuestos.";
    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="relative flex min-h-[calc(100svh-6rem)] items-center justify-center overflow-hidden bg-brand-bg py-16 font-sans md:min-h-[calc(100vh-7rem)] md:py-20">
      
      {/* Fondo con Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-perchas.webp"
          alt="Perchas de Repuestos Daytona" 
          className="h-full w-full object-cover object-[center_38%] opacity-45 grayscale brightness-[0.68]"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-brand-bg/95 via-brand-bg/55 to-brand-bg"></div>
        <div className="absolute inset-0 industrial-grid z-10 opacity-40"></div>
      </div>

      <div className="relative z-20 flex w-full max-w-7xl flex-col items-center px-4 text-center md:px-8">
        
        {/* Etiqueta de Especialistas */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-orange/25 bg-brand-orange/10 px-4 py-2 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
          <span className="font-geist text-[11px] font-bold uppercase tracking-[0.18em] text-brand-orange">
            Especialistas en Alto Rendimiento
          </span>
        </div>

        {/* Título y Fondo con Outline */}
        <div className="relative group w-full mb-8">
          {/* Texto Outline Gigante de Fondo */}
          <h1 className="pointer-events-none absolute -top-10 left-1/2 w-full -translate-x-1/2 select-none text-center font-anton text-[72px] uppercase leading-none tracking-widest opacity-10 hero-text-stroke md:-top-20 md:text-[160px] lg:text-[200px]">
            ORIGINAL
          </h1>
          {/* Título Principal */}
          <h2 className="relative z-10 font-anton text-[46px] uppercase leading-[0.92] tracking-tight text-white min-[390px]:text-[52px] md:text-[80px] lg:text-[110px]">
            REPUESTOS <br />
            <span className="text-brand-orange">ORIGINALES</span>
          </h2>
        </div>

        <p className="mx-auto mb-10 max-w-2xl font-hanken text-base leading-relaxed text-slate-300 animate-fade-in-up animation-delay-200 md:mb-12 md:text-xl">
          Especialistas en la marca Daytona. Recibe asesoría técnica personalizada y envíos seguros a todo el Ecuador.
        </p>

        {/* Botones de Acción */}
        <div className="mx-auto mb-14 flex w-full max-w-md flex-col items-center justify-center gap-4 animate-fade-in-up animation-delay-300 sm:flex-row md:mb-16 md:max-w-xl md:gap-6">
          <Link 
            to="/catalogo" 
            className="group relative flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-orange-action px-10 py-4 font-geist text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-brand-orange active:scale-95 primary-button-glow sm:w-auto"
          >
            <span>Ver Catálogo</span>
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <button 
            onClick={handleWhatsappClick}
            className="flex min-h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-[#25D366] px-10 py-4 font-geist text-sm font-bold uppercase tracking-widest text-[#25D366] transition-all duration-300 hover:bg-[#25D366]/10 active:scale-95 sm:w-auto"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Insignias de Confianza */}
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 border-t border-white/10 pt-8 text-left animate-fade-in-up animation-delay-500 sm:grid-cols-3 sm:gap-6">
          <div className="flex items-center gap-3 group">
            <div className="rounded-xl border border-white/5 bg-brand-surface-2 p-2.5 text-brand-orange transition-colors group-hover:border-brand-orange/30 group-hover:bg-brand-orange group-hover:text-brand-bg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-white font-bold text-sm uppercase font-hanken">Garantía Total</p>
              <p className="text-gray-500 text-xs">En todos los productos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 group">
            <div className="rounded-xl border border-white/5 bg-brand-surface-2 p-2.5 text-brand-orange transition-colors group-hover:border-brand-orange/30 group-hover:bg-brand-orange group-hover:text-brand-bg">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-white font-bold text-sm uppercase font-hanken">Envíos Rápidos</p>
              <p className="text-gray-500 text-xs">Despachos diarios</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 group">
            <div className="rounded-xl border border-white/5 bg-brand-surface-2 p-2.5 text-brand-orange transition-colors group-hover:border-brand-orange/30 group-hover:bg-brand-orange group-hover:text-brand-bg">
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

    </section>
  );
};
