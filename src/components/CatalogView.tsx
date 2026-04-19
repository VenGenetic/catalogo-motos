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
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-32 pt-2 md:pt-4 px-2 md:px-8 font-sans scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* BARRA SUPERIOR */}
        <div className="sticky top-[64px] z-30 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md pb-2 pt-2 px-1 md:px-0 transition-all border-b border-gray-100/50 dark:border-slate-800/50 md:border-none">
          <div className="flex gap-2 mb-3 items-center">
            <button 
              onClick={handleCambiarMoto}
              className="h-[52px] w-[52px] flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-all hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 shrink-0"
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
                    <span className="font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700 shadow-sm">
                      Global
                    </span>
                )}
             </div>
             <div className="flex items-center gap-2">
                <span className="text-gray-400">{visibles.length} resultados</span>
                <div className="flex items-center gap-1 text-gray-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-slate-700">
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
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
                    filtroSeccion === category 
                      ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 border-gray-900 dark:border-slate-100 shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95'
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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6 px-0 md:px-0">
              {visibles.map((product: Producto) => (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 flex flex-col h-full overflow-hidden relative transition-all duration-300 hover:shadow-xl hover:border-gray-200 dark:hover:border-slate-600 hover:-translate-y-1 active:scale-[0.98] [content-visibility:auto] [contain-intrinsic-size:300px]"
                  onClick={() => onProductClick(product)}
                >
                  {/* Corazón pequeño (como pediste) */}
                  <button 
                    className={`absolute top-2 right-2 p-1.5 rounded-full z-20 transition-all duration-200 ${
                      isFav(product.id) 
                        ? 'text-red-500 scale-110' 
                        : 'text-gray-300 dark:text-gray-500 bg-transparent hover:text-red-400'
                    }`}
                    onClick={(e) => { e.stopPropagation(); toggleFav(product.id); }}
                  >
                    <Heart className={`w-4 h-4 ${isFav(product.id) ? 'fill-current' : ''}`} strokeWidth={2.5} />
                  </button>

                  <div className="relative h-28 md:h-40 bg-white dark:bg-slate-800 overflow-hidden p-2 rounded-t-xl">
                    <LazyImage 
                      src={optimizarImg(product.imagen)} 
                      alt={product.nombre}
                      className="w-full h-full rounded-xl transition-transform duration-500 group-hover:scale-105" 
                      cropBottom={false}
                    />
                    
                    {product.stock === false && (
                         <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 text-white text-[10px] py-1 text-center font-bold">
                           AGOTADO
                         </div>
                    )}
                  </div>

                  <div className="p-3 md:p-4 flex flex-col flex-grow relative z-10 bg-white dark:bg-slate-800">
                    <div className="mb-1 flex items-center justify-between gap-1">
                        <span className="inline-block px-1.5 py-0.5 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-gray-300 text-[9px] font-bold uppercase tracking-wide border border-gray-100 dark:border-slate-600">
                        {product.seccion}
                        </span>
                        
                        {/* Logo de LV PARTS integrado en la parte superior */}
                        <div className="flex items-center gap-0.5 font-black text-[11px] tracking-tighter pointer-events-none select-none shrink-0">
                          <span className="text-slate-900 dark:text-white">LV</span>
                          <span className="text-red-600 italic">PARTS</span>
                        </div>
                    </div>

                    {product.origenes?.length ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {product.origenes.map((origen) => (
                          <span
                            key={origen}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              origen.toLowerCase().includes('guayaquil')
                                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800'
                                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                            }`}
                          >
                            {origen}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    
                    {/* Título: Muestra TODO el texto (sin truncate) */}
                    <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      <HighlightedText text={product.nombre} highlight={busqueda} />
                    </h3>
                    

                    <div className="mt-auto flex items-center justify-between">
                       <span className="text-sm md:text-lg font-extrabold text-gray-900 dark:text-white">
                         ${Number(product.precio).toFixed(2)}
                       </span>
                       
                       {/* Botón rápido (como pediste) */}
                       <button
                         onClick={(e) => handleQuickAdd(e, product)}
                         disabled={!product.stock}
                         className={`p-2 rounded-full transition-all shadow-sm flex items-center justify-center ${
                            product.stock 
                              ? 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-red-600 dark:hover:bg-red-600 hover:scale-110 hover:shadow-red-200' 
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'
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
                  className="w-full max-w-xs mx-auto px-6 md:px-10 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-gray-200 font-bold text-sm rounded-xl shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-slate-600 hover:text-red-600 dark:hover:text-red-400 transition-all active:scale-95 flex items-center justify-center gap-2"
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