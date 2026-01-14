import { useEffect, useRef, useMemo } from 'react';
import { X, ShoppingCart, Check, AlertCircle, Share2, Tag, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Producto } from '../types';
import { useCart } from '../context/CartContext';
import { optimizarImg } from '../utils/helpers';
import { LazyImage } from './LazyImage';

interface Props {
  product: Producto | null;
  allProducts: Producto[];
  onClose: () => void;
  onSelectRelated: (p: Producto) => void;
}

export const ProductDetailModal = ({ product, allProducts, onClose, onSelectRelated }: Props) => {
  const { addToCart } = useCart();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.nombre,
    "image": [`${window.location.origin}${optimizarImg(product.imagen)}`],
    "description": `Repuesto original ${product.nombre}. Categoría: ${product.categoria}.`,
    "sku": product.codigo_referencia || product.id,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "USD",
      "price": product.precio,
      "availability": product.stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        
        <Helmet>
          <title>{`${product.nombre} | LV PARTS`}</title>
          <meta name="description" content={`Compra ${product.nombre}. Stock: ${product.stock ? 'SÍ' : 'NO'}.`} />
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Helmet>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div 
          initial={{ y: '100%' }} 
          animate={{ y: 0 }} 
          exit={{ y: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[85vh]"
          ref={modalRef}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 transition-colors shadow-sm"
          >
            <X size={24} />
          </button>

          {/* COLUMNA IZQUIERDA: IMAGEN (CORREGIDO: Sin recortes) */}
          <div className="w-full md:w-3/5 bg-white p-4 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-100">
             {/* CORRECCIÓN TÉCNICA:
                1. Quitamos 'aspect-square' para que no fuerce cuadrados.
                2. Quitamos 'mix-blend-multiply' para ver el repuesto tal cual es.
                3. Usamos 'h-full' y 'object-contain' estricto.
             */}
             <div className="w-full h-[40vh] md:h-[500px] flex items-center justify-center">
               <LazyImage 
                 src={optimizarImg(product.imagen)} 
                 alt={product.nombre}
                 // IMPORTANTE: cropBottom={false} para asegurar que se vea todo
                 cropBottom={false} 
                 className="w-full h-full object-contain"
               />
             </div>
             
             {!product.stock && (
               <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1.5 text-sm font-bold rounded shadow-md z-10">
                 AGOTADO
               </div>
             )}
          </div>

          {/* COLUMNA DERECHA: DETALLES */}
          <div className="w-full md:w-2/5 flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              
              <div className="flex items-center gap-2 mb-4">
                 <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border border-slate-200">
                   {product.seccion}
                 </span>
                 {product.codigo_referencia && (
                   <span className="text-sm text-slate-500 font-mono flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                     <Tag size={12} /> {product.codigo_referencia}
                   </span>
                 )}
              </div>
              
              <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-snug mb-6">
                {product.nombre}
              </h2>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex items-center justify-between">
                <div>
                   <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Precio Unitario</span>
                   <span className="text-3xl font-black text-slate-900 tracking-tight">
                     ${Number(product.precio).toFixed(2)}
                   </span>
                </div>
                {product.stock ? (
                    <div className="text-right">
                       <span className="text-xs text-green-600 font-bold uppercase block mb-1">Estado</span>
                       <span className="flex items-center justify-end gap-1.5 text-green-700 font-bold text-sm">
                         <Check size={16} strokeWidth={3} /> En Bodega
                       </span>
                    </div>
                ) : (
                    <div className="text-right">
                       <span className="text-xs text-red-500 font-bold uppercase block mb-1">Estado</span>
                       <span className="flex items-center justify-end gap-1.5 text-red-600 font-bold text-sm">
                         <AlertCircle size={16} /> Agotado
                       </span>
                    </div>
                )}
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-blue-800 mb-8">
                 <Info size={18} className="shrink-0 mt-0.5" />
                 <p className="leading-relaxed">
                   Verifica que el código o la imagen coincidan con tu repuesto usado. Si tienes dudas, consulta con nuestro asesor.
                 </p>
              </div>

              {/* RELACIONADOS */}
              {relacionados.length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Relacionados
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                     {relacionados.slice(0, 2).map(rel => (
                       <div 
                          key={rel.id} 
                          className="cursor-pointer group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                          onClick={() => onSelectRelated(rel)}
                       >
                          <div className="w-12 h-12 bg-white rounded border border-gray-100 shrink-0 p-0.5">
                             <LazyImage 
                                src={optimizarImg(rel.imagen)} 
                                alt={rel.nombre}
                                className="w-full h-full object-contain" 
                                cropBottom={false}
                             />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate group-hover:text-red-600">
                              {rel.nombre}
                            </p>
                            <p className="text-xs font-bold text-slate-900">
                              ${Number(rel.precio).toFixed(2)}
                            </p>
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER FIJO CON BOTONES */}
            <div className="p-4 border-t border-gray-100 bg-white pb-safe md:pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
              <div className="flex gap-3">
                <button 
                  onClick={() => addToCart(product)}
                  disabled={!product.stock}
                  className={`flex-1 py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                    product.stock 
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={20} />
                  {product.stock ? 'Agregar' : 'Sin Stock'}
                </button>
                
                <button 
                  className="p-4 rounded-xl border border-gray-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-gray-50 transition-all active:scale-95"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Enlace copiado');
                  }}
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};