// CORRECCIÓN: Se eliminó 'useRef' de los imports
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
    const message = `Hola LV PARTS, me interesa este repuesto: ${product.nombre} (Ref: ${product.codigo_referencia || 'S/N'}). ¿Me confirman precio y stock?`;
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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
        
        <Helmet>
          <title>{`${product.nombre} | LV PARTS`}</title>
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Helmet>

        <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center sm:text-left">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 50 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-5xl bg-white sm:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()} 
          >
            
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 z-30 p-2 bg-white/80 hover:bg-white rounded-full text-slate-800 shadow-md backdrop-blur-md transition-all active:scale-90"
            >
              <X size={24} />
            </button>

            {/* COLUMNA 1: IMAGEN */}
            <div className="w-full md:w-3/5 bg-gray-50 relative border-b md:border-b-0 md:border-r border-gray-100">
               <div className="w-full aspect-[1024/535] relative group">
                 <ImageZoom 
                   src={optimizarImg(product.imagen)} 
                   alt={product.nombre}
                   className="w-full h-full" 
                 />
                 
                 <div className="absolute top-4 left-4">
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
            <div className="w-full md:w-2/5 flex flex-col bg-white pb-24 md:pb-0">
              
              <div className="p-5 md:p-8 space-y-5">
                
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200">
                      {product.seccion}
                    </span>
                    {product.codigo_referencia && (
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        <Tag size={12} /> {product.codigo_referencia}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                    {product.nombre}
                  </h2>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                     <span className="text-[10px] text-gray-500 font-bold uppercase block">Precio</span>
                     <span className="text-3xl font-black text-slate-900 tracking-tight">
                       ${Number(product.precio).toFixed(2)}
                     </span>
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] text-gray-400 font-bold uppercase block">Disponibilidad</span>
                     {product.stock ? (
                         <span className="text-sm font-bold text-green-600">En Bodega</span>
                     ) : (
                         <span className="text-sm font-bold text-red-500 flex items-center gap-1">
                           <AlertCircle size={14}/> Agotado
                         </span>
                     )}
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs md:text-sm text-blue-800 leading-relaxed">
                   <Info size={18} className="shrink-0 mt-0.5" />
                   <p>Asegúrate de que la foto coincida con tu repuesto. ¿Dudas? Usa el botón de WhatsApp.</p>
                </div>

                {relacionados.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Relacionados
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                       {relacionados.slice(0, 2).map(rel => (
                         <div 
                            key={rel.id} 
                            className="cursor-pointer group flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                            onClick={() => onSelectRelated(rel)}
                         >
                            <div className="w-10 h-10 bg-white rounded border border-gray-100 shrink-0 overflow-hidden">
                               <LazyImage 
                                  src={optimizarImg(rel.imagen)} 
                                  alt={rel.nombre}
                                  className="w-full h-full" 
                                  imageFit="contain"
                                  cropBottom={false}
                               />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-700 truncate group-hover:text-red-600">
                                {rel.nombre}
                              </p>
                              <p className="text-[10px] font-bold text-slate-900">
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

            {/* FOOTER DE ACCIONES STICKY */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:static md:shadow-none md:p-6 md:border-t z-40 pb-safe">
              <div className="flex gap-2 max-w-5xl mx-auto w-full">
                
                <button 
                  onClick={handleDirectQuote}
                  className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} className="fill-current" />
                  <span className="line-clamp-1">Cotizar</span>
                </button>

                <button 
                  onClick={() => addToCart(product)}
                  disabled={!product.stock}
                  className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    product.stock 
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={20} />
                  <span className="line-clamp-1">
                    {product.stock ? 'Agregar' : 'Sin Stock'}
                  </span>
                </button>

              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};