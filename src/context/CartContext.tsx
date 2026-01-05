import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Producto } from '../types';
import { APP_CONFIG } from '../config/constants';
import { useToast } from './ToastContext'; // <--- Importamos el hook de notificaciones

// Extendemos el tipo Producto para incluir la cantidad en el carrito
export interface CartItem extends Producto {
  cantidad: number;
  // Propiedad opcional por compatibilidad si en algún lado usaste 'cant'
  cant?: number; 
}

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
  const { showToast } = useToast(); // <--- Usamos el contexto de Toasts
  const [isOpen, setIsOpen] = useState(false);
  
  // Inicializamos el carrito desde LocalStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      return [];
    }
  });

  // Guardamos en LocalStorage cada vez que cambia el carrito
  useEffect(() => {
    localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_CART, JSON.stringify(cart));
  }, [cart]);

  // Agregar producto
  const addToCart = (product: Producto) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      if (existing) {
        // Si ya existe, aumentamos cantidad
        showToast(`Se agregó otra unidad: ${product.nombre}`, 'info');
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, cantidad: (item.cantidad || 1) + 1 } 
            : item
        );
      } else {
        // Si es nuevo, lo agregamos
        showToast(`✅ Agregado al carrito: ${product.nombre}`, 'success');
        return [...prev, { ...product, cantidad: 1 }];
      }
    });
    
    // Opcional: Abrir el carrito automáticamente al agregar
    setIsOpen(true);
  };

  // Eliminar producto
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast('Producto eliminado', 'error');
  };

  // Actualizar cantidad (+/-)
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, (item.cantidad || 0) + delta);
          return { ...item, cantidad: newQuantity };
        }
        return item;
      }).filter(item => item.cantidad > 0); // Eliminamos si la cantidad baja a 0
    });
  };

  // Limpiar carrito
  const clearCart = () => {
    setCart([]);
    setIsOpen(false);
  };

  // Abrir/Cerrar Drawer
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Cálculos
  const cartCount = cart.reduce((acc, item) => acc + (item.cantidad || 0), 0);
  
  const cartTotal = cart.reduce((acc, item) => {
    const precio = Number(item.precio) || 0;
    return acc + (precio * (item.cantidad || 0));
  }, 0);

  // Función básica de WhatsApp (Nota: CartDrawer usa su propia lógica con formulario ahora)
  const sendOrderToWhatsapp = () => {
    const itemsList = cart.map(item => 
      `▪️ ${item.cantidad}x ${item.nombre} - $${((Number(item.precio)||0) * item.cantidad).toFixed(2)}`
    ).join('\n');

    const message = `Hola, quiero pedir lo siguiente:\n\n${itemsList}\n\n*Total: $${cartTotal.toFixed(2)}*`;
    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isOpen,
      openCart,
      closeCart,
      sendOrderToWhatsapp
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