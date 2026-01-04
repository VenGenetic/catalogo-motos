import { Home, Search, MessageSquare, Heart } from 'lucide-react';

interface BottomNavProps {
  onNavigate: (view: 'home' | 'catalogo' | 'contacto' | 'favoritos') => void;
  currentView: string;
}

export const BottomNav = ({ onNavigate, currentView }: BottomNavProps) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'catalogo', icon: Search, label: 'Catálogo' },
    { id: 'favoritos', icon: Heart, label: 'Favoritos' },
    { id: 'contacto', icon: MessageSquare, label: 'Contacto' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onNavigate(id as any)}
          className={`flex flex-col items-center gap-1 ${
            currentView === id ? 'text-red-600' : 'text-slate-400'
          }`}
        >
          <Icon size={20} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
};