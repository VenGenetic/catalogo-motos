import { ShoppingBag } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  openCart: () => void;
}

export const Navbar = ({ activeTab, setActiveTab, cartCount, openCart }: Props) => {
  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-red-600 p-2 rounded-lg">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-bold text-lg md:text-xl tracking-wider">MOTO<span className="text-red-500">PARTS</span></span>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <button onClick={() => setActiveTab('home')} className={`font-medium transition-colors ${activeTab === 'home' ? 'text-red-500' : 'hover:text-red-400'}`}>Inicio</button>
            <button onClick={() => setActiveTab('catalog')} className={`font-medium transition-colors ${activeTab === 'catalog' ? 'text-red-500' : 'hover:text-red-400'}`}>Catálogo</button>
            <button onClick={() => setActiveTab('contact')} className={`font-medium transition-colors ${activeTab === 'contact' ? 'text-red-500' : 'hover:text-red-400'}`}>Contacto</button>
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