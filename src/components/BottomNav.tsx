import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingBag, Phone, Heart } from 'lucide-react'; // Importamos Heart
import { useCart } from '../context/CartContext';

export const BottomNav = () => {
  const { cartCount, openCart } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-2 flex justify-around items-center z-40 pb-safe">
      <Link 
        to="/"
        className={`flex flex-col items-center gap-1 min-w-[50px] p-1 ${isActive('/') ? 'text-red-600' : 'text-gray-400'}`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-bold">Inicio</span>
      </Link>
      
      <Link 
        to="/catalogo"
        className={`flex flex-col items-center gap-1 min-w-[50px] p-1 ${isActive('/catalogo') ? 'text-red-600' : 'text-gray-400'}`}
      >
        <Grid className="w-6 h-6" />
        <span className="text-[10px] font-bold">Catálogo</span>
      </Link>

      {/* NUEVO BOTÓN FAVORITOS */}
      <Link 
        to="/favoritos"
        className={`flex flex-col items-center gap-1 min-w-[50px] p-1 ${isActive('/favoritos') ? 'text-red-600' : 'text-gray-400'}`}
      >
        <Heart className="w-6 h-6" />
        <span className="text-[10px] font-bold">Favoritos</span>
      </Link>

      <button 
        onClick={openCart}
        className="flex flex-col items-center gap-1 relative text-gray-400 min-w-[50px] p-1"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold">Carrito</span>
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