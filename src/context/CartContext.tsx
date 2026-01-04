// src/context/CartContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Producto, ItemCarrito } from '../types';
import { APP_CONFIG } from '../config/constants';

interface CartContextType {
  cart: ItemCarrito[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Producto) => void;
  updateQuantity: (id: string, delta: number) => void;
  cartCount: number;
  cartTotal: number;
  sendOrderToWhatsapp: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<ItemCarrito[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // --- Estado para el Toast (Notificación) ---
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Cargar carrito guardado del localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart_backup');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
  }, []);

  // Guardar carrito al cambiar
  useEffect(() => {
    localStorage.setItem('cart_backup', JSON.stringify(cart));
  }, [cart]);

  // Temporizador para ocultar el Toast automáticamente
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const addToCart = (product: Producto) => {
    // BLINDAJE: Verificamos que 'navigator' y 'vibrate' existan antes de llamar
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(50); } catch (e) { /* Ignorar error de vibración */ }
    }
    
    // Feedback visual (Toast)
    const nombreCorto = product.nombre.length > 25 
      ? product.nombre.substring(0, 25) + '...' 
      : product.nombre;
      
    setToastMsg(`Agregado: ${nombreCorto}`);

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => 
          i.id === product.id 
            ? { ...i, cantidad: (i.cantidad || i.cant || 0) + 1 } 
            : i
        );
      }
      return [...prev, { ...product, cantidad: 1, cant: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQty = (item.cantidad || item.cant || 0) + delta;
          return { ...item, cantidad: newQty, cant: newQty };
        }
        return item;
      }).filter(item => (item.cantidad || item.cant || 0) > 0)
    );
  };

  const cartCount = cart.reduce((acc, item) => acc + (item.cantidad || item.cant || 0), 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.precio * (item.cantidad || item.cant || 0), 0);

  // --- FUNCIÓN ACTUALIZADA CON FORMATO VERTICAL ---
  const sendOrderToWhatsapp = () => {
    let msg = "Hola LV PARTS, mi pedido:\n\n";
    
    cart.forEach(i => {
      const cantidad = i.cantidad || i.cant || 0;
      const precioUnitario = Number(i.precio).toFixed(2);
      
      // Línea 1: Cantidad y Nombre (Usamos ▪ como viñeta principal)
      msg += `▪ ${cantidad}x ${i.nombre}\n`;
      
      // Línea 2: Referencia (si existe)
      if (i.codigo_referencia) {
        msg += `• Ref: ${i.codigo_referencia}\n`;
      }
      
      // Línea 3: Precio
      msg += `• $${precioUnitario}\n`;
    });

    msg += `\nTotal: $${cartTotal.toFixed(2)}`;
    window.open(`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <CartContext.Provider value={{
      cart, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
      addToCart, updateQuantity, cartCount, cartTotal, sendOrderToWhatsapp
    }}>
      {children}
      
      {/* Componente Toast Renderizado Globalmente */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up w-max max-w-[90%] pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700">
             <div className="bg-green-500 rounded-full p-0.5">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
               </svg>
             </div>
             <span className="text-xs md:text-sm font-bold">{toastMsg}</span>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
};