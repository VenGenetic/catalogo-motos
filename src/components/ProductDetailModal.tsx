import { useEffect, useState } from 'react';
import { X, ShoppingCart, MessageCircle, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async'; // Recuerda: npm install react-helmet-async
import { Product } from '../types';
import { useGarage } from '../context/GarageContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ImageZoom } from './ImageZoom'; // Asumiendo que exporta un componente que acepta src y alt

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
  const { selectedBike } = useGarage();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  // Resetear cantidad al abrir otro producto
  useEffect(() => {
    setQuantity(1);
  }, [product]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Lógica de Compatibilidad
  const isCompatible = selectedBike && product.compatibleModels?.some(model => 
    model.toLowerCase().includes(selectedBike.model.toLowerCase())
  );

  // Manejadores
  const handleAddToCart = () => {
    // Si tu contexto soporta añadir con cantidad, ajusta aquí. 
    // Si no, hacemos un loop simple o modificas tu CartContext.
    // Asumiremos que addToCart añade 1, así que lo llamamos N veces o pasamos la cantidad si es posible.
    // Lo ideal es modificar CartContext para aceptar (product, quantity).
    // Por ahora, simulamos añadir varias veces o solo una.
    
    // Opción A (si CartContext soporta cantidad): addToCart(product, quantity);
    // Opción B (Standard): 
    for (let i = 0; i < quantity; i++) {
        addToCart(product);
    }
    
    showToast(`Agregado al carrito: ${quantity}x ${product.name}`, 'success');
    onClose();
  };

  const handleWhatsAppInquiry = () => {
    const message = `Hola, me interesa saber más sobre el repuesto: *${product.name}* (ID: ${product.id}).`;
    const url = `https://wa.me/573000000000?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      
      {/* SEO Dinámico para este producto */}
      <Helmet>
        <title>{`${product.name} - Vengenetic`}</title>
        <meta 
          name="description" 
          content={`Compra ${product.name} al mejor precio. Compatible con: ${product.compatibleModels?.join(', ') || 'varios modelos'}.`} 
        />
      </Helmet>

      {/* Backdrop (Fondo oscuro) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Contenido del Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Botón Cerrar (Mobile absoluto) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition z-10 md:hidden"
        >
          <X size={24} />
        </button>

        {/* 1. Columna Imagen */}
        <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-8 relative">
          <div className="w-full max-w-sm aspect-square mix-blend-multiply">
             {/* Usamos el componente de Zoom si existe, sino fallback a img normal */}
            <ImageZoom 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Badge ID flotante */}
          <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-mono text-gray-500 border shadow-sm">
            SKU: {product.id}
          </div>
        </div>

        {/* 2. Columna Información (Scrollable) */}
        <div className="w-full md:w-1/2 flex flex-col h-full bg-white">
          
          {/* Header con botón cerrar desktop */}
          <div className="flex justify-between items-start p-6 pb-2 border-b border-gray-100">
            <div>
              <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">
                {product.category || 'Repuesto'}
              </h4>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:block p-2 text-gray-400 hover:text-red-500 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cuerpo Scrollable */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Precio */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 font-medium">/ unidad</span>
            </div>

            {/* Alerta de Compatibilidad (Garage) */}
            {selectedBike && (
              <div className={`p-4 rounded-lg border flex gap-3 ${
                isCompatible 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                {isCompatible ? (
                  <CheckCircle className="shrink-0 text-green-600" size={20} />
                ) : (
                  <AlertTriangle className="shrink-0 text-yellow-600" size={20} />
                )}
                <div>
                  <p className="font-bold text-sm">
                    {isCompatible ? 'Compatible con tu moto' : 'Revisar compatibilidad'}
                  </p>
                  <p className="text-xs opacity-90 mt-0.5">
                    {isCompatible 
                      ? `Confirmado para ${selectedBike.model}` 
                      : `Este repuesto no lista explícitamente a ${selectedBike.model}. Consulta antes de comprar.`}
                  </p>
                </div>
              </div>
            )}

            {/* Descripción */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description || "Repuesto original de alta calidad garantizada. Fabricado bajo estándares estrictos para asegurar el máximo rendimiento de tu motocicleta."}
              </p>
            </div>

            {/* Lista de Modelos Compatibles */}
            {product.compatibleModels && product.compatibleModels.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Modelos Compatibles</h3>
                <div className="flex flex-wrap gap-2">
                  {product.compatibleModels.map((model, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Fijo con Acciones */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 mt-auto">
            
            {/* Selector de Cantidad */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-gray-700">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition"
                >
                  -
                </button>
                <span className="px-3 py-1 font-semibold text-gray-900 w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleWhatsAppInquiry}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-green-500 hover:text-green-600 transition bg-white"
              >
                <MessageCircle size={20} />
                Consultar
              </button>
              
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl transition active:scale-95"
              >
                <ShoppingCart size={20} />
                Agregar ({quantity})
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};