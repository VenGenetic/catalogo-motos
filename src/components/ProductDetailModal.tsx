import { ArrowLeft, X, Plus, ShoppingBag, MessageCircle } from 'lucide-react';
import { ImageZoom } from './ImageZoom';
import { optimizarImg } from '../utils/helpers';
import { Producto } from '../types';
import { useCart } from '../context/CartContext';
import { APP_CONFIG } from '../config/constants';

interface Props {
  product: Producto | null;
  onClose: () => void;
}

export const ProductDetailModal = ({ product, onClose }: Props) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product);
    onClose();
  };

  const handleConsult = () => {
    const precio = Number(product.precio) || 0;
    const mensaje = `Hola LV PARTS, estoy interesado en este repuesto:
    
📌 *${product.nombre}*
${product.codigo_referencia ? `⚙️ Ref: ${product.codigo_referencia}` : ''}
💰 Precio: $${precio.toFixed(2)}

¿Me pueden confirmar disponibilidad?`;

    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const precioSeguro = Number(product.precio) || 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-white md:bg-black/60 backdrop-blur-sm animate-fade-in">
      <button onClick={onClose} className="md:hidden absolute top-4 left-4 z-20 bg-white/80 p-2 rounded-full shadow-sm backdrop-blur-md">
        <ArrowLeft className="w-6 h-6 text-slate-900" />
      </button>

      <div className="w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] bg-white md:rounded-2xl flex flex-col md:flex-row overflow-hidden relative shadow-2xl">
        <button onClick={onClose} className="hidden md:block absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <X className="w-6 h-6 text-slate-500" />
        </button>

        {/* CORRECCIÓN: bg-white en lugar de bg-gray-100 para evitar el "espacio feo" */}
        <div className="w-full md:w-1/2 h-[45vh] md:h-[500px] bg-white relative shrink-0">
          <ImageZoom src={optimizarImg(product.imagen)} alt={product.nombre} />
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
            Toca para zoom
          </div>
        </div>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 md:p-8 pb-32 md:pb-8">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-1 rounded">
                {product.seccion || 'Repuesto'}
              </span>
            </div>

            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
              {product.nombre}
            </h2>
            
            {product.codigo_referencia && (
              <p className="text-sm text-gray-500 font-mono mb-4">Ref: {product.codigo_referencia}</p>
            )}

            <div className="my-6 border-t border-b border-gray-100 py-4 flex items-center justify-between">
              <div>
                <span className="block text-sm text-gray-400 mb-1">Precio Unitario</span>
                <span className="text-3xl font-extrabold text-slate-900">${precioSeguro.toFixed(2)}</span>
              </div>
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                Disponible
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              Repuesto original garantizado para tu motocicleta. Compatible con los modelos especificados.
            </p>

            <div className="hidden md:flex gap-4 mt-8">
              <button 
                onClick={handleAdd}
                className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus className="w-5 h-5" /> Agregar al Pedido
              </button>
              <button 
                onClick={handleConsult}
                className="flex-1 border-2 border-slate-200 text-slate-700 py-4 rounded-xl font-bold hover:border-slate-900 transition-all active:scale-95"
              >
                Consultar WhatsApp
              </button>
            </div>
          </div>

          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3 z-30 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button 
              onClick={handleConsult}
              className="flex-1 bg-white border border-gray-200 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm active:bg-gray-50"
            >
              <MessageCircle className="w-4 h-4" /> Consultar
            </button>
            <button 
              onClick={handleAdd}
              className="flex-[1.5] bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 text-sm active:bg-red-700"
            >
              <ShoppingBag className="w-4 h-4" /> Agregar ${precioSeguro.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};