import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const HeroSection = () => (
  <div className="relative bg-slate-900 overflow-hidden font-sans">
    <div className="absolute inset-0">
      {/* IMPORTANTE: Cambia 'hero-nueva.jpg' por el nombre real de tu archivo en la carpeta 'public' */}
      <img 
        src="/hero-nueva.jpg" 
        alt="Imagen Principal" 
        className="w-full h-full object-cover object-center opacity-40"
        // Nota: La opacidad (0.4) hace que se vea oscura para que el texto resalte.
        // Si la quieres más clara, aumenta el valor (ej. opacity-60).
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
    </div>
    <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-32">
      <div className="lg:w-2/3">
        <h1 className="text-3xl md:text-6xl font-extrabold text-white tracking-tight mb-4 md:mb-6 leading-tight">
          Potencia tu Pasión <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Repuestos de Calidad</span>
        </h1>
        <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl">Encuentra las mejores piezas para tu Daytona. Calidad garantizada.</p>
        <Link to="/catalogo" className="w-full md:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg active:scale-95">
          Ver Catálogo <ChevronRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </div>
  </div>
);