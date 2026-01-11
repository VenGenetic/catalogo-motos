import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Producto, ItemCarrito } from '../types';
import { APP_CONFIG } from '../config/constants';

// Definición del Tipo del Contexto
interface CartContextType {
  cart: ItemCarrito[];
  isOpen: boolean;
  total: number;
  itemCount: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Producto, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Clave para guardar en LocalStorage
const CART_STORAGE_KEY = 'vengenetic_cart_v1';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Estado del carrito inicializado desde localStorage si existe
  const [cart, setCart] = useState<ItemCarrito[]>(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Error cargando el carrito:", error);
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  // Guardar en localStorage cada vez que el carrito cambia
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Cálculos derivados (optimizados con useMemo)
  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Acciones
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (product: Producto, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // Si ya existe, actualizamos la cantidad
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Si no existe, lo agregamos como nuevo ItemCarrito
        const newItem: ItemCarrito = { ...product, quantity };
        return [...prevCart, newItem];
      }
    });
    setIsOpen(true); // Opcional: abrir el carrito al agregar
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setIsOpen(false);
  };

  // Generador de Mensaje de WhatsApp
  const checkout = () => {
    if (cart.length === 0) return;

    const phoneNumber = APP_CONFIG.WHATSAPP_NUMBER || "573000000000"; // Fallback por seguridad
    const lineBreak = "%0A";
    
    let message = `Hola Vengenetic, quiero realizar el siguiente pedido:${lineBreak}${lineBreak}`;

    cart.forEach((item, index) => {
      const subtotal = (item.price * item.quantity).toLocaleString();
      // Formato: 1. Nombre (SKU) - Cant x Precio = Subtotal
      message += `*${index + 1}. ${item.name}*${lineBreak}`;
      message += `   Ref: ${item.id}${lineBreak}`;
      message += `   Cant: ${item.quantity} x $${item.price.toLocaleString()} = $${subtotal}${lineBreak}${lineBreak}`;
    });

    message += `*TOTAL A PAGAR: $${total.toLocaleString()}*`;
    message += `${lineBreak}${lineBreak}Quedo atento a la confirmación y datos de pago.`;

    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        total,
        itemCount,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
      }}
    >
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