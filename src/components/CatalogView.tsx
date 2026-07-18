import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { ArrowLeft, Search, ShoppingBag, Copy, Check, X, Clipboard } from 'lucide-react'; 
import { optimizarImg } from '../utils/helpers';
import { APP_CONFIG, MODELOS } from '../config/constants';
import { Producto } from '../types';
import { LazyImage } from './LazyImage';
import { SearchBar } from './SearchBar';
import { getMotoImage } from '../config/motoImages';
import { useCart } from '../context/CartContext';
import { ImageZoom } from './ImageZoom';
import { useToast } from '../context/ToastContext';
import { shareProductAsImage } from '../utils/shareHelper';

interface Props {
  productos: Producto[];
  filtroModelo: string;
  setFiltroModelo: (m: string) => void;
  busqueda: string;
  setBusqueda: (s: string) => void;
  filtroSeccion: string;
  setFiltroSeccion: (s: string) => void;
  onProductClick: (p: Producto) => void;
}

export const CatalogView = memo(({ 
  productos,
  filtroModelo, setFiltroModelo, 
  busqueda, setBusqueda,
  filtroSeccion, setFiltroSeccion,
  onProductClick
}: Props) => {
  const [pagina, setPagina] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busquedaModelo, setBusquedaModelo] = useState('');
  
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleShare = async (e: React.MouseEvent, product: Producto) => {
    e.stopPropagation();
    await shareProductAsImage(product, showToast);
  };

  const modelosFiltrados = useMemo(() => {
    if (!busquedaModelo.trim()) return MODELOS;
    const term = busquedaModelo.toLowerCase();
    return MODELOS.filter(m => m.toLowerCase().includes(term));
  }, [busquedaModelo]);

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

  const handleSelectModelFromLayout = (modeloName: string) => {
    const term = modeloName.split(' ')[0];
    setFiltroModelo(term); 
    setBusqueda('');
    setFiltroSeccion('Todos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAllFilters = () => {
    setFiltroModelo(''); 
    setBusqueda('');
    setFiltroSeccion('Todos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Producto) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleCopySku = (e: React.MouseEvent, sku: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // MODO CATÁLOGO CON SIDEBAR DE MODELOS
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-32 pt-2 md:pt-4 px-2 md:px-8 font-sans scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* BARRA SUPERIOR STICKY */}
        <div className="sticky top-[80px] z-30 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md pb-2 pt-2 px-1 md:px-0 transition-all border-b border-gray-100/50 dark:border-slate-800/50 md:border-none">
          <div className="flex gap-2 mb-3 items-center">
            {(filtroModelo || busqueda) && (
              <button 
                onClick={handleClearAllFilters}
                className="h-[52px] w-[52px] flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-all hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 shrink-0"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}

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
                    <span className="font-extrabold text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-md border border-red-100 dark:border-red-900/50 flex items-center gap-1.5 shadow-sm">
                      <span>{filtroModelo}</span>
                      <button
                        onClick={() => setFiltroModelo('')}
                        className="hover:bg-red-200/50 dark:hover:bg-red-900/40 p-0.5 rounded-full transition-colors active:scale-90 flex items-center justify-center"
                        title="Quitar filtro"
                      >
                        <X className="w-3 h-3" strokeWidth={3} />
                      </button>
                    </span>
                ) : (
                    <span className="font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700 shadow-sm">
                      Todos los modelos
                    </span>
                )}
             </div>
             <div className="flex items-center gap-2">
                <span className="text-gray-400">
                  {`${visibles.length} de ${productos.length} repuestos`}
                </span>
             </div>
          </div>
        </div>

        {/* CONTENEDOR DE DOS COLUMNAS */}
        <div className="flex flex-col md:flex-row gap-6 mt-4 items-start">
          
          {/* COLUMNA PRINCIPAL (LISTADO) */}
          <div className="flex-1 w-full">
            
            {
              /* CASO B: SE BUSCA O FILTRA -> Mostrar listado de repuestos */
              <div className="animate-fade-in">
                {visibles.length > 0 ? (
                  <>
                    {filtroModelo && (
                      <div className="bg-white dark:bg-slate-900 border-t border-l border-slate-200/70 dark:border-slate-800/60 rounded-3xl p-4 md:p-6 mb-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                        {/* Contenedor de la Imagen con zoom */}
                        <div className="w-full md:w-72 shrink-0 aspect-[4/3] md:aspect-[16/11] bg-slate-50 dark:bg-slate-950/20 rounded-2xl overflow-hidden border-t border-l border-slate-200/70 dark:border-slate-800/55 flex items-center justify-center p-2 relative shadow-inner group">
                          <ImageZoom 
                            src={getMotoImage(filtroModelo)} 
                            alt={filtroModelo}
                            className="w-full h-full"
                          />
                        </div>

                        {/* Detalles del modelo */}
                        <div className="flex-1 text-center md:text-left">
                          <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest font-geist bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/15">
                            Modelo Daytona
                          </span>
                          <h2 className="font-anton text-2xl md:text-4xl text-slate-800 dark:text-white uppercase mt-3 mb-2 tracking-wider">
                            {filtroModelo}
                          </h2>
                          <p className="font-hanken text-xs md:text-sm text-slate-500 dark:text-gray-400 max-w-xl uppercase tracking-wide">
                            Catálogo completo de repuestos originales Daytona disponibles en inventario. Toca la imagen para ampliar los detalles técnicos del modelo.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 px-0">
                      {visibles.map((product: Producto) => (
                        <div
                          key={product.id}
                          className="group bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border-t border-l border-slate-200/70 dark:border-slate-800/60 flex flex-col h-full overflow-hidden relative transition-all duration-300 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 active:scale-[0.98] [content-visibility:auto] [contain-intrinsic-size:300px]"
                          onClick={() => onProductClick(product)}
                        >
                          <div className="relative w-full aspect-[1024/535] bg-slate-50 dark:bg-slate-950/20 overflow-hidden p-2 border-b border-slate-100/50 dark:border-slate-800/50">
                            <LazyImage 
                              src={optimizarImg(product.imagen)} 
                              alt={product.nombre}
                              className="w-full h-full rounded-2xl transition-transform duration-500 group-hover:scale-105" 
                              cropBottom={false}
                              imageFit="contain"
                            />
                            
                            {product.stock === false && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 text-white text-[10px] py-1 text-center font-bold">
                                AGOTADO
                              </div>
                            )}
                            
                            {/* Badges de estado del producto */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {product.is_discontinued && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-600/90 text-white text-[9px] font-bold backdrop-blur-sm shadow-sm">
                                  DESCONTINUADO
                                </span>
                              )}
                              {product.is_active === false && !product.is_discontinued && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-orange-500/90 text-white text-[9px] font-bold backdrop-blur-sm shadow-sm">
                                  INACTIVO
                                </span>
                              )}
                              {(!product.precio || product.precio === 0) && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-700/80 text-white text-[9px] font-bold backdrop-blur-sm shadow-sm">
                                  SIN PRECIO
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-3 md:p-4 flex flex-col flex-grow relative z-10">
                            <div className="mb-1 flex items-center justify-between gap-1">
                              <span className="inline-block px-1.5 py-0.5 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-gray-300 text-[9px] font-bold uppercase tracking-wide border border-gray-100 dark:border-slate-600">
                                {product.seccion}
                              </span>
                              
                              {/* Logo de LV PARTS */}
                              <div className="flex items-center gap-0.5 font-black text-[11px] tracking-tighter pointer-events-none select-none shrink-0">
                                <span className="text-slate-900 dark:text-white">LV</span>
                                <span className="text-red-600 italic">PARTS</span>
                              </div>
                            </div>

                            {product.stock && product.origenes?.length ? (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {product.origenes.map((origen) => (
                                  <span
                                    key={origen}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      origen.toLowerCase().includes('stock')
                                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800'
                                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                                    }`}
                                  >
                                    {origen}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            
                            <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5 leading-snug group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                              {product.nombre}
                            </h3>
                            
                            {product.codigo_referencia && (
                              <div className="mb-2 flex items-center">
                                <button
                                  onClick={(e) => handleCopySku(e, product.codigo_referencia!, product.id)}
                                  className="mr-1.5 p-1 rounded-md text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                  title="Copiar código de referencia"
                                >
                                  {copiedId === product.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                </button>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono bg-gray-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-gray-100 dark:border-slate-700">
                                  Ref: {product.codigo_referencia}
                                </span>
                              </div>
                            )}
                            
                            <div className="mt-auto flex items-center justify-between">
                              <span className={`text-sm md:text-lg font-extrabold ${product.precio ? 'text-gray-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 italic'}`}>
                                {product.precio ? `$${Number(product.precio).toFixed(2)}` : 'Sin precio'}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => handleShare(e, product)}
                                  className="p-2 rounded-full bg-gray-50 dark:bg-slate-700 text-slate-650 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-600 dark:hover:text-rose-400 transition-all shadow-sm flex items-center justify-center hover:scale-110 active:scale-95"
                                  title="Compartir repuesto"
                                >
                                  <Clipboard size={16} strokeWidth={2.5} />
                                </button>
                                
                                <button
                                  onClick={(e) => handleQuickAdd(e, product)}
                                  disabled={!product.stock}
                                  className={`p-2 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center ${
                                    product.stock 
                                      ? 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-brand-orange dark:hover:bg-brand-orange primary-button-glow hover:scale-110' 
                                      : 'bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  <ShoppingBag size={16} strokeWidth={2.5} />
                                </button>
                              </div>
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
            }

          </div>

          {/* COLUMNA DERECHA (SIDEBAR DE MODELOS) - Oculto en móviles */}
          <aside className="w-72 shrink-0 hidden md:block sticky top-[150px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">
              Modelos Daytona
            </h2>
            
            {/* Buscador de modelos */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar modelo..."
                value={busquedaModelo}
                onChange={(e) => setBusquedaModelo(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-red-500 dark:focus:border-red-500 outline-none text-slate-750 dark:text-white transition-colors"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              {busquedaModelo && (
                <button
                  onClick={() => setBusquedaModelo('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <nav className="flex flex-col space-y-1">
              <button
                onClick={handleClearAllFilters}
                className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                  !filtroModelo 
                    ? 'text-red-600 bg-red-50 dark:bg-red-950/20 font-extrabold shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-50 dark:hover:bg-slate-850'
                }`}
              >
                <span>Ver Todos los Modelos</span>
                {!filtroModelo && <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>}
              </button>
              
              {modelosFiltrados.length === 0 ? (
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
                  No se encontraron modelos
                </p>
              ) : (
                modelosFiltrados.map((modelo) => {
                  const term = modelo.split(' ')[0];
                  const isSelected = filtroModelo.toLowerCase() === term.toLowerCase();
                  return (
                    <button
                      key={modelo}
                      onClick={() => handleSelectModelFromLayout(modelo)}
                      className={`w-full text-left py-2.5 px-3 rounded-xl text-sm transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'text-red-600 bg-red-50 dark:bg-red-950/20 font-extrabold shadow-sm border-l-4 border-red-600 pl-2' 
                          : 'text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-50 dark:hover:bg-slate-850 border-l-4 border-transparent pl-3'
                      }`}
                    >
                      <span className="truncate pr-2">{modelo}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>}
                    </button>
                  );
                })
              )}
            </nav>
          </aside>

        </div>

      </div>
    </div>
  );
});