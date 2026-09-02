import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingBag, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const BottomNav = () => {
  const { cartCount, openCart } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-nav flex items-center justify-around border-t border-ui-border bg-ui-surface/95 px-2 pb-safe pt-1.5 font-geist shadow-[0_-4px_24px_rgba(5,20,36,0.08)] backdrop-blur-lg transition-colors md:hidden" aria-label="Navegación principal">
      <Link 
        to="/"
        className={`flex min-h-[50px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl p-1.5 transition-all duration-300 ${
          isActive('/') 
            ? 'text-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 font-bold' 
            : 'text-ui-copy active:scale-95'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Inicio</span>
      </Link>
      
      <Link 
        to="/catalogo"
        className={`flex min-h-[50px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl p-1.5 transition-all duration-300 ${
          isActive('/catalogo') || location.pathname.startsWith('/catalogo/')
            ? 'text-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 font-bold' 
            : 'text-ui-copy active:scale-95'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Catálogo</span>
      </Link>

      <button 
        onClick={openCart}
        className="flex min-h-[50px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl p-1.5 text-ui-copy transition-all duration-300 hover:text-brand-orange active:scale-95"
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-orange text-[10px] font-extrabold text-brand-bg shadow-sm">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">Carrito</span>
      </button>

      <Link 
        to="/contacto"
        className={`flex min-h-[50px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl p-1.5 transition-all duration-300 ${
          isActive('/contacto') 
            ? 'text-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 font-bold' 
            : 'text-ui-copy active:scale-95'
        }`}
      >
        <Phone className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Contacto</span>
      </Link>
    </nav>
  );
};
