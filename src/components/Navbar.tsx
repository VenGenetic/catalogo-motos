import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Sun, Moon, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { APP_CONFIG } from '../config/constants';

export const Navbar = () => {
  const { cartCount, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleWhatsappClick = () => {
    const mensaje = "Hola LV PARTS, quisiera cotizar unos repuestos.";
    const url = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <nav className="bg-white/95 dark:bg-brand-bg/95 text-slate-800 dark:text-white sticky top-0 z-50 px-4 md:px-8 border-b border-gray-150 dark:border-brand-border/60 backdrop-blur-md transition-colors h-20 flex items-center shadow-sm">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="p-1 overflow-hidden shrink-0">
              <img 
                src="/logo.svg" 
                alt="LV PARTS Logo" 
                className="w-10 h-10 md:w-11 md:h-11 object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex items-center gap-1 font-anton text-xl md:text-2xl tracking-widest text-slate-900 dark:text-white">
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
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="hover:text-brand-orange transition-colors text-slate-500 dark:text-gray-400"
              aria-label="Toggle Dark Mode"
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
              className="hidden lg:flex items-center gap-2 text-brand-orange hover:text-brand-orange/80 transition-colors font-geist text-xs font-bold uppercase tracking-widest active:scale-95 shrink-0"
            >
              <ShoppingBag className="w-4.5 h-4.5 animate-pulse" />
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
              className="lg:hidden relative text-slate-700 dark:text-gray-300 hover:text-brand-orange dark:hover:text-brand-orange transition-colors active:scale-95"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Botón WhatsApp Cotizar */}
            <button 
              onClick={handleWhatsappClick}
              className="bg-[#25D366] hover:bg-[#20ba5a] text-black px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-md active:scale-95 font-geist text-[10px] md:text-xs uppercase tracking-wider shrink-0"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              <span className="hidden sm:inline">Cotizar</span>
            </button>

          </div>

      </div>
    </nav>
  );
};