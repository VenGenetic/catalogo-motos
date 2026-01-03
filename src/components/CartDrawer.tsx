import { X, Minus, Plus, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { optimizarImg } from '../utils/helpers';
import { LazyImage } from './LazyImage';

export const CartDrawer = () => {
  const { 
    isOpen, 
    closeCart, 
    cart, 
    updateQuantity, 
    cartTotal, 
    sendOrderToWhatsapp 
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={closeCart}
      />

      {/* Panel */}
      <div className="relative w-full md:max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-slate-900">Tu Pedido</h2>
          <button 
            onClick={closeCart}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 hover:text-red-600"/>
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <MessageCircle className="w-12 h-12 opacity-20" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => {
              // Cálculo seguro del precio por item
              const precioItem = Number(item.precio) || 0;
              const cantidad = item.cantidad || item.cant || 0;
              const subtotal = precioItem * cantidad;

              return (
                <div key={item.id} className="flex gap-3 p-2 border border-gray-100 rounded-lg bg-white shadow-sm">
                  
                  <LazyImage 
                    src={optimizarImg(item.imagen)} 
                    alt={item.nombre}
                    className="w-16 h-16 rounded bg-gray-100 shrink-0" 
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold line-clamp-2 text-slate-800 leading-tight">
                        {item.nombre}
                      </h4>
                      <p className="text-red-600 font-bold text-sm mt-1">
                        ${subtotal.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 self-start">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors text-slate-600 active:scale-95"
                      >
                        <Minus size={14}/>
                      </button>
                      
                      <span className="text-sm font-bold w-4 text-center text-slate-900">
                        {cantidad}
                      </span>
                      
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        className="w-7 h-7 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Plus size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium">Total Estimado</span>
            <span className="text-2xl font-extrabold text-slate-900">
              ${(Number(cartTotal) || 0).toFixed(2)}
            </span>
          </div>
          
          <button 
            onClick={sendOrderToWhatsapp} 
            disabled={cart.length === 0}
            className={`w-full font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all transform active:scale-[0.98] ${
              cart.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-lg hover:shadow-green-500/30'
            }`}
          >
            <MessageCircle size={20} className="fill-current" /> 
            Pedir por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};