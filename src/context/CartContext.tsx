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

  // Efecto opcional: Guardar carrito en LocalStorage para no perderlo al recargar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart_backup');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart_backup', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Producto) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => 
          i.id === product.id 
            ? { ...i, cantidad: (i.cantidad || i.cant || 0) + 1, cant: (i.cantidad || i.cant || 0) + 1 } 
            : i
        );
      }
      return [...prev, { ...product, cantidad: 1, cant: 1 }];
    });
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
      cart,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addToCart,
      updateQuantity,
      cartCount,
      cartTotal,
      sendOrderToWhatsapp
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
};