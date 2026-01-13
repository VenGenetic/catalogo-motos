// src/components/CartDrawer.tsx
import { useState } from 'react';
import { X, Minus, Plus, MessageCircle, ShieldCheck, User, MapPin, CreditCard, ArrowRight, Check, FileText, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { optimizarImg } from '../utils/helpers';
import { LazyImage } from './LazyImage';
import { APP_CONFIG } from '../config/constants';

// Puedes cambiar este valor al precio real de tu envío
const COSTO_ENVIO = 5.00; 

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
  
  // NUEVO: Estado para el envío
  const [conEnvio, setConEnvio] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Calculamos el total final dinámicamente
  const totalFinal = conEnvio ? cartTotal + COSTO_ENVIO : cartTotal;

  // 1. Lógica WhatsApp (Actualizada con Envío)
  const generarMensajeWhatsApp = () => {
    const itemsList = cart.map(item => 
      `▪️ *${item.cantidad}x* ${item.nombre} ($${(item.cantidad * (Number(item.precio) || 0)).toFixed(2)})`
    ).join('\n');

    return `👋 Hola LV PARTS, quiero confirmar el siguiente pedido:

${itemsList}
${conEnvio ? `▪️ *Envío / Transporte:* $${COSTO_ENVIO.toFixed(2)}` : ''}

💰 *TOTAL A PAGAR: $${totalFinal.toFixed(2)}*

📋 *Datos de Envío:*
👤 Nombre: ${formData.nombre.trim() || 'No especificado'}
📍 Ciudad/Dirección: ${formData.ciudad.trim() || 'No especificado'}
💳 Pago: ${formData.metodoPago}

¿Me confirman para transferir?`;
  };

  // 2. Lógica Proforma (Actualizada con Envío)
  const generarTextoProforma = () => {
    const date = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });
    const itemsList = cart.map(item => 
      `Cant: ${item.cantidad} | ${item.nombre} | $${(item.cantidad * (Number(item.precio) || 0)).toFixed(2)}`
    ).join('\n');

    return `📄 *COTIZACIÓN / PROFORMA - LV PARTS*
📅 Fecha: ${date}
👤 Cliente: ${formData.nombre.trim() || 'Consumidor Final'}
📍 Destino: ${formData.ciudad.trim() || 'Pendiente'}

*DETALLE DEL PEDIDO:*
--------------------------------
${itemsList}
--------------------------------
SUBTOTAL: $${cartTotal.toFixed(2)}
${conEnvio ? `ENVÍO:    $${COSTO_ENVIO.toFixed(2)}` : ''}
*TOTAL:    $${totalFinal.toFixed(2)}*

💳 Método Sugerido: ${formData.metodoPago}
⚠️ *Precios sujetos a disponibilidad.*`;
  };

  const handleCheckout = () => {
    const mensaje = generarMensajeWhatsApp();
    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleCopyProforma = async () => {
    const texto = generarTextoProforma();
    try {
      await navigator.clipboard.writeText(texto);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={closeCart}
      />

      <div className="relative w-full md:max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
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
              <div className="space-y-3">
                {cart.map(item => {
                  const subtotal = (Number(item.precio) || 0) * (item.cantidad || item.cant || 0);
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
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors text-slate-600 active:scale-95"><Minus size={12}/></button>
                          <span className="text-xs font-bold w-4 text-center text-slate-900">{item.cantidad || item.cant || 0}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 bg-slate-900 hover:bg-slate-800 text-white rounded flex items-center justify-center transition-colors active:scale-95"><Plus size={12}/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* OPCIONES DE ENVÍO - NUEVO */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="text-slate-700 w-5 h-5" />
                    <span className="text-sm font-bold text-slate-800">Incluir Envío</span>
                  </div>
                  
                  {/* SWITCH CUSTOMIZADO */}
                  <button 
                    onClick={() => setConEnvio(!conEnvio)}
                    className={`w-11 h-6 flex items-center rounded-full transition-colors duration-300 ${conEnvio ? 'bg-red-600' : 'bg-gray-300'}`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${conEnvio ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {conEnvio && (
                  <p className="text-xs text-gray-500 mt-2 text-right">
                    Costo adicional: <span className="font-bold text-slate-900">${COSTO_ENVIO.toFixed(2)}</span>
                  </p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <User size={16} className="text-red-600" /> Datos del Cliente
                </h3>
                <div className="space-y-3">
                  <input type="text" name="nombre" placeholder="Nombre (opcional)" value={formData.nombre} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 outline-none transition-all" />
                  <input type="text" name="ciudad" placeholder="Ciudad / Dirección" value={formData.ciudad} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 outline-none transition-all" />
                  <div className="relative">
                    <select name="metodoPago" value={formData.metodoPago} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 outline-none appearance-none">
                      <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                      <option value="Depósito">Depósito en Agente</option>
                      <option value="Efectivo en Local">Efectivo en Local</option>
                    </select>
                    <ArrowRight size={14} className="absolute right-3 top-3.5 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t bg-white pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
          <div className="space-y-1 mb-4">
             <div className="flex justify-between items-center text-gray-500 text-sm">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
             </div>
             {conEnvio && (
               <div className="flex justify-between items-center text-slate-700 text-sm font-medium">
                  <span>Envío</span>
                  <span>${COSTO_ENVIO.toFixed(2)}</span>
               </div>
             )}
             <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  ${totalFinal.toFixed(2)}
                </span>
             </div>
          </div>
          
          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <button
               onClick={handleCopyProforma}
               disabled={cart.length === 0}
               className={`font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all border ${
                 copied 
                   ? 'bg-slate-800 text-white border-slate-800' 
                   : 'bg-white text-slate-700 border-slate-300 hover:bg-gray-50 hover:border-slate-400'
               } ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            >
               {copied ? <Check size={18} /> : <FileText size={18} />}
               <span className="text-sm">{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>

            <button 
              onClick={handleCheckout} 
              disabled={cart.length === 0}
              className={`font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all transform active:scale-[0.98] ${
                cart.length === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-lg hover:shadow-green-500/30'
              }`}
            >
              <MessageCircle size={20} className="fill-current" />
              {cart.length === 0 ? 'Vacío' : 'Enviar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};