import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { Search, Heart, X, ArrowLeft } from 'lucide-react'; 
import { optimizarImg } from '../utils/helpers';
import { APP_CONFIG, ORDEN_SECCIONES } from '../config/constants';
import { Producto } from '../types';
import { LazyImage } from './LazyImage';
import { HighlightedText } from './HighlightedText';
// IMPORTAMOS EL NUEVO COMPONENTE DE FOTOS
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

  // Resetear paginación al cambiar filtros
  useEffect(() => { 
    setPagina(1); 
    if (busqueda || filtroSeccion !== 'Todos') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [busqueda, filtroModelo, filtroSeccion]);

  const visibles = useMemo(() => {
    return productos.slice(0, pagina * APP_CONFIG.ITEMS_PER_PAGE);
  }, [productos, pagina]);

  // Función para volver al selector de fotos
  const handleCambiarMoto = () => {
    setFiltroModelo(''); 
    setBusqueda('');
    setFiltroSeccion('Todos');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // --------------------------------------------------------
  // 1. SI NO HA ELEGIDO MOTO -> MOSTRAR FOTOS (MotoSelector)
  // --------------------------------------------------------
  if (!filtroModelo) {
    return (
      <MotoSelector onSelectModel={(modelo) => {
        setFiltroModelo(modelo);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
    );
  }

  // --------------------------------------------------------
  // 2. SI ELIGIÓ MOTO -> MOSTRAR CATÁLOGO DE REPUESTOS
  // --------------------------------------------------------
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 pb-24 pt-2 md:pt-4 px-0 md:px-8 font-sans scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* BARRA SUPERIOR FIJA */}
        <div className="sticky top-[64px] z-30 bg-gray-50/95 backdrop-blur-sm pb-3 pt-2 px-3 md:px-0 transition-all shadow-sm md:shadow-none">
          
          <div className="flex gap-2 mb-3">
            {/* Botón Volver / Cambiar Moto */}
            <button 
              onClick={handleCambiarMoto}
              className="flex items-center justify-center px-3 py-3 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200 text-sm font-bold active:scale-95 transition-all hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Cambiar Moto</span>
              <span className="md:hidden">Atrás</span>
            </button>

            {/* Buscador de repuestos */}
            <div className="flex-[2] relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Repuestos para ${filtroModelo}...`}
                className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl bg-white text-base focus:ring-2 focus:ring-red-500 outline-none shadow-sm placeholder:text-gray-400"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Aviso visual de moto actual */}
          <div className="mb-2 px-1 flex items-center text-xs text-gray-500">
             Viendo catálogo de: <span className="ml-1 font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">{filtroModelo}</span>
          </div>

          {/* Filtros de Categoría */}
          <div className="overflow-x-auto pb-1 scrollbar-hide scroll-smooth -mx-3 px-3 md:mx-0 md:px-0">
            <div className="flex space-x-2">
              {ORDEN_SECCIONES.map((category) => (
                <button
                  key={category}
                  onClick={() => setFiltroSeccion(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                    filtroSeccion === category 
                      ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 px-2 md:px-0">
              {visibles.map((product: Producto) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden relative active:scale-[0.99] transition-transform duration-100"
                  onClick={() => onProductClick(product)}
                >
                  <button 
                    className={`absolute top-2 right-2 p-2 rounded-full z-10 transition-colors ${
                      isFav(product.id) ? 'bg-red-50 text-red-600' : 'bg-black/40 text-white hover:bg-black/60'
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
            
            {visibles.length < productos.length && (
              <div className="mt-10 text-center px-4 mb-8">
                <button onClick={() => setPagina(p => p + 1)} className="w-full md:w-auto px-8 py-3 bg-white border-2 border-slate-100 text-slate-700 font-bold text-sm rounded-full shadow-sm hover:bg-gray-50">
                  Ver más productos
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 px-4">
             <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">No encontramos repuestos</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">Prueba con otro nombre o cambia de sección.</p>
            <button 
              onClick={() => { setBusqueda(''); setFiltroSeccion('Todos'); }} 
              className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg text-sm shadow-lg shadow-red-200"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  );
});