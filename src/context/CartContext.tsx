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
  
  // --- NUEVO: Estado para el Toast ---
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart_backup');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart_backup', JSON.stringify(cart));
  }, [cart]);

  // --- LÓGICA DEL TOAST ---
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 2000); // Se oculta en 2 segundos
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const addToCart = (product: Producto) => {
    // Feedback táctil
    if (navigator.vibrate) navigator.vibrate(50);
    
    // Feedback visual (Toast)
    setToastMsg(`¡${product.nombre} agregado!`);

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
    // Opcional: No abrir el carrito automáticamente para no interrumpir la compra
    // setIsOpen(true); 
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
      
      {/* --- RENDERIZADO DEL TOAST --- */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-green-400">✓</span>
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