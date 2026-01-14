import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { Heart, ArrowLeft, Filter, Search, ShoppingBag } from 'lucide-react'; 
import { optimizarImg } from '../utils/helpers';
import { APP_CONFIG, ORDEN_SECCIONES } from '../config/constants';
import { Producto } from '../types';
import { LazyImage } from './LazyImage';
import { SearchBar } from './SearchBar';
import { HighlightedText } from './HighlightedText';
import { MotoSelector } from './MotoSelector';
import { useCart } from '../context/CartContext';

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
  
  const { addToCart } = useCart();

  // Resetear página cuando cambian los filtros
  const [prevFilters, setPrevFilters] = useState({ busqueda, filtroModelo, filtroSeccion });
  if (
    prevFilters.busqueda !== busqueda || 
    prevFilters.filtroModelo !== filtroModelo || 
    prevFilters.filtroSeccion !== filtroSeccion
  ) {
    setPrevFilters({ busqueda, filtroModelo, filtroSeccion });
    setPagina(1);
  }

  useEffect(() => { 
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

  const handleQuickAdd = (e: React.MouseEvent, product: Producto) => {
    e.stopPropagation();
    addToCart(product);
  };

  // 1. MODO SELECTOR
  if (!filtroModelo && !busqueda) {
    return (
      <MotoSelector 
        onSelectModel={(modelo: string) => {
          setFiltroModelo(modelo);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        onSearchGlobal={(termino: string) => {
          setBusqueda(termino);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // 2. MODO CATÁLOGO
  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 pb-32 pt-2 md:pt-4 px-2 md:px-8 font-sans scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* BARRA SUPERIOR */}
        <div className="sticky top-[64px] z-30 bg-slate-50/95 backdrop-blur-md pb-2 pt-2 px-1 md:px-0 transition-all border-b border-gray-100/50 md:border-none">
          <div className="flex gap-2 mb-3 items-center">
            <button 
              onClick={handleCambiarMoto}
              className="h-[52px] w-[52px] flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-slate-700 shadow-sm active:scale-95 transition-all hover:bg-gray-50 hover:border-gray-300 shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="flex-1 relative z-40">
              <SearchBar
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                productos={productos}
                filtroModelo={filtroModelo}
              />
            </div>
          </div>
          
          <div className="mb-2 px-1 flex items-center justify-between text-xs text-gray-500">
             <div className="flex items-center gap-2">
                <span className="hidden md:inline">Viendo:</span>
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
             <div className="flex items-center gap-2">
                <span className="text-gray-400">{visibles.length} resultados</span>
                <div className="flex items-center gap-1 text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                  <Filter className="w-3 h-3" />
                  <span>{filtroSeccion}</span>
                </div>
             </div>
          </div>

          <div className="overflow-x-auto pb-2 scrollbar-hide scroll-smooth -mx-2 px-2 md:mx-0 md:px-0">
            <div className="flex space-x-2 min-w-max">
              {ORDEN_SECCIONES.map((category) => (
                <button
                  key={category}
                  onClick={() => setFiltroSeccion(category)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
                    filtroSeccion === category 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95'
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
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 px-0 md:px-0">
              {visibles.map((product: Producto) => (
                <div 
                  key={product.id} 
                  className="group bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden relative transition-all duration-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:border-red-100 hover:-translate-y-0.5 active:scale-95"
                  onClick={() => onProductClick(product)}
                >
                  {/* Corazón pequeño (como pediste) */}
                  <button 
                    className={`absolute top-2 right-2 p-1.5 rounded-full z-20 transition-all duration-200 ${
                      isFav(product.id) 
                        ? 'text-red-500 scale-110' 
                        : 'text-gray-300 bg-transparent hover:text-red-400'
                    }`}
                    onClick={(e) => { e.stopPropagation(); toggleFav(product.id); }}
                  >
                    <Heart className={`w-4 h-4 ${isFav(product.id) ? 'fill-current' : ''}`} strokeWidth={2.5} />
                  </button>

                  <div className="relative h-28 md:h-40 bg-white overflow-hidden p-1">
                    <LazyImage 
                      src={optimizarImg(product.imagen)} 
                      alt={product.nombre}
                      className="w-full h-full rounded-md transition-transform duration-500 group-hover:scale-105" 
                      cropBottom={false}
                    />
                    
                    {product.stock === false && (
                         <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 text-white text-[10px] py-1 text-center font-bold">
                           AGOTADO
                         </div>
                    )}
                  </div>

                  <div className="p-3 md:p-4 flex flex-col flex-grow relative z-10 bg-white border-t border-gray-50">
                    <div className="mb-1">
                        <span className="inline-block px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-400 text-[9px] font-bold uppercase tracking-wide border border-gray-100">
                        {product.seccion}
                        </span>
                    </div>
                    
                    {/* Título: Muestra TODO el texto (sin truncate) */}
                    <h3 className="text-xs md:text-sm font-bold text-slate-800 mb-2 leading-snug group-hover:text-red-600 transition-colors">
                      <HighlightedText text={product.nombre} highlight={busqueda} />
                    </h3>
                    
                    <div className="mt-auto flex items-center justify-between">
                       <span className="text-sm md:text-lg font-extrabold text-slate-900">
                         ${Number(product.precio).toFixed(2)}
                       </span>
                       
                       {/* Botón rápido (como pediste) */}
                       <button
                         onClick={(e) => handleQuickAdd(e, product)}
                         disabled={!product.stock}
                         className={`p-2 rounded-full transition-all shadow-sm flex items-center justify-center ${
                            product.stock 
                              ? 'bg-slate-900 text-white hover:bg-red-600 hover:scale-110 hover:shadow-red-200' 
                              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                         }`}
                       >
                         <ShoppingBag size={16} strokeWidth={2.5} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {visibles.length < productos.length && (
              <div className="mt-8 md:mt-12 text-center px-4 mb-6 md:mb-8">
                <button 
                  onClick={() => setPagina(p => p + 1)} 
                  className="w-full max-w-xs mx-auto px-6 md:px-10 py-3 bg-white border border-gray-200 text-slate-700 font-bold text-sm rounded-xl shadow-sm hover:shadow-md hover:border-red-200 hover:text-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Cargar más repuestos</span>
                  <span className="text-xs opacity-60">({productos.length - visibles.length} restantes)</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
             <div className="bg-slate-50 p-6 rounded-full mb-6 animate-pulse">
                <Search className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">
               {busqueda ? "No encontramos repuestos" : "Sin resultados"}
             </h3>
             <p className="text-slate-500 max-w-xs mx-auto mb-6">
               Intenta cambiar los términos de búsqueda o filtros.
             </p>
             <div className="flex gap-3">
               {busqueda && (
                 <button 
                   onClick={() => setBusqueda('')} 
                   className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                 >
                  Limpiar búsqueda
                 </button>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
});