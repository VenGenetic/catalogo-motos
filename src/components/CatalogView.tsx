import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { ArrowLeft, Search, ShoppingBag, Copy, Check, X, Clipboard, SlidersHorizontal, ChevronRight } from 'lucide-react';
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
  const [showModelSheet, setShowModelSheet] = useState(false);
  
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
    setShowModelSheet(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAllFilters = () => {
    setFiltroModelo('');
    setBusqueda('');
    setFiltroSeccion('Todos');
    setShowModelSheet(false);
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

  // Buscador + lista de modelos, compartida entre el sidebar de escritorio y el bottom-sheet móvil
  const renderModelPicker = () => (
    <>
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Buscar modelo..."
          value={busquedaModelo}
          onChange={(e) => setBusquedaModelo(e.target.value)}
          className="w-full rounded-xl border border-ui-border bg-ui-muted py-2.5 pl-8 pr-8 text-sm text-ui-ink outline-none transition-colors placeholder:text-ui-copy/70 focus:border-brand-orange"
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        {busquedaModelo && (
          <button
            onClick={() => setBusquedaModelo('')}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ui-copy hover:bg-brand-orange/10 hover:text-brand-orange"
            aria-label="Limpiar búsqueda de modelo"
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
              ? 'text-brand-orange bg-brand-orange/10 font-extrabold shadow-sm'
              : 'text-ui-ink hover:bg-ui-muted hover:text-brand-orange'
          }`}
        >
          <span>Ver Todos los Modelos</span>
          {!filtroModelo && <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>}
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
                    ? 'text-brand-orange bg-brand-orange/10 font-extrabold shadow-sm border-l-4 border-brand-orange pl-2'
                    : 'border-l-4 border-transparent pl-3 text-ui-ink hover:bg-ui-muted hover:text-brand-orange'
                }`}
              >
                <span className="truncate pr-2">{modelo}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0"></span>}
              </button>
            );
          })
        )}
      </nav>
    </>
  );

  // MODO CATÁLOGO CON SIDEBAR DE MODELOS
  return (
    <div ref={containerRef} className="min-h-screen scroll-mt-20 bg-ui-canvas px-2 pb-32 pt-2 font-sans text-ui-ink min-[380px]:px-3 md:px-8 md:pt-4">
      <div className="max-w-7xl mx-auto">
        
        {/* BARRA SUPERIOR STICKY */}
        <div className="sticky top-16 z-sticky border-b border-ui-border/70 bg-ui-canvas/95 px-1 pb-2 pt-2 backdrop-blur-md transition-all md:top-20 md:border-none md:px-0">
          <div className="flex gap-2 mb-3 items-center">
            {(filtroModelo || busqueda) && (
              <button 
                onClick={handleClearAllFilters}
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-ui-border bg-ui-surface text-ui-ink shadow-sm transition-all hover:border-brand-orange/25 hover:bg-ui-muted active:scale-95"
                aria-label="Limpiar filtros y volver"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}

            <div className="relative z-dropdown flex-1">
              <SearchBar
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                productos={productos}
                filtroModelo={filtroModelo}
              />
            </div>
          </div>
          
          <div className="mb-2 flex items-center justify-between px-1 text-xs text-ui-copy">
             <div className="flex items-center gap-2">
                <span className="hidden md:inline">Viendo:</span>
                {filtroModelo ? (
                    <span className="font-extrabold text-brand-orange bg-brand-orange/10 px-2 py-1 rounded-md border border-brand-orange/20 flex items-center gap-1.5 shadow-sm">
                      <span>{filtroModelo}</span>
                      <button
                        onClick={() => setFiltroModelo('')}
                        className="hover:bg-brand-orange/20 p-0.5 rounded-full transition-colors active:scale-90 flex items-center justify-center"
                        title="Quitar filtro"
                      >
                        <X className="w-3 h-3" strokeWidth={3} />
                      </button>
                    </span>
                ) : (
                    <span className="rounded-md border border-ui-border bg-ui-surface px-2 py-1 font-bold text-ui-ink shadow-sm">
                      Todos los modelos
                    </span>
                )}
                {filtroSeccion !== 'Todos' && (
                    <span className="font-extrabold text-brand-orange bg-brand-orange/10 px-2 py-1 rounded-md border border-brand-orange/20 flex items-center gap-1.5 shadow-sm">
                      <span>{filtroSeccion}</span>
                      <button
                        onClick={() => setFiltroSeccion('Todos')}
                        className="hover:bg-brand-orange/20 p-0.5 rounded-full transition-colors active:scale-90 flex items-center justify-center"
                        title="Quitar filtro de categoría"
                      >
                        <X className="w-3 h-3" strokeWidth={3} />
                      </button>
                    </span>
                )}
             </div>
             <div className="flex items-center gap-2">
                <span className="text-ui-copy/80">
                  {`${visibles.length} de ${productos.length} repuestos`}
                </span>
             </div>
          </div>

          {/* Selector de modelo — visible solo en móvil, ya que el sidebar queda oculto ahí */}
          <button
            onClick={() => setShowModelSheet(true)}
            className="flex min-h-[48px] w-full items-center justify-between gap-2 rounded-2xl border border-ui-border bg-ui-surface px-4 py-3 shadow-sm transition-all active:scale-[0.98] md:hidden"
          >
            <span className="flex items-center gap-2 truncate text-sm font-bold text-ui-ink">
              <SlidersHorizontal className="w-4 h-4 text-brand-orange shrink-0" />
              <span className="truncate">{filtroModelo ? `Modelo: ${filtroModelo}` : 'Buscar por modelo de moto'}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        </div>

        {/* CONTENEDOR DE DOS COLUMNAS */}
        <div className="mt-4 flex flex-col items-start gap-5 md:flex-row md:gap-6">
          
          {/* COLUMNA PRINCIPAL (LISTADO) */}
          <div className="flex-1 w-full">
            
            {
              /* CASO B: SE BUSCA O FILTRA -> Mostrar listado de repuestos */
              <div className="animate-fade-in">
                {visibles.length > 0 ? (
                  <>
                    {filtroModelo && (
                      <div className="surface-card mb-6 flex flex-col items-center gap-5 rounded-[1.5rem] p-4 md:flex-row md:gap-6 md:p-6">
                        {/* Contenedor de la Imagen con zoom */}
                        <div className="model-media-shell group relative flex w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-ui-border p-3 shadow-inner md:aspect-[4/3] md:w-72">
                          <ImageZoom 
                            src={getMotoImage(filtroModelo)} 
                            alt={filtroModelo}
                            className="w-full h-full"
                          />
                        </div>

                        {/* Detalles del modelo */}
                        <div className="flex-1 text-center md:text-left">
                          <span className="rounded-full border border-brand-orange/20 bg-brand-orange/10 px-3 py-1 font-geist text-[11px] font-bold uppercase tracking-widest text-brand-orange">
                            Modelo Daytona
                          </span>
                          <h2 className="mb-2 mt-3 font-anton text-3xl uppercase tracking-wider text-ui-ink md:text-4xl">
                            {filtroModelo}
                          </h2>
                          <p className="max-w-xl font-hanken text-xs uppercase leading-relaxed tracking-wide text-ui-copy md:text-sm">
                            Catálogo completo de repuestos originales Daytona disponibles en inventario. Toca la imagen para ampliar los detalles técnicos del modelo.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-3 px-0 min-[380px]:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                      {visibles.map((product: Producto) => (
                        <div
                          key={product.id}
                          className="surface-card-interactive group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] active:scale-[0.985] [contain-intrinsic-size:300px] [content-visibility:auto] md:rounded-[1.4rem]"
                          onClick={() => onProductClick(product)}
                        >
                          <div className="product-media-shell relative w-full overflow-hidden border-b border-ui-border p-2">
                            <LazyImage 
                              src={optimizarImg(product.imagen)} 
                              fallbackSrc={`/imagenes_repuestos/${product.codigo_referencia}.webp`}
                              alt={product.nombre}
                              className="h-full w-full rounded-[0.9rem] transition-transform duration-500 group-hover:scale-[1.035]"
                              cropBottom={false}
                              imageFit="contain"
                            />
                            
                            {product.stock === false && (
                              <div className="absolute bottom-0 left-0 right-0 bg-brand-bg/92 py-1.5 text-center font-geist text-[10px] font-bold tracking-wide text-white">
                                AGOTADO
                              </div>
                            )}
                            
                            {/* Badges de estado del producto */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {product.is_discontinued && (
                                <span className="inline-flex items-center rounded-md bg-red-700/95 px-2 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                                  DESCONTINUADO
                                </span>
                              )}
                              {product.is_active === false && !product.is_discontinued && (
                                <span className="inline-flex items-center rounded-md bg-brand-orange-action/95 px-2 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                                  INACTIVO
                                </span>
                              )}
                              {(!product.precio || product.precio === 0) && (
                                <span className="inline-flex items-center rounded-md bg-brand-bg/85 px-2 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                                  SIN PRECIO
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="relative z-10 flex flex-grow flex-col p-3 md:p-4">
                            <div className="mb-1.5">
                              <span className="inline-block rounded-md border border-ui-border bg-ui-muted px-2 py-1 font-geist text-[10px] font-bold uppercase tracking-wide text-ui-copy">
                                {product.seccion}
                              </span>
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
                            
                            <h3
                              className="mb-1.5 min-h-[48px] line-clamp-3 text-xs font-semibold leading-snug text-ui-ink transition-colors group-hover:text-brand-orange md:min-h-[58px] md:text-sm"
                              title={product.nombre}
                            >
                              {product.nombre}
                            </h3>
                            
                            {product.codigo_referencia && (
                              <div className="mb-2 flex items-center">
                                <button
                                  onClick={(e) => handleCopySku(e, product.codigo_referencia!, product.id)}
                                  className="mr-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-ui-copy transition-colors hover:bg-ui-muted hover:text-brand-orange"
                                  title="Copiar código de referencia"
                                >
                                  {copiedId === product.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                </button>
                                <span className="truncate rounded border border-ui-border bg-ui-muted px-1.5 py-1 font-mono text-[10px] text-ui-copy">
                                  Ref: {product.codigo_referencia}
                                </span>
                              </div>
                            )}
                            
                            <div className="mt-auto flex flex-col gap-2 pt-2 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
                              <span className={`text-lg font-extrabold tracking-tight md:text-xl ${product.precio ? 'text-ui-ink' : 'italic text-ui-copy'}`}>
                                {product.precio ? `$${Number(product.precio).toFixed(2)}` : 'Sin precio'}
                              </span>

                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={(e) => handleShare(e, product)}
                                  className="touch-target flex items-center justify-center rounded-xl border border-ui-border bg-ui-muted text-ui-copy shadow-sm transition-all hover:border-brand-orange/25 hover:bg-brand-orange/10 hover:text-brand-orange active:scale-95"
                                  title="Compartir repuesto"
                                  aria-label={`Compartir ${product.nombre}`}
                                >
                                  <Clipboard size={16} strokeWidth={2.5} />
                                </button>
                                
                                <button
                                  onClick={(e) => handleQuickAdd(e, product)}
                                  disabled={!product.stock}
                                  className={`touch-target flex items-center justify-center rounded-xl shadow-sm transition-all duration-300 active:scale-95 ${
                                    product.stock 
                                      ? 'bg-brand-bg text-white hover:bg-brand-orange-action primary-button-glow'
                                      : 'cursor-not-allowed bg-ui-muted text-ui-copy/45'
                                  }`}
                                  aria-label={product.stock ? `Agregar ${product.nombre} al pedido` : `${product.nombre} agotado`}
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
                          className="mx-auto flex min-h-[48px] w-full max-w-sm items-center justify-center gap-2 rounded-xl border border-ui-border bg-ui-surface px-6 py-3 text-sm font-bold text-ui-ink shadow-sm transition-all hover:border-brand-orange/30 hover:text-brand-orange hover:shadow-md active:scale-95 md:px-10"
                        >
                          <span>Cargar más repuestos</span>
                          <span className="text-xs opacity-60">({productos.length - visibles.length} restantes)</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
                    <div className="mb-6 rounded-2xl border border-ui-border bg-ui-muted p-6">
                      <Search className="h-10 w-10 text-ui-copy/55" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-ui-ink">
                      {busqueda ? "No encontramos repuestos" : "Sin resultados"}
                    </h3>
                    <p className="mx-auto mb-6 max-w-xs text-ui-copy">
                      Intenta cambiar los términos de búsqueda o filtros.
                    </p>
                    <div className="flex gap-3">
                      {busqueda && (
                        <button 
                          onClick={() => setBusqueda('')} 
                          className="min-h-[44px] rounded-lg bg-ui-muted px-4 py-2 font-medium text-ui-ink transition-colors hover:bg-ui-raised"
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
          <aside className="surface-card sticky top-[148px] hidden max-h-[calc(100vh-176px)] w-72 shrink-0 overflow-y-auto rounded-[1.25rem] p-5 md:block">
            <h2 className="mb-3 border-b border-ui-border pb-2 font-geist text-[11px] font-black uppercase tracking-[0.16em] text-ui-copy">
              Modelos Daytona
            </h2>
            {renderModelPicker()}
          </aside>

        </div>

      </div>

      {/* BOTTOM SHEET DE MODELOS - Solo móvil */}
      {showModelSheet && (
        <div className="fixed inset-0 z-modal flex items-end md:hidden">
          <div
            className="absolute inset-0 bg-brand-bg/72 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowModelSheet(false)}
          />
          <div className="relative flex max-h-[82dvh] w-full flex-col rounded-t-[1.75rem] border border-ui-border bg-ui-surface shadow-2xl animate-slide-up">
            <div className="flex shrink-0 items-center justify-between border-b border-ui-border p-4">
              <h2 className="font-geist text-[11px] font-black uppercase tracking-[0.16em] text-ui-copy">
                Modelos Daytona
              </h2>
              <button
                onClick={() => setShowModelSheet(false)}
                className="touch-target -mr-2 flex items-center justify-center rounded-xl text-ui-copy transition-all hover:bg-ui-muted hover:text-ui-ink active:scale-90"
                aria-label="Cerrar selector de modelos"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto pb-safe">
              {renderModelPicker()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
