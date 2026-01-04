import { X, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { Producto } from '../types';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { optimizarImg } from '../utils/helpers';
import { ImageZoom } from './ImageZoom';
import { Helmet } from 'react-helmet-async'; // 1. Importar

interface Props {
  product: Producto | null;
  onClose: () => void;
}

export const ProductDetailModal = ({ product, onClose }: Props) => {
  const { addToCart } = useCart();
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (product) setAgregado(false);
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 animate-fade-in">
      {/* 2. AÑADIR SEO DINÁMICO */}
      <Helmet>
        <title>{`${product.nombre} | Catálogo LV PARTS`}</title>
        <meta name="description" content={`Compra ${product.nombre} al mejor precio. Repuestos de calidad para tu moto.`} />
      </Helmet>

      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* ... (resto del código del modal igual que antes) ... */}
       <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row animate-scale-up">
        {/* Botón cerrar móvil */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-black/10 hover:bg-black/20 rounded-full text-slate-800 md:hidden backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Imagen */}
        <div className="w-full md:w-1/2 bg-gray-100 relative min-h-[300px] md:min-h-full">
           <ImageZoom 
             src={optimizarImg(product.imagen)} 
             alt={product.nombre} 
             className="w-full h-full object-contain mix-blend-multiply p-4"
           />
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-red-600 font-bold text-xs uppercase tracking-wider bg-red-50 px-2 py-1 rounded-md">
                {product.categoria || product.seccion}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-3 mb-2 leading-tight">
                {product.nombre}
              </h2>
              {product.codigo_referencia && (
                <p className="text-gray-400 text-sm font-medium">Ref: {product.codigo_referencia}</p>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="hidden md:block p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
             <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black text-slate-900 tracking-tight">
                 ${Number(product.precio).toFixed(2)}
               </span>
             </div>
             
             {product.stock === false ? (
               <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                 <AlertCircle className="w-5 h-5" />
                 <span className="font-bold text-sm">Producto actualmente agotado</span>
               </div>
             ) : (
               <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg border border-green-100 w-fit px-3">
                 <Check className="w-4 h-4" />
                 <span className="font-bold text-xs uppercase">Disponible en stock</span>
               </div>
             )}
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={handleAdd}
              disabled={!product.stock && product.stock !== undefined}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg ${
                agregado 
                  ? 'bg-green-600 text-white shadow-green-200' 
                  : (!product.stock && product.stock !== undefined)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-300 hover:shadow-xl'
              }`}
            >
              {agregado ? (
                <>
                  <Check className="w-6 h-6" />
                  ¡Agregado al Carrito!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" />
                  {(!product.stock && product.stock !== undefined) ? 'Sin Stock' : 'Agregar al Pedido'}
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Garantía de calidad LV PARTS • Envíos a todo el país
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};