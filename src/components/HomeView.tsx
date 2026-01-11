import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { HeroSection } from './HeroSection';
import { FeaturedCategories } from './FeaturedCategories';
import { Producto } from '../types';
import { LazyImage } from './LazyImage';
import { optimizarImg } from '../utils/helpers';

interface Props {
  productos: Producto[];
}

export const HomeView = ({ productos }: Props) => {
  // Tomamos los primeros 4 productos para mostrar como "Destacados"
  const destacados = productos.slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* 1. Portada */}
      <HeroSection />

      {/* 2. Categorías */}
      <FeaturedCategories />

      {/* 3. Banner Promocional */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-3xl overflow-hidden shadow-2xl relative h-48 md:h-[350px] group">
          <img 
            src="/banner.png" 
            alt="Ofertas Especiales" 
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <div className="text-white">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">OFERTA</span>
              <h3 className="text-3xl font-bold mb-2">Envío Gratis</h3>
              <p className="text-gray-200 mb-4 max-w-md">En pedidos superiores a $50. Equipa tu moto con los mejores repuestos.</p>
              <Link to="/catalogo" className="bg-white text-slate-900 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                Ver Catálogo <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Productos Destacados (Recién Llegados) - MEJORADO PARA MÓVIL */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-8 md:py-12 pb-16 md:pb-20">
        <div className="flex justify-between items-start md:items-end mb-4 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">Recién Llegados</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-0.5 md:mt-1">Lo último en tecnología para tu moto</p>
          </div>
          <Link to="/catalogo" className="text-red-600 font-bold text-xs md:text-sm hover:underline flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg active:scale-95 transition-all">
            Ver todo <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
          {destacados.map(p => (
            <Link key={p.id} to={`/catalogo?prod=${p.id}`} className="group block">
              <div className="bg-white border border-gray-100 rounded-lg md:rounded-xl overflow-hidden shadow-sm hover:shadow-lg md:hover:shadow-xl transition-all duration-300 active:scale-95">
                <div className="aspect-square relative overflow-hidden bg-gray-50">
                  <LazyImage 
                    src={optimizarImg(p.imagen)} 
                    alt={p.nombre} 
                    cropBottom={false}
                    imageFit="contain"
                    className="w-full h-full bg-white transition-transform duration-500 group-hover:scale-105 p-1"
                  />
                  <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[9px] md:text-[10px] font-bold shadow-sm flex items-center gap-0.5 md:gap-1">
                    <Star size={8} className="fill-yellow-400 text-yellow-400" /> TOP
                  </div>
                </div>
                <div className="p-2 md:p-3">
                  <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-2 mb-0.5 md:mb-1 group-hover:text-red-600 transition-colors leading-tight">
                    {p.nombre}
                  </h4>
                  <p className="text-sm md:text-lg font-extrabold text-slate-900">${Number(p.precio).toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};