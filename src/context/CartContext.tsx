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
  
  // Estado para la notificación visual (Toast)
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Cargar carrito del localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart_backup');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart_backup', JSON.stringify(cart));
  }, [cart]);

  // Manejar tiempo de vida del Toast (2 segundos)
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const addToCart = (product: Producto) => {
    // 1. Feedback Táctil (Vibración en móviles)
    if (navigator.vibrate) navigator.vibrate(50);
    
    // 2. Feedback Visual (Toast)
    setToastMsg(`Agregado: ${product.nombre.substring(0, 20)}...`);

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
    
    // Opcional: Si prefieres que NO se abra el carrito automáticamente, comenta la siguiente línea:
    setIsOpen(true);
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

  const sendOrderToWhatsapp = () => {
    let msg = "Hola LV PARTS, mi pedido:\n\n";
    cart.forEach(i => msg += `▪ ${i.cantidad || i.cant}x ${i.nombre}\n`);
    msg += `\nTotal: $${cartTotal.toFixed(2)}`;
    window.open(`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <CartContext.Provider value={{
      cart, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
      addToCart, updateQuantity, cartCount, cartTotal, sendOrderToWhatsapp
    }}>
      {children}

      {/* RENDERIZADO DEL TOAST FLOTANTE */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up w-max max-w-[90%]">
          <div className="bg-slate-900/95 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-slate-700">
            <div className="bg-green-500 rounded-full p-1">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-bold">{toastMsg}</span>
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