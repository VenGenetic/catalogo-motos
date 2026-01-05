import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Producto } from '../types';
import { APP_CONFIG } from '../config/constants';
import { useToast } from './ToastContext';

// Interfaz del ítem del carrito
export interface CartItem extends Producto {
  cantidad: number;
  cant?: number; 
}

// Interfaz del Contexto
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Producto) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  sendOrderToWhatsapp: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_CART || 'lvparts_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_CART || 'lvparts_cart_v1', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Producto) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        showToast(`Se agregó otra unidad: ${product.nombre}`, 'info');
        return prev.map(item => 
          item.id === product.id ? { ...item, cantidad: (item.cantidad || 1) + 1 } : item
        );
      } else {
        showToast(`✅ Agregado: ${product.nombre}`, 'success');
        return [...prev, { ...product, cantidad: 1 }];
      }
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast('Producto eliminado', 'error');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, cantidad: Math.max(0, (item.cantidad || 0) + delta) };
        }
        return item;
      }).filter(item => item.cantidad > 0);
    });
  };

  const clearCart = () => {
    setCart([]);
    setIsOpen(false);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const cartCount = cart.reduce((acc, item) => acc + (item.cantidad || 0), 0);
  
  const cartTotal = cart.reduce((acc, item) => {
    return acc + ((Number(item.precio) || 0) * (item.cantidad || 0));
  }, 0);

  const sendOrderToWhatsapp = () => {
    const itemsList = cart.map(item => 
      `▪️ ${item.cantidad}x ${item.nombre}`
    ).join('\n');
    const message = `Pedido Web:\n${itemsList}\nTotal: $${cartTotal.toFixed(2)}`;
    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, isOpen, openCart, closeCart, sendOrderToWhatsapp
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};