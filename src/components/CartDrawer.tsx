// src/components/CartDrawer.tsx
import { useState } from 'react';
import { X, Minus, Plus, MessageCircle, User, ArrowRight, Check, FileText, Trash2, MapPin, Truck } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    metodoPago: 'Transferencia'
  });

  const [copied, setCopied] = useState(false);
  
  // Estado para el modal de envío
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [hasShipping, setHasShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- LÓGICA DE MENSAJES ---
  const generarMensajeWhatsApp = (costoEnvio: number) => {
    const itemsList = cart.map(item => 
      `▪️ *${item.cantidad}x* ${item.nombre} ($${(item.cantidad * (Number(item.precio) || 0)).toFixed(2)})`
    ).join('\n');

    const totalFinal = costoEnvio > 0 ? cartTotal + costoEnvio : cartTotal;

    return `👋 Hola LV PARTS, quiero confirmar el siguiente pedido:

${itemsList}
${costoEnvio > 0 ? `▪️ *Envío / Transporte:* $${costoEnvio.toFixed(2)}` : ''}

💰 *TOTAL A PAGAR: $${totalFinal.toFixed(2)}*

📋 *Datos de Envío:*
👤 Nombre: ${formData.nombre.trim() || 'No especificado'}
📍 Ciudad/Dirección: ${formData.ciudad.trim() || 'No especificado'}
💳 Pago: ${formData.metodoPago}

¿Me confirman para transferir?`;
  };

  const generarTextoProforma = (costoEnvio: number) => {
    const date = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });
    const itemsList = cart.map(item => 
      `Cant: ${item.cantidad} | ${item.nombre} | $${(item.cantidad * (Number(item.precio) || 0)).toFixed(2)}`
    ).join('\n');

    const totalFinal = costoEnvio > 0 ? cartTotal + costoEnvio : cartTotal;

    return `📄 *COTIZACIÓN / PROFORMA - LV PARTS*
📅 Fecha: ${date}
👤 Cliente: ${formData.nombre.trim() || 'Consumidor Final'}
📍 Destino: ${formData.ciudad.trim() || 'Pendiente'}

*DETALLE DEL PEDIDO:*
--------------------------------
${itemsList}
--------------------------------
SUBTOTAL: $${cartTotal.toFixed(2)}
${costoEnvio > 0 ? `ENVÍO:    $${costoEnvio.toFixed(2)}` : ''}
*TOTAL:    $${totalFinal.toFixed(2)}*

💳 Método Sugerido: ${formData.metodoPago}
⚠️ *Precios sujetos a disponibilidad.*`;
  };

  const handleCheckout = () => {
    const mensaje = generarMensajeWhatsApp(0); // Sin envío por defecto
    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleCopyClick = () => {
    setIsShippingModalOpen(true);
    setHasShipping(false);
    setShippingCost('');
  };

  const handleConfirmCopy = async () => {
    const finalShippingCost = hasShipping ? (parseFloat(shippingCost) || 0) : 0;
    const texto = generarTextoProforma(finalShippingCost);
    
    try {
      await navigator.clipboard.writeText(texto);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setIsShippingModalOpen(false);
    } catch (err) {
      console.error('Error al copiar', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay Oscuro */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={closeCart}
      />

      {/* Panel Deslizante (Ancho completo en móvil) */}
      <div className="relative w-full md:max-w-[480px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* --- HEADER --- */}
        <div className="px-5 py-4 border-b flex justify-between items-center bg-white z-10 sticky top-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Tu Pedido
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full border border-slate-200">
                {cart.length} items
              </span>
            </h2>
          </div>
          <button 
            onClick={closeCart}
            className="p-2 -mr-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <X className="w-7 h-7"/>
          </button>
        </div>

        {/* --- CONTENIDO SCROLLABLE --- */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[70%] text-gray-400 gap-6 p-8">
              <div className="bg-white p-8 rounded-full shadow-sm border border-gray-100">
                <MessageCircle className="w-16 h-16 text-gray-300" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-lg text-slate-700">Tu carrito está vacío</p>
                <p className="text-sm">Agrega repuestos para armar tu pedido.</p>
              </div>
              <button 
                onClick={closeCart} 
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 active:scale-95 transition-transform"
              >
                Volver al Catálogo
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-6 pb-32">
              
              {/* LISTA DE ITEMS */}
              <div className="space-y-3">
                {cart.map(item => {
                  const subtotal = (Number(item.precio) || 0) * (item.cantidad || item.cant || 0);
                  return (
                    <div key={item.id} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      {/* Imagen más grande */}
                      <LazyImage 
                        src={optimizarImg(item.imagen)} 
                        alt={item.nombre}
                        className="w-20 h-20 rounded-xl bg-gray-50 shrink-0 object-cover border border-gray-100" 
                      />
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
                            {item.nombre}
                          </h4>
                          <button 
                             onClick={() => updateQuantity(item.id, -1000)} // Eliminar
                             className="text-gray-300 hover:text-red-500 p-1 -mt-1 -mr-1"
                          >
                             <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-end justify-between mt-2">
                          <div className="font-extrabold text-slate-900">
                            ${subtotal.toFixed(2)}
                          </div>

                          {/* Controles de Cantidad (Touch Friendly) */}
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)} 
                              className="w-8 h-8 bg-white hover:bg-gray-100 rounded-md flex items-center justify-center shadow-sm border border-gray-200 text-slate-700 active:scale-90 transition-transform"
                            >
                              <Minus size={16} strokeWidth={3}/>
                            </button>
                            <span className="text-sm font-bold w-6 text-center text-slate-900">
                              {item.cantidad || item.cant || 0}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)} 
                              className="w-8 h-8 bg-slate-900 text-white rounded-md flex items-center justify-center shadow-md active:scale-90 transition-transform"
                            >
                              <Plus size={16} strokeWidth={3}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FORMULARIO DE CLIENTE */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <User size={16} className="text-slate-400" /> 
                  Datos para la Nota (Opcional)
                </h3>
                
                <input 
                  type="text" 
                  name="nombre" 
                  placeholder="Tu Nombre o Cliente" 
                  value={formData.nombre} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-400" 
                />
                
                <div className="relative">
                   <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                   <input 
                    type="text" 
                    name="ciudad" 
                    placeholder="Ciudad / Dirección" 
                    value={formData.ciudad} 
                    onChange={handleInputChange} 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-400" 
                  />
                </div>

                <div className="relative">
                  <select 
                    name="metodoPago" 
                    value={formData.metodoPago} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:bg-white focus:border-red-500 outline-none appearance-none text-slate-700 font-medium"
                  >
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Depósito">Depósito en Agente</option>
                    <option value="Efectivo en Local">Efectivo en Local</option>
                  </select>
                  <ArrowRight size={18} className="absolute right-4 top-4 text-gray-400 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- FOOTER FLOTANTE (STICKY) --- */}
        <div className="p-4 border-t bg-white shadow-[0_-4px_30px_rgba(0,0,0,0.08)] z-20 pb-safe">
          <div className="flex justify-between items-end mb-4 px-1">
             <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total a Pagar</p>
             </div>
             <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
               ${cartTotal.toFixed(2)}
             </div>
          </div>
          
          <div className="grid grid-cols-[1fr_2fr] gap-3 h-14">
            <button
               onClick={handleCopyClick}
               disabled={cart.length === 0}
               className={`rounded-xl flex flex-col justify-center items-center border transition-all active:scale-95 ${
                 copied 
                   ? 'bg-slate-800 text-white border-slate-800' 
                   : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
               }`}
            >
               {copied ? <Check size={20} className="mb-0.5" /> : <FileText size={20} className="mb-0.5" />}
               <span className="text-[10px] font-bold uppercase">{copied ? '¡Listo!' : 'Copiar'}</span>
            </button>

            <button 
              onClick={handleCheckout} 
              disabled={cart.length === 0}
              className={`rounded-xl flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] ${
                cart.length === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#25D366] text-white hover:brightness-105'
              }`}
            >
              <MessageCircle size={24} className="fill-current" />
              <span>Pedir</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL DE ENVÍO (Beautiful Mobile First) --- */}
      {isShippingModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsShippingModalOpen(false)}
          />
          
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 relative z-10 animate-scale-up border border-gray-100">
            <button 
              onClick={() => setIsShippingModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-slate-900 transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <Truck size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 text-center">
                Opciones de Envío
              </h3>
              <p className="text-gray-500 text-center text-sm mt-1">
                Personaliza tu proforma antes de copiar
              </p>
            </div>

            <div className="space-y-6">
              {/* Switch Bonito */}
              <div 
                onClick={() => setHasShipping(!hasShipping)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                  hasShipping 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    hasShipping ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                  }`}>
                    {hasShipping && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={`font-bold ${hasShipping ? 'text-blue-700' : 'text-gray-600'}`}>
                    ¿Incluir costo de envío?
                  </span>
                </div>
              </div>

              {/* Input Condicional con Animación */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                hasShipping ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 bg-white border-2 border-blue-100 rounded-xl text-xl font-bold text-slate-800 placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    autoFocus={hasShipping}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase">USD</span>
                </div>
              </div>

              {/* Botón de Acción Principal */}
              <button
                onClick={handleConfirmCopy}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 hover:bg-slate-800"
              >
                <FileText size={20} />
                Copiar Proforma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};