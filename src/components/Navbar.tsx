import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { cartCount, openCart } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo con Link a Inicio */}
          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="bg-red-600 p-2 rounded-lg">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-bold text-lg md:text-xl tracking-wider">LV <span className="text-red-500">PARTS</span></span>
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className={`font-medium transition-colors ${isActive('/') ? 'text-red-500' : 'hover:text-red-400'}`}>Inicio</Link>
            <Link to="/catalogo" className={`font-medium transition-colors ${isActive('/catalogo') ? 'text-red-500' : 'hover:text-red-400'}`}>Catálogo</Link>
            
            {/* CORRECCIÓN: Ahora usamos el componente Heart aquí para evitar el error */}
            <Link to="/favoritos" className={`font-medium transition-colors flex items-center gap-2 ${isActive('/favoritos') ? 'text-red-500' : 'hover:text-red-400'}`}>
               <Heart className="w-5 h-5" /> Favoritos
            </Link>
            
            <Link to="/contacto" className={`font-medium transition-colors ${isActive('/contacto') ? 'text-red-500' : 'hover:text-red-400'}`}>Contacto</Link>
            
            <button onClick={openCart} className="relative p-2 bg-slate-800 rounded-full hover:bg-red-600 transition-colors">
              <ShoppingBag className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};