import { useEffect, useMemo } from 'react';
import { X, ShoppingCart, Check, AlertCircle, MessageCircle, Tag, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Producto } from '../types';
import { useCart } from '../context/CartContext';
import { optimizarImg } from '../utils/helpers';
import { APP_CONFIG } from '../config/constants';
import { ImageZoom } from './ImageZoom';
import { LazyImage } from './LazyImage';

interface Props {
  product: Producto | null;
  allProducts: Producto[];
  onClose: () => void;
  onSelectRelated: (p: Producto) => void;
}

export const ProductDetailModal = ({ product, allProducts, onClose, onSelectRelated }: Props) => {
  const { addToCart } = useCart();
  
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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

  if (!product) return null;

  const handleDirectQuote = () => {
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        
        <Helmet>
          <title>{`${product.nombre} | LV PARTS`}</title>
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Helmet>

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

        {/* MODAL PRINCIPAL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          // CLAVE MÓVIL: w-full h-full (ocupa toda la pantalla)
          // CLAVE DESKTOP: Ancho máximo más generoso para mostrar bien la imagen 1024x535
          className="relative w-full h-full md:h-auto md:max-h-[95vh] md:max-w-6xl lg:max-w-7xl bg-white dark:bg-slate-900 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()} 
        >
            
            {/* Botón Cerrar: Ajustado para respetar el Notch/Safe Region en móviles */}
            <div className="absolute top-0 right-0 p-3 z-30 pt-[calc(0.75rem+env(safe-area-inset-top))]">
              <button 
                onClick={onClose}
                className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 rounded-full text-slate-800 dark:text-white shadow-sm backdrop-blur-md active:scale-90 transition-transform"
              >
                <X size={24} />
              </button>
            </div>

            {/* ÁREA SCROLLABLE (Imagen + Info) */}
            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row pb-safe">
              
              {/* COLUMNA 1: IMAGEN - Mayor en desktop para mejor visualización */}
              <div className="w-full md:w-7/12 lg:w-3/5 bg-gray-50 dark:bg-slate-800 relative border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-700 shrink-0">
                 {/* Aspect Ratio 1024/535 */}
                 <div className="w-full aspect-[1024/535] relative group bg-white dark:bg-slate-900">
                   <ImageZoom 
                     src={optimizarImg(product.imagen)} 
                     alt={product.nombre}
                     className="w-full h-full" 
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
              <div className="w-full md:w-5/12 lg:w-2/5 p-5 md:p-8 space-y-6 bg-white dark:bg-slate-900 overflow-y-auto">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-700">
                        {product.seccion}
                      </span>
                      {product.codigo_referencia && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded border border-gray-100 dark:border-slate-700">
                          <Tag size={12} /> {product.codigo_referencia}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                      {product.nombre}
                    </h2>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                       <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">Precio</span>
                       <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                         ${Number(product.precio).toFixed(2)}
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
                       {product.origenes?.length ? (
                         <div className="mt-1 flex flex-wrap gap-1 justify-end">
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
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                     <Info size={16} className="shrink-0 mt-0.5" />
                     <p>Verifica que la foto y código coincidan con tu repuesto usado.</p>
                  </div>

                  {relacionados.length > 0 && (
                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Relacionados
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                         {relacionados.slice(0, 2).map(rel => (
                           <div 
                              key={rel.id} 
                              className="cursor-pointer group flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all"
                              onClick={() => onSelectRelated(rel)}
                           >
                              <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded border border-gray-100 dark:border-slate-600 shrink-0 overflow-hidden">
                                 <LazyImage 
                                    src={optimizarImg(rel.imagen)} 
                                    alt={rel.nombre}
                                    className="w-full h-full" 
                                    imageFit="contain"
                                    cropBottom={false}
                                 />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-red-600 dark:group-hover:text-red-400">
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
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 shrink-0 pb-safe md:p-5">
              <div className="flex gap-3 max-w-5xl mx-auto w-full">
                
                <button 
                  onClick={handleDirectQuote}
                  className="flex-1 py-3.5 px-2 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-0"
                >
                  <MessageCircle size={20} className="fill-current shrink-0" />
                  <span className="truncate">Whatsapp</span>
                </button>

                <button 
                  onClick={() => addToCart(product)}
                  disabled={!product.stock}
                  className={`flex-1 py-3.5 px-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 min-w-0 ${
                    product.stock 
                      ? 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 shadow-lg shadow-slate-900/20' 
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
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