import { X, Minus, Plus, MessageCircle } from 'lucide-react';
import { optimizarImg } from '../utils/helpers';
import { useCart } from '../context/CartContext'; // Hook

export const CartDrawer = () => {
  // Obtenemos todo del contexto
  const { isOpen, closeCart, cart, updateQuantity, cartTotal, sendOrderToWhatsapp } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeCart}></div>
      <div className="relative w-full md:max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold">Tu Pedido</h2>
          <button onClick={closeCart}><X className="w-6 h-6 text-gray-500 hover:text-red-500"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-10">Tu carrito está vacío</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 p-2 border border-gray-100 rounded-lg bg-white">
                <img 
                  src={optimizarImg(item.imagen)} 
                  alt={item.nombre}
                  className="w-16 h-16 object-cover object-top rounded bg-gray-100" 
                />
                <div className="flex-1">
                  <h4 className="text-xs font-bold line-clamp-2 text-slate-800">{item.nombre}</h4>
                  <p className="text-red-600 font-bold text-sm">${(item.precio * (item.cantidad || item.cant || 0)).toFixed(2)}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)} 
                      className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors"
                    >
                      <Minus size={12}/>
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.cantidad || item.cant}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)} 
                      className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors"
                    >
                      <Plus size={12}/>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 pb-safe">
          <div className="flex justify-between font-bold text-lg mb-4 text-slate-900">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={sendOrderToWhatsapp} 
            disabled={cart.length === 0}
            className={`w-full font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all ${
              cart.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-500/30'
            }`}
          >
            <MessageCircle size={20} /> Pedir por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};