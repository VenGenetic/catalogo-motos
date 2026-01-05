import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Menu } from 'lucide-react'; // Agregué Menu por si quieres menú móvil a futuro
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { cartCount, openCart } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white shadow-xl sticky top-0 z-50 font-sans backdrop-blur-md bg-slate-900/95 supports-[backdrop-filter]:bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo con marca reforzada */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="bg-red-600 p-2 rounded-lg group-hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl tracking-wider leading-none">
                LV <span className="text-red-500">PARTS</span>
              </span>
              <span className="text-[10px] text-gray-400 tracking-widest uppercase hidden md:block">
                Repuestos Daytona
              </span>
            </div>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden md:flex space-x-1 items-center bg-slate-800/50 p-1 rounded-full border border-slate-700/50">
            <Link 
              to="/" 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive('/') ? 'bg-slate-700 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/catalogo" 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive('/catalogo') ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Catálogo
            </Link>
            <Link 
              to="/contacto" 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive('/contacto') ? 'bg-slate-700 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Contacto
            </Link>
          </div>

          {/* Acciones Derecha */}
          <div className="flex items-center gap-3">
             {/* Favoritos */}
            <Link to="/favoritos" className="p-2 text-gray-400 hover:text-red-500 transition-colors relative group">
               <Heart className={`w-6 h-6 transition-all ${isActive('/favoritos') ? 'fill-red-500 text-red-500' : ''}`} />
               <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                 Mis Favoritos
               </span>
            </Link>

            {/* Botón Carrito Mejorado */}
            <button 
              onClick={openCart} 
              className="relative p-2 bg-slate-800 rounded-xl hover:bg-red-600 transition-all group border border-slate-700 hover:border-red-500"
            >
              <ShoppingBag className="w-5 h-5 text-gray-300 group-hover:text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-slate-900">
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