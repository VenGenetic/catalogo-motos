import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, X, Plus, MessageCircle, Shield, Package, ShoppingBag } from 'lucide-react';
import { ImageZoom } from './ImageZoom';
import { optimizarImg } from '../utils/helpers';
import { Producto } from '../types';
import { useCart } from '../context/CartContext';
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (product) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [product]);

  const relacionados = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter(p => p.seccion === product.seccion && p.id !== product.id)
      .slice(0, 3);
  }, [product, allProducts]);

  if (!product) return null;

  const handleAdd = () => addToCart(product);

  const handleConsult = () => {
    const precio = Number(product.precio) || 0;
    const mensaje = `Hola, me interesa: *${product.nombre}* ($${precio.toFixed(2)}). ¿Tienen stock?`;
    window.open(`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const precioSeguro = Number(product.precio) || 0;

  return (
    <div 
      className={`fixed inset-0 z-[60] flex items-end md:items-center justify-center transition-all duration-300 ${
        isVisible ? 'bg-black/70 backdrop-blur-md opacity-100' : 'bg-transparent opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="md:hidden absolute top-4 left-4 z-20 bg-white/90 p-2 rounded-full shadow-lg backdrop-blur-md active:scale-90 transition-transform"
      >
        <ArrowLeft className="w-6 h-6 text-slate-900" />
      </button>

      <div 
        className={`w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-2xl bg-white rounded-t-3xl md:rounded-2xl flex flex-col overflow-hidden relative shadow-2xl transform transition-transform duration-300 ${
          isVisible ? 'translate-y-0 scale-100' : 'translate-y-full md:translate-y-10 md:scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="hidden md:block absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>

        {/* IMAGEN ESTRECHA:
            - h-[30vh] en móvil (antes 35)
            - md:h-[280px] en PC (antes 400). Esto la hace bien "panorámica" y delgada.
        */}
        <div className="w-full bg-gray-50 relative shrink-0 flex items-center justify-center h-[30vh] md:h-[280px]">
          <div className="w-full h-full absolute inset-0">
             <ImageZoom src={optimizarImg(product.imagen)} alt={product.nombre} />
          </div>
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none flex items-center gap-1">
            <Plus size={10} /> ZOOM
          </div>
        </div>

        {/* Info + Relacionados */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 md:pb-8 custom-scrollbar">
            
            <div className="flex flex-col gap-1 mb-4">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider w-max bg-red-50 px-2 py-1 rounded-md">
                {product.seccion}
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.nombre}
              </h2>
              {product.codigo_referencia && (
                <p className="text-sm text-gray-400 font-mono">Ref: {product.codigo_referencia}</p>
              )}
            </div>

            <div className="my-5 border-t border-b border-gray-50 py-4 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">Precio Online</span>
                <span className="text-3xl font-black text-slate-900">${precioSeguro.toFixed(2)}</span>
              </div>
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                En Stock
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-8">
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                <Shield size={14} className="text-blue-600"/> Garantía Asegurada
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                <Package size={14} className="text-orange-600"/> Envíos Nacionales
              </div>
            </div>

            {/* SECCIÓN RELACIONADOS */}
            {relacionados.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                  También te puede interesar
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {relacionados.map(rel => (
                    <div 
                      key={rel.id} 
                      className="group cursor-pointer"
                      onClick={() => onSelectRelated(rel)}
                    >
                      <div className="aspect-square rounded-lg bg-gray-50 mb-2 overflow-hidden border border-gray-100 relative">
                        <LazyImage 
                          src={optimizarImg(rel.imagen)} 
                          alt={rel.nombre} 
                          cropBottom={true}
                          imageFit="cover"
                          className="w-full h-full bg-white group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-700 line-clamp-2 leading-tight group-hover:text-red-600">
                        {rel.nombre}
                      </p>
                      <p className="text-[10px] font-bold text-slate-900 mt-0.5">
                        ${Number(rel.precio).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="hidden md:flex gap-3 mt-8">
              <button onClick={handleAdd} className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                <ShoppingBag size={18} /> Agregar al Carrito
              </button>
              <button onClick={handleConsult} className="px-6 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-slate-900 hover:text-slate-900 transition-all active:scale-95">
                <MessageCircle size={20} />
              </button>
            </div>
          </div>

          <div className="md:hidden absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3 z-30 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
             <button onClick={handleConsult} className="p-3.5 bg-gray-50 text-slate-700 rounded-xl border border-gray-200 active:bg-gray-100">
               <MessageCircle size={20} />
             </button>
             <button onClick={handleAdd} className="flex-1 bg-red-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 text-sm active:scale-95">
               <ShoppingBag size={18} /> Agregar ${precioSeguro.toFixed(2)}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};