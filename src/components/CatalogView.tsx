import { useState, useMemo, useEffect } from 'react';
import { Search, Bike, Heart, X } from 'lucide-react';
import { optimizarImg } from '../utils/helpers';
import { APP_CONFIG, ORDEN_SECCIONES, MODELOS } from '../config/constants';
import { Producto } from '../types';

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

  // Reiniciar página al filtrar
  useEffect(() => { setPagina(1); }, [busqueda, filtroModelo, filtroSeccion]);

  const visibles = useMemo(() => {
    return productos.slice(0, pagina * APP_CONFIG.ITEMS_PER_PAGE);
  }, [productos, pagina]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-2 md:pt-4 px-0 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* BARRA DE FILTROS SUPERIOR */}
        <div className="sticky top-[64px] z-30 bg-gray-50/95 backdrop-blur-sm pb-3 pt-2 px-3 md:px-0">
          <div className="flex gap-2 mb-3">
            <button 
              onClick={() => setModalModelos(true)}
              className={`flex-1 flex items-center justify-center px-3 py-3 rounded-xl transition-colors shadow-sm text-sm font-bold border ${filtroModelo ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-800 border-gray-200'}`}
            >
              <Bike className="w-4 h-4 mr-2" />
              {filtroModelo ? filtroModelo : 'Filtrar Moto'}
            </button>
            <div className="flex-[2] relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl bg-white text-base focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto pb-1 scrollbar-hide scroll-smooth -mx-3 px-3 md:mx-0 md:px-0">
            <div className="flex space-x-2">
              {ORDEN_SECCIONES.map((category) => (
                <button
                  key={category}
                  onClick={() => setFiltroSeccion(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                    filtroSeccion === category ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GRILLA DE PRODUCTOS */}
        {visibles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-6">
              {visibles.map((product: any) => (
                <div 
                  key={product.id || Math.random()} 
                  className="bg-white md:rounded-lg shadow-sm md:border border-gray-100 flex flex-col h-full overflow-hidden relative active:opacity-90 transition-opacity"
                  onClick={() => onProductClick(product)}
                >
                  <button 
                    className={`absolute top-2 right-2 p-1.5 rounded-full z-10 ${isFav(product.id) ? 'bg-red-100 text-red-600' : 'bg-black/10 text-white backdrop-blur-sm'}`}
                    onClick={(e) => { e.stopPropagation(); toggleFav(product.id); }}
                  >
                    <Heart className={`w-4 h-4 ${isFav(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  <div className="h-40 md:h-56 overflow-hidden bg-gray-100 relative">
                    <img 
                      src={optimizarImg(product.imagen)} 
                      alt={product.nombre} 
                      className="w-full h-full object-cover object-top scale-[1.15] origin-top" 
                      style={{ clipPath: 'inset(0 0 25% 0)' }}
                      loading="lazy" 
                    />
                  </div>

                  <div className="p-3 flex flex-col flex-grow relative z-10 bg-white">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1 line-clamp-1">{product.seccion}</span>
                    <h3 className="text-xs md:text-sm font-bold text-slate-800 mb-1 line-clamp-2 leading-tight min-h-[2.5em]">{product.nombre}</h3>
                    <div className="mt-auto pt-2">
                       <span className="text-sm md:text-lg font-extrabold text-slate-900 block">${Number(product.precio).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center px-4">
              <button 
                onClick={() => setPagina(p => p + 1)}
                className="w-full md:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-full shadow-sm active:bg-gray-50"
              >
                Cargar más
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 px-4">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-gray-900 font-medium">Sin resultados</h3>
            <button onClick={() => { setBusqueda(''); setFiltroModelo(''); setFiltroSeccion('Todos'); }} className="mt-2 text-red-600 font-bold text-sm">Limpiar filtros</button>
          </div>
        )}
      </div>

      {/* MODAL DE FILTRAR MOTO */}
      {modalModelos && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg h-auto max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-slate-900">Selecciona tu Moto</h3>
              <button onClick={() => setModalModelos(false)} className="p-2 bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-3 bg-white border-b">
              <input 
                type="text" 
                placeholder="Buscar modelo..." 
                className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none text-base"
                value={busquedaModelo}
                onChange={(e) => setBusquedaModelo(e.target.value)}
              />
            </div>
            <div className="overflow-y-auto p-4 grid grid-cols-2 gap-2 content-start">
              <button onClick={() => { setFiltroModelo(''); setModalModelos(false); }} className="p-3 rounded-xl border border-dashed border-red-300 bg-red-50 text-red-600 font-bold text-sm">TODAS</button>
              {MODELOS.filter(m => m.toLowerCase().includes(busquedaModelo.toLowerCase())).map(m => (
                <button
                  key={m}
                  onClick={() => { setFiltroModelo(m); setModalModelos(false); }}
                  className={`p-3 rounded-xl text-left text-xs font-bold border ${filtroModelo === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 border-gray-100'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};