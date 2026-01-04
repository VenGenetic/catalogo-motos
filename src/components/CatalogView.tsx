import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Bike, Heart, X, Check } from 'lucide-react';
import { optimizarImg } from '../utils/helpers';
import { APP_CONFIG, ORDEN_SECCIONES, MODELOS } from '../config/constants';
import { Producto } from '../types';
import { LazyImage } from './LazyImage';
import { HighlightedText } from './HighlightedText';

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

export const CatalogView = ({ 
  productos, isFav, toggleFav,
  filtroModelo, setFiltroModelo, 
  busqueda, setBusqueda,
  filtroSeccion, setFiltroSeccion,
  onProductClick
}: Props) => {
  const [pagina, setPagina] = useState(1);
  const [modalModelos, setModalModelos] = useState(false);
  const [busquedaModelo, setBusquedaModelo] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    setPagina(1); 
    if (busqueda || filtroModelo || filtroSeccion !== 'Todos') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [busqueda, filtroModelo, filtroSeccion]);

  useEffect(() => {
    if (modalModelos) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [modalModelos]);

  const visibles = useMemo(() => {
    return productos.slice(0, pagina * APP_CONFIG.ITEMS_PER_PAGE);
  }, [productos, pagina]);

  const modelosFiltrados = useMemo(() => {
    return MODELOS.filter(m => m.toLowerCase().includes(busquedaModelo.toLowerCase()));
  }, [busquedaModelo]);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 pb-24 pt-2 md:pt-4 px-0 md:px-8 font-sans scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* BARRA DE FILTROS */}
        <div className="sticky top-[64px] z-30 bg-gray-50/95 backdrop-blur-sm pb-3 pt-2 px-3 md:px-0 transition-all shadow-sm md:shadow-none">
          <div className="flex gap-2 mb-3">
            <button 
              onClick={() => setModalModelos(true)}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all shadow-sm text-sm font-bold border active:scale-95 ${
                filtroModelo 
                  ? 'bg-red-600 text-white border-red-600 shadow-red-200' 
                  : 'bg-white text-slate-800 border-gray-200 hover:border-red-300'
              }`}
            >
              <Bike className="w-4 h-4 mr-2" />
              <span className="truncate">{filtroModelo ? filtroModelo : 'Filtrar Moto'}</span>
            </button>
            <div className="flex-[2] relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar repuesto..."
                className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl bg-white text-base focus:ring-2 focus:ring-red-500 outline-none shadow-sm placeholder:text-gray-400"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button 
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto pb-1 scrollbar-hide scroll-smooth -mx-3 px-3 md:mx-0 md:px-0">
            <div className="flex space-x-2">
              {ORDEN_SECCIONES.map((category) => (
                <button
                  key={category}
                  onClick={() => setFiltroSeccion(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                    filtroSeccion === category 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LISTADO */}
        {visibles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 px-2 md:px-0">
              {visibles.map((product: Producto) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden relative active:scale-[0.99] transition-transform duration-100"
                  onClick={() => onProductClick(product)}
                >
                  <button 
                    className={`absolute top-2 right-2 p-1.5 rounded-full z-10 transition-colors ${
                      isFav(product.id) 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm'
                    }`}
                    onClick={(e) => { e.stopPropagation(); toggleFav(product.id); }}
                  >
                    <Heart className={`w-4 h-4 ${isFav(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  <LazyImage 
                    src={optimizarImg(product.imagen)} 
                    alt={product.nombre}
                    className="h-40 md:h-56 bg-white" 
                    imageFit="cover"
                    cropBottom={true}
                  />

                  <div className="p-3 flex flex-col flex-grow relative z-10 bg-white">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1 line-clamp-1">
                      {product.seccion}
                    </span>
                    
                    {/* CAMBIO: Eliminado 'line-clamp-2' y 'min-h' para mostrar nombre completo */}
                    <h3 className="text-xs md:text-sm font-bold text-slate-800 mb-1 leading-tight">
                      <HighlightedText text={product.nombre} highlight={busqueda} />
                    </h3>

                    <div className="mt-auto pt-2 flex items-end justify-between">
                       <span className="text-sm md:text-lg font-extrabold text-slate-900">
                         ${Number(product.precio).toFixed(2)}
                       </span>
                       {product.stock === false && (
                         <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Agotado</span>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center px-4 mb-8">
              <button 
                onClick={() => setPagina(p => p + 1)}
                className="w-full md:w-auto px-8 py-3 bg-white border-2 border-slate-100 text-slate-700 font-bold text-sm rounded-full shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Ver más productos
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-24 px-4">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">No encontramos resultados</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">Intenta con otra palabra o quita los filtros.</p>
            <button 
              onClick={() => { setBusqueda(''); setFiltroModelo(''); setFiltroSeccion('Todos'); }} 
              className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-colors"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE FILTROS (Sin cambios) */}
      {modalModelos && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setModalModelos(false)}
          />
          <div className="bg-white w-full md:max-w-xl h-[85vh] md:h-[80vh] rounded-t-3xl md:rounded-2xl flex flex-col overflow-hidden shadow-2xl z-10 animate-slide-up transform transition-transform">
            <div className="md:hidden flex justify-center pt-3 pb-1" onClick={() => setModalModelos(false)}>
               <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>
            <div className="p-4 border-b flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Selecciona tu Moto</h3>
                <p className="text-xs text-gray-500">Filtrar repuestos compatibles</p>
              </div>
              <button onClick={() => setModalModelos(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-3 bg-gray-50 border-b shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Escribe el modelo..." 
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-base shadow-sm"
                  value={busquedaModelo}
                  onChange={(e) => setBusquedaModelo(e.target.value)}
                />
                {busquedaModelo && (
                  <button onClick={() => setBusquedaModelo('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500 p-0.5">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto p-4 flex-1 bg-white scrollbar-thin">
               <div className="grid grid-cols-2 gap-2 pb-8">
                  <button 
                    onClick={() => { setFiltroModelo(''); setModalModelos(false); }} 
                    className={`p-3 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all min-h-[60px] ${
                      filtroModelo === '' ? 'border-red-600 bg-red-50 text-red-600' : 'border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:bg-white hover:border-gray-400'
                    }`}
                  >
                    {filtroModelo === '' && <Check className="w-4 h-4" />}
                    TODAS
                  </button>
                  {modelosFiltrados.map(m => (
                    <button
                      key={m}
                      onClick={() => { setFiltroModelo(m); setModalModelos(false); }}
                      className={`p-3 rounded-xl text-left text-xs font-bold border transition-all flex items-center justify-between min-h-[50px] active:scale-[0.98] ${
                        filtroModelo === m ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <span className="truncate">{m}</span>
                      {filtroModelo === m && <Check className="w-3 h-3 shrink-0 ml-1" />}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};