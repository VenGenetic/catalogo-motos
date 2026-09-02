import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Sun, Moon, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { APP_CONFIG } from '../config/constants';
import { trackContact } from '../utils/tracking';

export const Navbar = () => {
  const { cartCount, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleWhatsappClick = () => {
    trackContact('navbar_cotizar');
    const mensaje = "Hola LV PARTS, quisiera cotizar unos repuestos.";
    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <nav className="sticky top-0 z-nav flex h-16 items-center border-b border-ui-border bg-ui-surface/95 px-3 text-ui-ink shadow-sm backdrop-blur-md transition-colors sm:px-4 md:h-20 md:px-8">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-1.5 sm:gap-2" aria-label="LV PARTS - Inicio">
            <div className="p-1 overflow-hidden shrink-0">
              <img 
                src="/logo.svg" 
                alt="LV PARTS Logo" 
                className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105 md:h-11 md:w-11"
              />
            </div>
            <div className="hidden items-center gap-1 font-anton text-xl tracking-widest text-ui-ink min-[360px]:flex md:text-2xl">
              <span>LV</span>
              <span className="text-brand-orange italic">PARTS</span>
            </div>
          </Link>

          {/* Menú Desktop — enlaces con estilo Geist y Hanken */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest uppercase font-geist">
            <Link 
              to="/" 
              className={`hover:text-brand-orange transition-colors py-2 border-b-2 relative ${
                isActive('/') 
                  ? 'text-brand-orange border-brand-orange' 
                  : 'text-slate-500 dark:text-gray-400 border-transparent'
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/catalogo" 
              className={`hover:text-brand-orange transition-colors py-2 border-b-2 relative ${
                isActive('/catalogo') || location.pathname.startsWith('/catalogo/')
                  ? 'text-brand-orange border-brand-orange' 
                  : 'text-slate-500 dark:text-gray-400 border-transparent'
              }`}
            >
              Catálogo
            </Link>
            <Link 
              to="/contacto" 
              className={`hover:text-brand-orange transition-colors py-2 border-b-2 relative ${
                isActive('/contacto') 
                  ? 'text-brand-orange border-brand-orange' 
                  : 'text-slate-500 dark:text-gray-400 border-transparent'
              }`}
            >
              Contacto
            </Link>
          </div>

          {/* Acciones Derecha */}
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-6">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="touch-target flex items-center justify-center rounded-xl text-ui-copy transition-colors hover:bg-ui-muted hover:text-brand-orange"
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Carrito Full-Text (Desktop) */}
            <button 
              onClick={openCart} 
              className="hidden items-center gap-2 font-geist text-xs font-bold uppercase tracking-widest text-brand-orange transition-colors hover:text-brand-orange/80 active:scale-95 lg:flex"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <span>Ver Repuestos</span>
              {cartCount > 0 && (
                <span className="bg-brand-orange text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Carrito Icon (Mobile/Tablet) */}
            <button 
              onClick={openCart} 
              className="touch-target relative flex items-center justify-center rounded-xl text-ui-copy transition-colors hover:bg-ui-muted hover:text-brand-orange active:scale-95 lg:hidden"
              aria-label="Abrir carrito de repuestos"
            >
              <ShoppingBag className="h-[22px] w-[22px]" />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-brand-bg shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Botón WhatsApp Cotizar */}
            <button 
              onClick={handleWhatsappClick}
              className="touch-target flex shrink-0 items-center gap-2 rounded-xl bg-[#25D366] px-3 font-geist text-[11px] font-bold uppercase tracking-wider text-brand-bg shadow-md transition-all duration-300 hover:bg-[#20ba5a] active:scale-95 sm:px-4 md:text-xs"
              aria-label="Cotizar por WhatsApp"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              <span className="hidden sm:inline">Cotizar</span>
            </button>

          </div>

      </div>
    </nav>
  );
};
