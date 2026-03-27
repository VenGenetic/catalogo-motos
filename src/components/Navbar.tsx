import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Sun, Moon } from 'lucide-react'; // <--- CORREGIDO: Se eliminó 'Menu'
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const { cartCount, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#1a202c] text-white sticky top-0 z-50 px-4 py-3 md:py-0 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between md:h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="p-1 md:p-1.5 overflow-hidden">
              <img 
                src="/icono-daytona.png" 
                alt="LV PARTS Logo" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
            </div>
            <div className="flex items-center gap-1 font-black text-xl md:text-2xl tracking-tighter">
              <span>LV</span>
              <span className="text-red-600 italic">PARTS</span>
            </div>
          </Link>

          {/* Menú Desktop — enlaces con underline activo */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link 
              to="/" 
              className={`hover:text-red-500 transition-colors py-5 relative ${
                isActive('/') 
                  ? 'text-white after:content-[\'\'] after:absolute after:-bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-red-600' 
                  : 'text-gray-400'
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/catalogo" 
              className={`hover:text-red-500 transition-colors py-5 relative ${
                isActive('/catalogo') || location.pathname.startsWith('/catalogo/')
                  ? 'text-white after:content-[\'\'] after:absolute after:-bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-red-600' 
                  : 'text-gray-400'
              }`}
            >
              Catálogo
            </Link>
            <Link 
              to="/contacto" 
              className={`hover:text-red-500 transition-colors py-5 relative ${
                isActive('/contacto') 
                  ? 'text-white after:content-[\'\'] after:absolute after:-bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-red-600' 
                  : 'text-gray-400'
              }`}
            >
              Contacto
            </Link>
          </div>

          {/* Acciones Derecha */}
          <div className="flex items-center gap-3 md:gap-5">
             {/* Favoritos */}
            <Link to="/favoritos" className="hidden md:block hover:text-red-500 transition-colors relative group">
               <Heart className={`w-5 h-5 transition-all ${isActive('/favoritos') ? 'fill-red-500 text-red-500' : ''}`} />
               <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                 Mis Favoritos
               </span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="hidden md:block hover:text-red-500 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Carrito */}
            <button 
              onClick={openCart} 
              className="relative hover:text-red-500 transition-colors active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 md:w-[22px] md:h-[22px]" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

      </div>
    </nav>
  );
};