import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingBag, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const BottomNav = () => {
  const { cartCount, openCart } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-brand-bg/95 backdrop-blur-lg border-t border-gray-150 dark:border-brand-border/60 py-1.5 px-2 flex justify-around items-center z-40 pb-safe shadow-[0_-2px_15px_rgba(0,0,0,0.06)] font-geist transition-colors">
      <Link 
        to="/"
        className={`flex flex-col items-center gap-1 min-w-[60px] p-1.5 rounded-xl transition-all duration-250 ${
          isActive('/') 
            ? 'text-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 font-bold' 
            : 'text-slate-500 dark:text-gray-400 active:scale-95'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[8px] tracking-wider uppercase font-bold">Inicio</span>
      </Link>
      
      <Link 
        to="/catalogo"
        className={`flex flex-col items-center gap-1 min-w-[60px] p-1.5 rounded-xl transition-all duration-250 ${
          isActive('/catalogo') || location.pathname.startsWith('/catalogo/')
            ? 'text-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 font-bold' 
            : 'text-slate-500 dark:text-gray-400 active:scale-95'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span className="text-[8px] tracking-wider uppercase font-bold">Catálogo</span>
      </Link>

      <button 
        onClick={openCart}
        className="flex flex-col items-center gap-1 min-w-[60px] p-1.5 rounded-xl transition-all duration-250 text-slate-500 dark:text-gray-400 active:scale-95 hover:text-brand-orange"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 animate-pulse" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-brand-orange text-white text-[9px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[8px] tracking-wider uppercase font-bold">Carrito</span>
      </button>

      <Link 
        to="/contacto"
        className={`flex flex-col items-center gap-1 min-w-[60px] p-1.5 rounded-xl transition-all duration-250 ${
          isActive('/contacto') 
            ? 'text-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 font-bold' 
            : 'text-slate-500 dark:text-gray-400 active:scale-95'
        }`}
      >
        <Phone className="w-5 h-5" />
        <span className="text-[8px] tracking-wider uppercase font-bold">Contacto</span>
      </Link>
    </div>
  );
};