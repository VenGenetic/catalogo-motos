import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { Search, Heart, X, ArrowLeft, Filter } from 'lucide-react'; 
import { optimizarImg } from '../utils/helpers';
import { APP_CONFIG, ORDEN_SECCIONES } from '../config/constants';
import { Producto } from '../types';
import { LazyImage } from './LazyImage';
import { HighlightedText } from './HighlightedText';
import { MotoSelector } from './MotoSelector';

interface Props {
  productos: Producto[];
  isFav: (id: string) => boolean;
  toggleFav: (id: string) => void;
  filtroModelo: string;
  setFiltroModelo: (m: string) => void;
  busqueda: string;
  setBusqueda: (s: string) => void;
  filtroSeccion: string;
  setFiltroSeccion: (s: string) => void;
  onProductClick: (p: Producto) => void;
}

export const CatalogView = memo(({ 
  productos, isFav, toggleFav,
  filtroModelo, setFiltroModelo, 
  busqueda, setBusqueda,
  filtroSeccion, setFiltroSeccion,
  onProductClick
}: Props) => {
  const [pagina, setPagina] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    setPagina(1); 
    if (busqueda || filtroSeccion !== 'Todos') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [busqueda, filtroModelo, filtroSeccion]);

  const visibles = useMemo(() => {
    return productos.slice(0, pagina * APP_CONFIG.ITEMS_PER_PAGE);
  }, [productos, pagina]);

  const handleCambiarMoto = () => {
    setFiltroModelo(''); 
    setBusqueda('');
    setFiltroSeccion('Todos');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // 1. MODO SELECTOR
  if (!filtroModelo && !busqueda) {
    return (
      <MotoSelector 
        onSelectModel={(modelo) => {
          setFiltroModelo(modelo);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        onSearchGlobal={(termino) => {
          setBusqueda(termino);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // 2. MODO CATÁLOGO
  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 pb-24 pt-2 md:pt-4 px-0 md:px-8 font-sans scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* BARRA SUPERIOR */}
        <div className="sticky top-[64px] z-30 bg-slate-50/95 backdrop-blur-md pb-4 pt-3 px-3 md:px-0 transition-all border-b border-gray-100/50 md:border-none">
          <div className="flex gap-3 mb-4">
            <button 
              onClick={handleCambiarMoto}
              className="flex items-center justify-center px-4 py-3 rounded-xl bg-white border border-gray-200 text-slate-700 shadow-sm font-bold active:scale-95 transition-all hover:bg-gray-50 hover:border-gray-300"
            >
              <ArrowLeft className="w-5 h-5 mr-0 md:mr-2" />
              <span className="hidden md:inline">Volver</span>
            </button>

            <div className="flex-[2] relative group">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                placeholder={filtroModelo ? `Buscar pieza para ${filtroModelo}...` : "Buscar en todo el catálogo..."}
                className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl bg-white text-base focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none shadow-sm placeholder:text-gray-400 transition-all"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-3 px-1 flex items-center justify-between text-xs text-gray-500">
             <div className="flex items-center gap-2">
                <span className="hidden md:inline">Catálogo:</span>
                {filtroModelo ? (
                    <span className="font-extrabold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 flex items-center gap-1">
                      {filtroModelo}
                    </span>
                ) : (
                    <span className="font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                      Global
                    </span>
                )}
             </div>
             <div className="flex items-center gap-1 text-gray-400">
                <Filter className="w-3 h-3" />
                <span>{filtroSeccion}</span>
             </div>
          </div>

          <div className="overflow-x-auto pb-2 scrollbar-hide scroll-smooth -mx-3 px-3 md:mx-0 md:px-0">
            <div className="flex space-x-2">
              {ORDEN_SECCIONES.map((category) => (
                <button
                  key={category}
                  onClick={() => setFiltroSeccion(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
                    filtroSeccion === category 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 scale-105' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LISTADO DE PRODUCTOS */}
        {visibles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0">
              {visibles.map((product: Producto) => (
                <div 
                  key={product.id} 
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden relative transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-red-100 hover:-translate-y-1"
                  onClick={() => onProductClick(product)}
                >
                  <button 
                    className={`absolute top-3 right-3 p-2 rounded-full z-10 transition-all duration-200 backdrop-blur-sm ${
                      isFav(product.id) 
                        ? 'bg-red-50 text-red-500 scale-110 shadow-sm' 
                        : 'bg-white/80 text-slate-400 hover:bg-white hover:text-red-500 border border-gray-100'
                    }`}
                    onClick={(e) => { e.stopPropagation(); toggleFav(product.id); }}
                  >
                    <Heart className={`w-4 h-4 ${isFav(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* IMAGEN COMPLETA SIN RECORTE */}
                  <div className="relative h-32 md:h-40 bg-white overflow-hidden p-2">
                    <LazyImage
                      src={optimizarImg(product.imagen)}
                      alt={product.nombre}
                      className="w-full h-full rounded-lg transition-transform duration-500 group-hover:scale-105"
                      imageFit="contain"
                      cropBottom={false}
                    />
                    
                    {product.stock === false && (
                         <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 text-white text-[10px] py-1 text-center font-bold">
                           AGOTADO
                         </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow relative z-10 bg-white border-t border-gray-50">
                    <div className="mb-2">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wide border border-gray-100">
                        {product.seccion}
                        </span>
                    </div>
                    
                    {/* CAMBIO APLICADO: Se eliminó 'line-clamp-2' para mostrar el nombre completo */}
                    <h3 className="text-sm font-bold text-slate-800 mb-2 leading-snug min-h-[2.5em] group-hover:text-red-600 transition-colors">
                      <HighlightedText text={product.nombre} highlight={busqueda} />
                    </h3>
                    
                    <div className="mt-auto pt-2 flex items-center justify-between">
                       <span className="text-lg font-extrabold text-slate-900">
                         ${Number(product.precio).toFixed(2)}
                       </span>
                       <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                         VER →
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {visibles.length < productos.length && (
              <div className="mt-12 text-center px-4 mb-8">
                <button onClick={() => setPagina(p => p + 1)} className="w-full md:w-auto px-10 py-3 bg-white border border-gray-200 text-slate-700 font-bold text-sm rounded-full shadow-sm hover:shadow-md hover:border-red-200 hover:text-red-600 transition-all active:scale-95">
                  Cargar más repuestos
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
             <div className="bg-slate-50 p-6 rounded-full mb-6 animate-pulse">
                <Search className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">No encontramos repuestos</h3>
             <p className="text-slate-500 max-w-xs mx-auto mb-8">
               {filtroModelo ? `No hay resultados para "${filtroModelo}"` : "Intenta buscando con otro nombre."}
             </p>
             <button onClick={() => { setBusqueda(''); setFiltroSeccion('Todos'); }} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
});