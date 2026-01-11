import { useState } from 'react';
import { X, Minus, Plus, MessageCircle, ShieldCheck, User, MapPin, CreditCard, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { optimizarImg } from '../utils/helpers';
import { LazyImage } from './LazyImage';
import { APP_CONFIG } from '../config/constants';

export const CartDrawer = () => {
  const { 
    isOpen, 
    closeCart, 
    cart, 
    updateQuantity, 
    cartTotal
  } = useCart();

  // Estado local para el formulario de checkout
  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    metodoPago: 'Transferencia'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generarMensajeWhatsApp = () => {
    const itemsList = cart.map(item => 
      `▪️ *${item.cantidad}x* ${item.nombre} ($${(item.cantidad * (Number(item.precio) || 0)).toFixed(2)})`
    ).join('\n');

    const total = Number(cartTotal).toFixed(2);

    return `👋 Hola LV PARTS, quiero confirmar el siguiente pedido:

${itemsList}

💰 *TOTAL A PAGAR: $${total}*

📋 *Mis Datos de Envío:*
👤 Nombre: ${formData.nombre.trim() || 'No especificado'}
📍 Ciudad/Dirección: ${formData.ciudad.trim() || 'No especificado'}
💳 Método de Pago: ${formData.metodoPago}

¿Me confirman los datos de cuenta para transferir?`;
  };

  const handleCheckout = () => {
    const mensaje = generarMensajeWhatsApp();
    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

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
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 shadow-sm z-10">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> Tu Pedido
          </h2>
          <button 
            onClick={closeCart}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 hover:text-red-600"/>
          </button>
        </div>

        {/* Lista de Productos (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60%] text-gray-400 gap-4">
              <div className="bg-gray-50 p-6 rounded-full">
                <MessageCircle className="w-12 h-12 opacity-20" />
              </div>
              <p className="font-medium">Tu carrito está vacío</p>
              <button onClick={closeCart} className="text-red-600 font-bold text-sm hover:underline">
                Ir al Catálogo
              </button>
            </div>
          ) : (
            <>
              {/* Lista de Items */}
              <div className="space-y-3">
                {cart.map(item => {
                  const precioItem = Number(item.precio) || 0;
                  const cantidad = item.cantidad || item.cant || 0;
                  const subtotal = precioItem * cantidad;

                  return (
                    <div key={item.id} className="flex gap-3 p-2 border border-gray-100 rounded-xl bg-white shadow-sm hover:border-gray-200 transition-colors">
                      <LazyImage 
                        src={optimizarImg(item.imagen)} 
                        alt={item.nombre}
                        className="w-16 h-16 rounded-lg bg-gray-50 shrink-0 object-cover" 
                      />

                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold line-clamp-2 text-slate-800 leading-tight">
                            {item.nombre}
                          </h4>
                          <span className="text-xs font-bold text-slate-900 shrink-0">
                            ${subtotal.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2 self-start">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)} 
                            className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors text-slate-600 active:scale-95"
                          >
                            <Minus size={12}/>
                          </button>
                          <span className="text-xs font-bold w-4 text-center text-slate-900">
                            {cantidad}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)} 
                            className="w-6 h-6 bg-slate-900 hover:bg-slate-800 text-white rounded flex items-center justify-center transition-colors active:scale-95"
                          >
                            <Plus size={12}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FORMULARIO DE ENVÍO (Nuevo) */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <User size={16} className="text-red-600" /> Datos para el Envío
                </h3>
                <p className="text-xs text-gray-500 mb-4">Todos los campos son opcionales - puedes completar después</p>
                
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Tu Nombre Completo (opcional)"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="ciudad"
                      placeholder="Ciudad y Dirección (opcional)"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                    />
                  </div>

                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <select
                      name="metodoPago"
                      value={formData.metodoPago}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 outline-none appearance-none"
                    >
                      <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                      <option value="Depósito">Depósito en Agente</option>
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none">
                      <ArrowRight size={14} className="text-gray-400 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer del Carrito */}
        <div className="p-4 border-t bg-white pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
          
          {/* Mensaje de Confianza */}
          {cart.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-[10px] text-blue-800 leading-tight">
                Completa los datos opcionales o envía el pedido directamente. Te contactaremos para coordinar los detalles.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium text-sm">Total Estimado</span>
            <span className="text-2xl font-extrabold text-slate-900">
              ${(Number(cartTotal) || 0).toFixed(2)}
            </span>
          </div>
          
          <button 
            onClick={handleCheckout} 
            disabled={cart.length === 0}
            className={`w-full font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all transform active:scale-[0.98] ${
              cart.length === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-lg hover:shadow-green-500/30'
            }`}
          >
            <MessageCircle size={20} className="fill-current" />
            {cart.length === 0 ? 'Carrito Vacío' : 'Enviar Pedido por WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
};