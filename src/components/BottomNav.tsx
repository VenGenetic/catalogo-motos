import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingBag, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const BottomNav = () => {
  const { cartCount, openCart } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a202c] backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 py-1.5 px-2 flex justify-around items-center z-40 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <Link 
        to="/"
        className={`flex flex-col items-center gap-0.5 min-w-[55px] p-1.5 rounded-lg transition-all duration-200 ${
          isActive('/') 
            ? 'text-red-600 bg-red-50' 
            : 'text-gray-400 hover:text-gray-600 active:scale-95'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[9px] font-bold">Inicio</span>
      </Link>
      
      <Link 
        to="/catalogo"
        className={`flex flex-col items-center gap-0.5 min-w-[55px] p-1.5 rounded-lg transition-all duration-200 ${
          isActive('/catalogo') 
            ? 'text-red-600 bg-red-50' 
            : 'text-gray-400 hover:text-gray-600 active:scale-95'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span className="text-[9px] font-bold">Catálogo</span>
      </Link>



      <button 
        onClick={openCart}
        className="flex flex-col items-center gap-0.5 relative text-gray-400 min-w-[55px] p-1.5 rounded-lg transition-all duration-200 hover:text-gray-600 active:scale-95"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse shadow-sm">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold">Carrito</span>
      </button>

      <Link 
        to="/contacto"
        className={`flex flex-col items-center gap-1 min-w-[50px] p-1 ${isActive('/contacto') ? 'text-red-600' : 'text-gray-400'}`}
      >
        <Phone className="w-6 h-6" />
        <span className="text-[10px] font-bold">Contacto</span>
      </Link>
    </div>
  );
};