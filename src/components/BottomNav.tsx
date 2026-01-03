import { Home, Grid, ShoppingBag, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav = ({ activeTab, setActiveTab }: Props) => {
  const { cartCount, openCart } = useCart();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-6 flex justify-between items-center z-40 pb-safe">
      <button 
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 min-w-[60px] p-1 ${activeTab === 'home' ? 'text-red-600' : 'text-gray-400'}`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-bold">Inicio</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('catalog')}
        className={`flex flex-col items-center gap-1 min-w-[60px] p-1 ${activeTab === 'catalog' ? 'text-red-600' : 'text-gray-400'}`}
      >
        <Grid className="w-6 h-6" />
        <span className="text-[10px] font-bold">Catálogo</span>
      </button>

      <button 
        onClick={openCart}
        className="flex flex-col items-center gap-1 relative text-gray-400 min-w-[60px] p-1"
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

      <button 
        onClick={() => setActiveTab('contact')}
        className={`flex flex-col items-center gap-1 min-w-[60px] p-1 ${activeTab === 'contact' ? 'text-red-600' : 'text-gray-400'}`}
      >
        <Phone className="w-6 h-6" />
        <span className="text-[10px] font-bold">Contacto</span>
      </button>
    </div>
  );
};