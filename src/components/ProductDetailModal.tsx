import { useEffect, useState } from 'react';
import { ArrowLeft, X, Plus, MessageCircle, Shield, CheckCircle, Package, ShoppingBag } from 'lucide-react';
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
  const [isVisible, setIsVisible] = useState(false);

  // Efecto para animación de entrada suave
  useEffect(() => {
    if (product) {
      setIsVisible(true);
      // Bloquear scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product);
    // Opcional: Cerrar modal al agregar o dar feedback
    // onClose(); 
  };

  const handleConsult = () => {
    const precio = Number(product.precio) || 0;
    const mensaje = `Hola LV PARTS, estoy interesado en este repuesto:
    
📌 *${product.nombre}*
${product.codigo_referencia ? `⚙️ Ref: ${product.codigo_referencia}` : ''}
💰 Precio: $${precio.toFixed(2)}

¿Me pueden confirmar disponibilidad exacta para mi moto?`;

    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const precioSeguro = Number(product.precio) || 0;

  return (
    <div 
      className={`fixed inset-0 z-[60] flex items-end md:items-center justify-center transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'
      }`}
      onClick={onClose} // Clic afuera cierra el modal
    >
      
      {/* Botón Cerrar Móvil Flotante */}
      <button 
        onClick={onClose} 
        className="md:hidden absolute top-4 left-4 z-20 bg-white/90 p-2 rounded-full shadow-lg backdrop-blur-md active:scale-90 transition-transform"
      >
        <ArrowLeft className="w-6 h-6 text-slate-900" />
      </button>

      {/* Contenedor Principal */}
      <div 
        className={`w-full h-[90vh] md:h-auto md:max-w-4xl md:max-h-[85vh] bg-white rounded-t-3xl md:rounded-2xl flex flex-col md:flex-row overflow-hidden relative shadow-2xl transform transition-transform duration-300 ${
          isVisible ? 'translate-y-0 scale-100' : 'translate-y-full md:translate-y-10 md:scale-95'
        }`}
        onClick={e => e.stopPropagation()} // Evitar cierre al hacer clic dentro
      >
        
        {/* Botón Cerrar Desktop */}
        <button 
          onClick={onClose} 
          className="hidden md:block absolute top-4 right-4 z-20 bg-white/80 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>

        {/* COLUMNA IZQUIERDA: Imagen */}
        <div className="w-full md:w-1/2 bg-gray-50 relative shrink-0 flex items-center justify-center h-[40vh] md:h-auto min-h-[300px]">
          <div className="w-full h-full absolute inset-0">
             <ImageZoom src={optimizarImg(product.imagen)} alt={product.nombre} />
          </div>
          
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none flex items-center gap-1">
            <Plus size={10} /> ZOOM
          </div>
        </div>

        {/* COLUMNA DERECHA: Información */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 md:pb-8 custom-scrollbar">
            
            {/* Header Producto */}
            <div className="flex flex-col gap-1 mb-4">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider w-max bg-red-50 px-2 py-1 rounded-md">
                {product.seccion || 'Repuesto'}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
                {product.nombre}
              </h2>
              {product.codigo_referencia && (
                <p className="text-sm text-gray-400 font-mono flex items-center gap-1">
                  <span className="text-gray-300">#</span> {product.codigo_referencia}
                </p>
              )}
            </div>

            {/* Precio y Disponibilidad */}
            <div className="my-6 border-t border-b border-gray-50 py-5 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Precio Online</span>
                <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  ${precioSeguro.toFixed(2)}
                </span>
              </div>
              {product.stock !== false ? (
                <div className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-green-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  En Stock
                </div>
              ) : (
                 <div className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-xs font-bold border border-gray-200">
                   Agotado
                 </div>
              )}
            </div>

            {/* SECCIÓN DE CONFIANZA (Trust Signals) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Compra Protegida</span>
                  <span className="text-[10px] text-slate-500 leading-tight">Garantía directa LV PARTS en todos tus repuestos.</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-green-100 transition-colors">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Compatible</span>
                  <span className="text-[10px] text-slate-500 leading-tight">Verificado por expertos para tu modelo.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-orange-100 transition-colors sm:col-span-2">
                <Package className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Envíos a todo Ecuador</span>
                  <span className="text-[10px] text-slate-500 leading-tight">Despachamos el mismo día si confirmas antes de las 4PM.</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed border-l-4 border-gray-100 pl-4 py-1">
              Este repuesto ha sido inspeccionado para cumplir con los estándares de calidad originales. 
              <br/><span className="text-xs text-gray-400 mt-1 block">¿Dudas? Consulta con nuestro técnico abajo.</span>
            </p>

            {/* Acciones Desktop */}
            <div className="hidden md:flex gap-4 mt-8">
              <button 
                onClick={handleAdd}
                className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-slate-200 group"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                Agregar al Pedido
              </button>
              <button 
                onClick={handleConsult}
                className="flex-1 border-2 border-slate-200 text-slate-700 py-4 rounded-xl font-bold hover:border-slate-900 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Consultar
              </button>
            </div>
          </div>

          {/* Acciones Flotantes Móvil (Sticky Bottom) */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3 z-30 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button 
              onClick={handleConsult}
              className="flex-[0.8] bg-white border border-gray-200 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm active:bg-gray-50"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={handleAdd}
              className="flex-[2] bg-red-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 text-sm active:bg-red-700 transition-transform active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" /> 
              Agregar ${precioSeguro.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};