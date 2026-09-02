import { useCallback, useEffect, useMemo, useState } from 'react';
import { X, ShoppingCart, Check, AlertCircle, MessageCircle, Tag, Info, ChevronLeft, ChevronRight, MoveHorizontal, ZoomIn, Copy, Clipboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Producto } from '../types';
import { useCart } from '../context/CartContext';
import { optimizarImg } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import { shareProductAsImage } from '../utils/shareHelper';
import { trackLead } from '../utils/tracking';
import { APP_CONFIG } from '../config/constants';
import { ImageZoom } from './ImageZoom';
import { LazyImage } from './LazyImage';

interface Props {
  product: Producto | null;
  allProducts: Producto[];
  currentList?: Producto[];
  onClose: () => void;
  onSelectRelated: (p: Producto) => void;
}

export const ProductDetailModal = ({ product, allProducts, currentList, onClose, onSelectRelated }: Props) => {
  const { addToCart } = useCart();
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleShareProduct = async () => {
    if (product) {
      await shareProductAsImage(product, showToast);
    }
  };

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  
  // Detección de dispositivo para Habilitar/Deshabilitar el arrastre
  // (Usamos 1024 para asegurar que tablets también tengan habilitado el swipe)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Navegación (Siguiente / Anterior)
  const currentIndex = currentList?.findIndex(p => p.id === product?.id) ?? -1;
  const hasPrev = currentIndex > 0;
  const hasNext = Boolean(currentList && currentIndex >= 0 && currentIndex < currentList.length - 1);

  const navigateTo = useCallback((direction: 1 | -1) => {
    if (!currentList) return;
    const nextIdx = currentIndex + direction;
    if (nextIdx >= 0 && nextIdx < currentList.length) {
      onSelectRelated(currentList[nextIdx]);
    }
  }, [currentIndex, currentList, onSelectRelated]);

  // Teclado (ESC y Flechas)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) navigateTo(-1);
      if (e.key === 'ArrowRight' && hasNext) navigateTo(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, hasPrev, hasNext, navigateTo]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasNext) {
      navigateTo(1); // Deslizar Izquierda -> Siguiente
    } else if (isRightSwipe && hasPrev) {
      navigateTo(-1); // Deslizar Derecha -> Anterior
    }
  };

  // Precarga Predictiva (Evita pantalla blanca al deslizar rápido)
  useEffect(() => {
    if (!currentList) return;
    
    if (hasNext) {
       const nextImg = new Image();
       nextImg.src = optimizarImg(currentList[currentIndex + 1].imagen, 1024);
    }
    if (hasPrev) {
       const prevImg = new Image();
       prevImg.src = optimizarImg(currentList[currentIndex - 1].imagen, 1024);
    }
  }, [currentIndex, currentList, hasNext, hasPrev]);

  // Tutorial Interactivo Primera Vez
  const [showTutorial, setShowTutorial] = useState(
    () => Boolean(product && !localStorage.getItem('LVPARTS_TUTORIAL_SEEN'))
  );

  const dismissTutorial = () => {
    localStorage.setItem('LVPARTS_TUTORIAL_SEEN', 'true');
    setShowTutorial(false);
  };

  // Bloquear scroll del body
  useEffect(() => {
    if (product) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [product]);

  const relacionados = useMemo(() => {
    if (!product) return [];
    const palabras = product.nombre.split(' ').filter(p => p.length > 3).slice(0, 2);
    return allProducts
      .filter(p => 
        p.id !== product.id && 
        (p.seccion === product.seccion || palabras.some(w => p.nombre.includes(w)))
      )
      .slice(0, 4);
  }, [product, allProducts]);

  const galleryImages = useMemo(() => {
    return product?.gallery || [];
  }, [product]);

  const hasGallery = galleryImages.length > 0;

  if (!product) return null;

  const handleDirectQuote = () => {
    trackLead(product);
    const message = `Hola LV PARTS, vi este repuesto en la web: ${product.nombre} (Ref: ${product.codigo_referencia || 'S/N'}). ¿Me ayudan con más info?`;
    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.nombre,
    "image": [`${window.location.origin}${optimizarImg(product.imagen)}`],
    "description": `Repuesto ${product.nombre}. Categoría: ${product.categoria}.`,
    "sku": product.codigo_referencia || product.id,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": product.precio,
      "availability": product.stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <AnimatePresence>
      {/* Z-100 para asegurar que esté ENCIMA de todo */}
      <div className="fixed inset-0 z-modal flex items-center justify-center">
        
        <title>{`${product.nombre} | LV PARTS`}</title>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-brand-bg/88 backdrop-blur-sm" onClick={onClose} />

        {/* MODAL PRINCIPAL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          // CLAVE MÓVIL: w-full h-full (ocupa toda la pantalla)
          // CLAVE DESKTOP: Ancho máximo más generoso para mostrar bien la imagen 1024x535
          className="relative flex h-full w-full flex-col overflow-hidden overscroll-x-none bg-ui-surface shadow-2xl touch-pan-y md:h-auto md:max-h-[95vh] md:max-w-6xl md:rounded-[1.5rem] md:border md:border-ui-border lg:max-w-7xl"
          onClick={(e) => e.stopPropagation()} 
          onTouchStart={isMobile ? onTouchStart : undefined}
          onTouchMove={isMobile ? onTouchMove : undefined}
          onTouchEnd={isMobile ? onTouchEnd : undefined}
        >
            
            {/* ====== TUTORIAL OVERLAY (ÚNICA VEZ) ====== */}
            <AnimatePresence>
              {showTutorial && (
                <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }} 
                   className="absolute inset-0 z-toast flex items-center justify-center bg-brand-bg/82 p-4 backdrop-blur-sm md:p-8"
                 >
                   <motion.div
                     initial={{ scale: 0.9, y: 20 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.9, y: 20 }}
                     className="flex w-full max-w-sm flex-col overflow-hidden rounded-[1.5rem] border border-ui-border bg-ui-surface shadow-2xl"
                   >
                     {/* Encabezado Industrial */}
                     <div className="bg-slate-900 dark:bg-black text-white p-4 text-center text-sm font-black uppercase tracking-widest border-b border-slate-200 dark:border-brand-surface-3">
                       Guía Rápida
                     </div>
                     
                     <div className="p-6 md:p-8 flex flex-col gap-6">
                        <div className="flex gap-4 items-center">
                           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-ui-border bg-ui-muted">
                             <MoveHorizontal size={24} strokeWidth={2.5} className="text-brand-orange" />
                           </div>
                           <div>
                             <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white uppercase">Desliza para ver más</h4>
                             <p className="text-[11px] md:text-xs text-slate-500 font-medium">Mueve a los lados para cambiar entre repuestos rápidamente.</p>
                           </div>
                        </div>

                        <div className="flex gap-4 items-center">
                           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-ui-border bg-ui-muted">
                             <ZoomIn size={24} strokeWidth={2.5} className="text-brand-orange" />
                           </div>
                           <div>
                             <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white uppercase">Toca para ampliar</h4>
                             <p className="text-[11px] md:text-xs text-slate-500 font-medium">Pincha sobre la fotografía para inspeccionar el detalle técnico.</p>
                           </div>
                        </div>

                        <div className="flex gap-4 items-center">
                           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-ui-border bg-ui-muted">
                             <ShoppingCart size={24} strokeWidth={2.5} className="text-brand-orange" />
                           </div>
                           <div>
                             <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white uppercase">Arma tu pedido</h4>
                             <p className="text-[11px] md:text-xs text-slate-500 font-medium">Verifica código de fábrica y pásalo a tu carrito o envíalo por Whatsapp.</p>
                           </div>
                        </div>
                     </div>

                     <button 
                       onClick={dismissTutorial}
                       className="m-4 mt-0 rounded-xl border-2 border-transparent bg-brand-orange-action p-4 text-sm font-black uppercase tracking-[0.1em] text-white transition-colors hover:bg-brand-orange active:bg-brand-bg md:text-base"
                     >
                       ¡Entendido!
                     </button>
                   </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* ====== FIN TUTORIAL ====== */}
            
            {/* Botón Cerrar: Ajustado para respetar el Notch/Safe Region en móviles */}
            <div className="absolute top-0 right-0 p-3 z-30 pt-[calc(0.75rem+env(safe-area-inset-top))]">
              <button 
                onClick={onClose}
                className="touch-target flex items-center justify-center rounded-xl border border-ui-border bg-ui-surface/90 text-ui-ink shadow-sm backdrop-blur-md transition-transform hover:bg-ui-muted active:scale-90"
                aria-label="Cerrar detalle del producto"
              >
                <X size={24} />
              </button>
            </div>

            {/* ÁREA SCROLLABLE (Imagen + Info) */}
            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row pb-safe overscroll-x-none touch-pan-y">
              
              {/* COLUMNA 1: IMAGEN - Mayor en desktop para mejor visualización */}
              <div className="relative w-full shrink-0 border-b border-ui-border bg-ui-muted md:w-7/12 md:border-b-0 md:border-r lg:w-3/5">
                 
                 {/* Controles de Navegación Desktop */}
                 {hasPrev && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigateTo(-1); }}
                      className="hidden md:flex absolute top-1/2 left-3 -translate-y-1/2 z-20 w-11 h-11 bg-white/70 hover:bg-white backdrop-blur-sm rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] items-center justify-center text-slate-800 transition-all hover:scale-110 active:scale-95"
                    >
                       <ChevronLeft size={28} strokeWidth={2.5} />
                    </button>
                 )}
                 {hasNext && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigateTo(1); }}
                      className="hidden md:flex absolute top-1/2 right-3 -translate-y-1/2 z-20 w-11 h-11 bg-white/70 hover:bg-white backdrop-blur-sm rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] items-center justify-center text-slate-800 transition-all hover:scale-110 active:scale-95"
                    >
                       <ChevronRight size={28} strokeWidth={2.5} />
                    </button>
                 )}

                 {/* Aspect Ratio 1024/535 en móvil, Full Height en Desktop */}
                 <div className="product-media-shell group relative w-full md:aspect-auto md:h-full">
                   <ImageZoom 
                     src={optimizarImg(product.imagen, 1024)} 
                     fallbackSrc={`/imagenes_repuestos/${product.codigo_referencia}.webp`}
                     alt={product.nombre}
                     className="w-full h-full object-contain p-2 md:p-6" 
                   />
                   
                   <div className="absolute top-4 left-4 pointer-events-none">
                     {!product.stock ? (
                       <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded shadow-md">AGOTADO</span>
                     ) : (
                       <span className="bg-green-600 text-white px-3 py-1 text-xs font-bold rounded shadow-md flex items-center gap-1">
                          <Check size={12} strokeWidth={4} /> STOCK
                       </span>
                     )}
                   </div>
                 </div>
              </div>

              {/* COLUMNA 2: INFO */}
              <div className="w-full space-y-6 overflow-y-auto bg-ui-surface p-5 md:w-5/12 md:p-8 lg:w-2/5">
                  <div>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-slate-100 dark:bg-brand-surface-2 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 dark:border-brand-surface-3">
                          {product.seccion}
                        </span>
                        {product.codigo_referencia && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 bg-gray-50 dark:bg-brand-surface-2 px-2 py-1 rounded border border-gray-100 dark:border-brand-surface-3">
                            <button
                              onClick={(e) => handleCopy(e, product.codigo_referencia!)}
                              className="p-1 -ml-1 rounded hover:bg-gray-200 dark:hover:bg-brand-surface-3 transition-colors"
                              title="Copiar código"
                            >
                              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                            </button>
                            <Tag size={12} /> {product.codigo_referencia}
                          </span>
                        )}
                      </div>
                      
                      {/* Logo LV PARTS a color original */}
                      <div className="flex items-center gap-0.5 font-black text-[11px] md:text-sm tracking-tighter pointer-events-none select-none shrink-0">
                        <span className="text-slate-900 dark:text-white">LV</span>
                        <span className="text-brand-orange italic">PARTS</span>
                      </div>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-snug">
                      {product.nombre}
                    </h2>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-ui-border bg-ui-muted p-4">
                    <div>
                       <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">Precio</span>
                       <span className={`text-3xl font-black tracking-tight ${product.precio ? 'text-gray-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 italic text-xl'}`}>
                         {product.precio ? `$${Number(product.precio).toFixed(2)}` : 'Sin precio'}
                       </span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase block">Disponibilidad</span>
                       {product.stock ? (
                           <span className="text-sm font-bold text-green-600 dark:text-green-400">En Bodega</span>
                       ) : (
                           <span className="text-sm font-bold text-red-500 flex items-center gap-1">
                             <AlertCircle size={14}/> Agotado
                           </span>
                       )}
                       {product.stock && product.origenes?.length ? (
                         <div className="mt-1 flex flex-wrap gap-1 justify-end">
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
                    </div>
                  </div>

                  {/* Badges de estado del producto */}
                  {(product.is_discontinued || product.is_active === false || !product.precio) && (
                    <div className="flex flex-wrap gap-2">
                      {product.is_discontinued && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-800">
                          <AlertCircle size={14}/> Descontinuado
                        </span>
                      )}
                      {product.is_active === false && !product.is_discontinued && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold border border-orange-200 dark:border-orange-800">
                          <AlertCircle size={14}/> Inactivo
                        </span>
                      )}
                      {(!product.precio || product.precio === 0) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-brand-surface-3/50 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-brand-border">
                          <Info size={14}/> Sin precio registrado
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                     <Info size={16} className="shrink-0 mt-0.5" />
                     <p>Verifica que la foto y código coincidan con tu repuesto usado.</p>
                  </div>

                  {hasGallery ? (
                    <div className="pt-4 border-t border-gray-100 dark:border-brand-surface-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Galería
                      </h3>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                         {galleryImages.map((item, idx) => (
                           <div 
                              key={idx} 
                              className="w-16 h-16 shrink-0 bg-white dark:bg-brand-surface-3 rounded border border-gray-100 dark:border-brand-border overflow-hidden relative cursor-pointer"
                              onClick={() => {
                                if (item.type === 'video') {
                                  window.open(item.url, '_blank');
                                }
                              }}
                           >
                              {item.type === 'video' ? (
                                <>
                                  <video 
                                    src={item.url} 
                                    className="w-full h-full object-cover" 
                                    muted 
                                    playsInline 
                                  />
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                                      <div className="w-0 h-0 border-t-4 border-b-4 border-l-[6px] border-t-transparent border-b-transparent border-l-black ml-0.5" />
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <ImageZoom 
                                   src={optimizarImg(item.url)} 
                                   fallbackSrc={`/imagenes_repuestos/${product.codigo_referencia}.webp`}
                                   alt={`${product.nombre} - vista ${idx + 1}`}
                                   className="w-full h-full object-contain"
                                />
                              )}
                           </div>
                         ))}
                      </div>
                    </div>
                  ) : relacionados.length > 0 && (
                    <div className="pt-4 border-t border-gray-100 dark:border-brand-surface-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Relacionados
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                         {relacionados.slice(0, 2).map(rel => (
                           <div 
                              key={rel.id} 
                              className="cursor-pointer group flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-brand-surface-2 border border-transparent hover:border-gray-200 dark:hover:border-brand-surface-3 transition-all"
                              onClick={() => onSelectRelated(rel)}
                           >
                              <div className="w-10 h-10 bg-white dark:bg-brand-surface-3 rounded border border-gray-100 dark:border-brand-border shrink-0 overflow-hidden">
                                 <LazyImage 
                                    src={optimizarImg(rel.imagen)} 
                                    fallbackSrc={`/imagenes_repuestos/${rel.codigo_referencia}.webp`}
                                    alt={rel.nombre}
                                    className="w-full h-full" 
                                    imageFit="contain"
                                    cropBottom={false}
                                 />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">
                                  {rel.nombre}
                                </p>
                                <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100">
                                  ${Number(rel.precio).toFixed(2)}
                                </p>
                              </div>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* FOOTER DE ACCIONES (Siempre visible abajo) */}
            <div className="z-20 shrink-0 border-t border-ui-border bg-ui-surface p-3 pb-safe shadow-[0_-6px_24px_rgba(5,20,36,0.08)] md:p-5">
              <div className="flex gap-3 max-w-5xl mx-auto w-full">
                
                <button 
                  onClick={handleDirectQuote}
                  className="flex-1 py-3.5 px-2 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-0"
                >
                  <MessageCircle size={20} className="fill-current shrink-0" />
                  <span className="truncate">Whatsapp</span>
                </button>

                <button 
                  onClick={handleShareProduct}
                  className="py-3.5 px-3.5 rounded-xl font-bold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-brand-surface-2 dark:hover:bg-brand-surface-3 text-slate-800 dark:text-white border border-slate-200 dark:border-brand-surface-3 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
                  title="Compartir repuesto como imagen"
                >
                  <Clipboard size={20} className="shrink-0" />
                  <span className="hidden sm:inline">Compartir</span>
                </button>

                <button 
                  onClick={() => addToCart(product)}
                  disabled={!product.stock}
                  className={`flex-1 py-3.5 px-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 min-w-0 ${
                    product.stock 
                      ? 'bg-slate-900 dark:bg-brand-surface-3 text-white hover:bg-slate-800 dark:hover:bg-brand-border shadow-lg shadow-slate-900/20' 
                      : 'bg-gray-100 dark:bg-brand-surface-2 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={20} className="shrink-0" />
                  <span className="truncate">
                    {product.stock ? 'Agregar' : 'Sin Stock'}
                  </span>
                </button>

              </div>
            </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
