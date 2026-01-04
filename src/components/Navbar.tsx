import { APP_CONFIG } from '../config/constants';

interface NavbarProps {
  onNavigate: (view: 'home' | 'catalogo' | 'contacto' | 'favoritos') => void;
}

export const Navbar = ({ onNavigate }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate('home')}
        >
          <img src="/icono-daytona.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl tracking-tight text-slate-900">
            {APP_CONFIG.SITE_NAME}
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => onNavigate('home')} className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Inicio</button>
          <button onClick={() => onNavigate('catalogo')} className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Catálogo</button>
          <button onClick={() => onNavigate('contacto')} className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Contacto</button>
        </div>
      </div>
    </nav>
  );
};