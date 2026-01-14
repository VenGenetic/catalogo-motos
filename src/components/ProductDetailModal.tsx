import { useEffect, useRef, useMemo } from 'react';
import { X, ShoppingCart, Check, AlertCircle, Share2, Tag, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async'; // <--- IMPORTANTE: Para el SEO
import { Producto } from '../types';
import { useCart } from '../context/CartContext';
import { optimizarImg } from '../utils/helpers';
import { APP_CONFIG } from '../config/constants';
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

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Bloquear scroll de fondo
  useEffect(() => {
    if (product) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [product]);

  // Encontrar productos relacionados (misma categoría o nombre similar)
  const relacionados = useMemo(() => {
    if (!product) return [];
    
    // 1. Extraer palabras clave del nombre (ej: "CARBURADOR", "TEKKEN")
    const palabras = product.nombre.split(' ').filter(p => p.length > 3).slice(0, 2);
    
    return allProducts
      .filter(p => 
        p.id !== product.id && 
        (p.seccion === product.seccion || palabras.some(w => p.nombre.includes(w)))
      )
      .slice(0, 4); // Mostrar máximo 4 relacionados
  }, [product, allProducts]);

  if (!product) return null;

  // --- DATOS ESTRUCTURADOS (JSON-LD) PARA GOOGLE ---
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.nombre,
    "image": [
      `${window.location.origin}${optimizarImg(product.imagen)}`
    ],
    "description": `Repuesto original ${product.nombre}. Categoría: ${product.categoria}. Compatible con motos Daytona y otras marcas en Ecuador.`,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        
        {/* SEO DINÁMICO */}
        <Helmet>
          <title>{`${product.nombre} | LV PARTS`}</title>
          <meta name="description" content={`Compra ${product.nombre} al mejor precio. Repuestos originales Daytona en Ecuador. Stock disponible: ${product.stock ? 'SÍ' : 'NO'}.`} />
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </Helmet>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]"
          ref={modalRef}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full text-slate-800 transition-colors"
          >
            <X size={24} />
          </button>

          {/* COLUMNA IZQUIERDA: IMAGEN */}
          <div className="w-full md:w-1/2 bg-gray-50 p-4 md:p-8 flex items-center justify-center relative">
             <div className="w-full aspect-square max-w-sm mix-blend-multiply">
               <LazyImage 
                 src={optimizarImg(product.imagen)} 
                 alt={product.nombre}
                 className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
               />
             </div>
             {!product.stock && (
               <div className="absolute top-6 left-6 bg-red-600 text-white px-3 py-1 text-xs font-bold rounded shadow-sm">
                 AGOTADO
               </div>
             )}
          </div>

          {/* COLUMNA DERECHA: DETALLES */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto bg-white">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                 <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                   {product.seccion}
                 </span>
                 {product.codigo_referencia && (
                   <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                     <Tag size={10} /> {product.codigo_referencia}
                   </span>
                 )}
              </div>
              
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight mb-4">
                {product.nombre}
              </h2>

              <div className="flex items-end gap-3 mb-6 pb-6 border-b border-gray-100">
                <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  ${Number(product.precio).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 font-medium mb-1.5">USD / unidad</span>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  {product.stock ? (
                    <span className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                      <Check size={16} strokeWidth={3} /> Disponible en bodega
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                      <AlertCircle size={16} /> Agotado temporalmente
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                   <Info size={16} className="text-blue-500" />
                   <span>Garantía de fábrica incluida</span>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => addToCart(product)}
                  disabled={!product.stock}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                    product.stock 
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={20} />
                  {product.stock ? 'Agregar al Pedido' : 'Sin Stock'}
                </button>
                
                <button 
                  className="p-3.5 rounded-xl border border-gray-200 text-gray-500 hover:text-slate-900 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
                  title="Compartir enlace"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Enlace copiado al portapapeles');
                  }}
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* RELACIONADOS (Cross-Selling) */}
            {relacionados.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  También te puede interesar
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {relacionados.map(rel => (
                     <div 
                        key={rel.id} 
                        className="cursor-pointer group"
                        onClick={() => onSelectRelated(rel)}
                     >
                        <div className="bg-gray-50 rounded-lg p-1 mb-2 border border-transparent group-hover:border-red-200 transition-colors">
                           <LazyImage 
                              src={optimizarImg(rel.imagen)} 
                              alt={rel.nombre}
                              className="w-full aspect-square object-contain mix-blend-multiply" 
                           />
                        </div>
                        <p className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-2 group-hover:text-red-600">
                          {rel.nombre}
                        </p>
                        <p className="text-[10px] font-bold text-slate-900 mt-1">
                          ${Number(rel.precio).toFixed(2)}
                        </p>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};