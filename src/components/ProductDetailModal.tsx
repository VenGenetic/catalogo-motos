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

  // Función para extraer modelos del nombre del producto
  const extraerModelos = (nombre: string): string[] => {
    const modelos: string[] = [];
    const nombreUpper = nombre.toUpperCase();

    // Lista ampliada de modelos conocidos
    const modelosConocidos = [
      // Deportivas
      'TEKKEN EVO', 'AXXO TRACKER', 'WING EVO', 'GTR', 'PREDATOR', 'SPITFIRE',
      'WOLF', 'GP1', 'XPOWER', 'COMMANDER', 'CAFE RACER', 'SUPER WOLF',

      // Utilitarias
      'WORK FORCE', 'WORKFORCE', 'DELTA', 'CRUCERO',

      // Clásicas
      'SCRAMBLER REVOLUTION', 'SCRAMBLER MAX',

      // Doble propósito
      'DK NATIVA', 'MONTANA', 'SHARK', 'FORCE DS', 'EVEREST', 'XEXPEDITION',

      // Enduro
      'EAGLE', 'SCORPION',

      // Scooters
      'DYNAMIC PRO', 'S1', 'AGILITY-X', 'BIT',

      // Caballito
      'CX7', 'TANQ',

      // Cuadrón
      'HUNTER'
    ];

    modelosConocidos.forEach(modelo => {
      if (nombreUpper.includes(modelo)) {
        modelos.push(modelo);
      }
    });

    return modelos;
  };

  const relacionados = useMemo(() => {
    if (!product) return [];

    const modelosProductoActual = extraerModelos(product!.nombre);

    // Si el producto es universal o no tiene modelos específicos, usar sección
    const esUniversal = product!.nombre.toUpperCase().includes('UNIVERSAL') ||
                       product!.nombre.toUpperCase().includes('GENÉRICO') ||
                       modelosProductoActual.length === 0;

    if (esUniversal || modelosProductoActual.length === 0) {
      return allProducts
        .filter(p => p.seccion === product!.seccion && p.id !== product!.id)
        .slice(0, 3);
    }

    // Filtrar productos que compartan al menos un modelo
    const productosRelacionados = allProducts.filter(p => {
      if (p.id === product!.id) return false;

      // Si el producto relacionado es universal, incluirlo
      if (p.nombre.toUpperCase().includes('UNIVERSAL') ||
          p.nombre.toUpperCase().includes('GENÉRICO')) {
        return true;
      }

      const modelosRelacionado = extraerModelos(p.nombre);
      const modelosCompartidos = modelosProductoActual.filter(modelo =>
        modelosRelacionado.includes(modelo)
      );

      return modelosCompartidos.length > 0;
    });

    // Si no hay suficientes productos del mismo modelo, agregar algunos de la misma sección
    if (productosRelacionados.length < 3) {
      const adicionales = allProducts
        .filter(p =>
          p.seccion === product!.seccion &&
          p.id !== product!.id &&
          !productosRelacionados.some(rel => rel.id === p.id)
        )
        .slice(0, 3 - productosRelacionados.length);

      productosRelacionados.push(...adicionales);
    }

    return productosRelacionados.slice(0, 3);
  }, [product, allProducts]);

  if (!product) return null;

  const handleAdd = () => addToCart(product!);

  const handleConsult = () => {
    const precio = Number(product!.precio) || 0;
    const mensaje = `Hola, me interesa: *${product!.nombre}* ($${precio.toFixed(2)}). ¿Tienen stock?`;
    window.open(`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const precioSeguro = Number(product!.precio) || 0;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end md:items-center justify-center transition-all duration-500 ${
        isVisible ? 'bg-black/75 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 left-4 z-20 bg-white/95 p-2.5 rounded-full shadow-lg backdrop-blur-md active:scale-90 transition-all border border-white/20"
      >
        <ArrowLeft className="w-5 h-5 text-slate-900" />
      </button>

      <div
        className={`w-full h-[96vh] md:h-auto md:max-h-[95vh] md:max-w-4xl bg-white rounded-t-3xl md:rounded-3xl flex flex-col overflow-hidden relative shadow-2xl transform transition-all duration-500 ease-out ${
          isVisible ? 'translate-y-0 scale-100' : 'translate-y-full md:translate-y-10 md:scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="hidden md:block absolute top-4 right-4 z-20 bg-white/95 p-2.5 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-lg border border-white/20"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* IMAGEN PRINCIPAL MEJORADA */}
        <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 relative shrink-0 flex items-center justify-center h-[45vh] md:h-[400px] overflow-hidden">
          <div className="w-full h-full absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
          <div className="w-full h-full absolute inset-0 flex items-center justify-center p-4">
             <ImageZoom src={optimizarImg(product!.imagen)} alt={product!.nombre} />
          </div>
          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-[10px] font-bold px-3 py-2 rounded-full backdrop-blur-sm pointer-events-none flex items-center gap-1.5 shadow-lg">
            <Plus size={12} className="text-white" /> Toca para ampliar
          </div>
          {product!.stock === false && (
            <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg">
              AGOTADO
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
          <div className="flex-1 overflow-y-auto p-5 md:p-8 pb-36 md:pb-8 custom-scrollbar">

            {/* HEADER DEL PRODUCTO */}
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider w-max bg-red-50 px-3 py-1.5 rounded-full border border-red-100 mb-3 inline-block">
                    {product!.seccion}
                  </span>
                  <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                    {product!.nombre}
                  </h2>
                  {product!.codigo_referencia && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Código:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-slate-700 border">
                        {product!.codigo_referencia}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PRECIO Y STOCK */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Precio</span>
                  <span className="text-4xl font-black text-slate-900">${precioSeguro.toFixed(2)}</span>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                  product.stock
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {product.stock ? '✓ En Stock' : '✗ Agotado'}
                </div>
              </div>

              {/* COMPATIBILIDAD SIMULADA */}
              <div className="border-t border-gray-200 pt-4">
                <span className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Compatible con</span>
                <div className="flex flex-wrap gap-2">
                  {product.nombre.toLowerCase().includes('honda') && (
                    <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium border border-orange-200">
                      Honda
                    </span>
                  )}
                  {product.nombre.toLowerCase().includes('yamaha') && (
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                      Yamaha
                    </span>
                  )}
                  {product.nombre.toLowerCase().includes('suzuki') && (
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                      Suzuki
                    </span>
                  )}
                  {product.nombre.toLowerCase().includes('kawasaki') && (
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                      Kawasaki
                    </span>
                  )}
                  <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                    + Ver más modelos
                  </span>
                </div>
              </div>
            </div>

            {/* CARACTERÍSTICAS Y BENEFICIOS */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-blue-25 p-4 rounded-xl border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Shield size={16} className="text-blue-600"/>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Garantía</div>
                  <div className="text-xs text-gray-600">6 meses</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-r from-orange-50 to-orange-25 p-4 rounded-xl border border-orange-100">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Package size={16} className="text-orange-600"/>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Envío</div>
                  <div className="text-xs text-gray-600">24-48h</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-r from-green-50 to-green-25 p-4 rounded-xl border border-green-100">
                <div className="bg-green-100 p-2 rounded-full">
                  <ShoppingBag size={16} className="text-green-600"/>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Disponible</div>
                  <div className="text-xs text-gray-600">En tienda</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-r from-purple-50 to-purple-25 p-4 rounded-xl border border-purple-100">
                <div className="bg-purple-100 p-2 rounded-full">
                  <MessageCircle size={16} className="text-purple-600"/>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Soporte</div>
                  <div className="text-xs text-gray-600">WhatsApp</div>
                </div>
              </div>
            </div>

            {/* ESPECIFICACIONES TÉCNICAS */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                Especificaciones
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoría:</span>
                  <span className="font-medium text-slate-900">{product!.categoria}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sección:</span>
                  <span className="font-medium text-slate-900">{product!.seccion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disponibilidad:</span>
                  <span className={`font-medium ${product!.stock ? 'text-green-600' : 'text-red-600'}`}>
                    {product!.stock ? 'En stock' : 'Agotado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Código:</span>
                  <span className="font-medium text-slate-900 font-mono text-xs">
                    {product!.codigo_referencia || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* PRODUCTOS RELACIONADOS */}
            {relacionados.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-base">
                  <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                  Más repuestos {product ? (extraerModelos(product!.nombre).length > 0 ? `para ${extraerModelos(product!.nombre)[0]}` : `de ${(product!.seccion || 'repuestos').toLowerCase()}`) : ''}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {relacionados.map(rel => (
                    <div
                      key={rel.id}
                      className="group cursor-pointer bg-white border border-gray-100 rounded-xl p-3 hover:shadow-lg hover:border-red-200 transition-all duration-300 active:scale-95"
                      onClick={() => onSelectRelated(rel)}
                    >
                      <div className="aspect-square rounded-lg bg-gray-50 mb-3 overflow-hidden border border-gray-50 relative">
                        <LazyImage
                          src={optimizarImg(rel.imagen)}
                          alt={rel.nombre}
                          cropBottom={false}
                          imageFit="contain"
                          className="w-full h-full bg-white group-hover:scale-105 transition-transform duration-300 p-1"
                        />
                      </div>
                      <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-tight group-hover:text-red-600 mb-1">
                        {rel.nombre}
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        ${Number(rel.precio).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* BOTONES DESKTOP */}
            <div className="hidden md:flex gap-4 mt-8">
              <button
                onClick={handleConsult}
               className="p-4 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-2xl border border-green-200 active:scale-95 transition-all shadow-sm"
             >
               <MessageCircle size={22} />
              </button>
              <button
                onClick={handleAdd}
                disabled={!product!.stock}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-2xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-3 text-base"
              >
                <ShoppingBag size={20} />
                {product!.stock ? 'Agregar al Carrito' : 'Producto Agotado'}
              </button>
            </div>
          </div>

          {/* BOTONES MÓVIL FIJOS */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 p-5 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-30 pb-safe shadow-[0_-8px_25px_rgba(0,0,0,0.08)]">
            {/* BOTÓN PRINCIPAL DE CONSULTAR - MÁS VISIBLE */}
            <button
              onClick={handleConsult}
              className="w-full mb-3 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center justify-center gap-3 text-base border-2 border-green-400"
            >
              <MessageCircle size={22} />
              Consultar Repuesto
            </button>
            
            {/* BOTÓN SECUNDARIO DE AGREGAR */}
            <button
              onClick={handleAdd}
              disabled={!product!.stock}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm"
            >
              <ShoppingBag size={18} />
              {product!.stock ? `Agregar $${precioSeguro.toFixed(2)}` : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};