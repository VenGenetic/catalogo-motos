import { useNavigate } from 'react-router-dom';
import { Zap, Disc, CircleDot, Box, Wrench, Shield, Activity } from 'lucide-react'; // Se eliminó 'Layers'
import { CATEGORIAS } from '../utils/categories';

export const FeaturedCategories = () => {
  const navigate = useNavigate();

  const handleClick = (seccion: string) => {
    navigate(`/catalogo?seccion=${encodeURIComponent(seccion)}`);
  };

  const getIcon = (nombre: string) => {
    if (nombre.includes('Motor')) return <Activity />;
    if (nombre.includes('Eléctrico')) return <Zap />;
    if (nombre.includes('Frenos')) return <Disc />;
    if (nombre.includes('Ruedas')) return <CircleDot />;
    if (nombre.includes('Chasis')) return <Box />;
    if (nombre.includes('Carrocería')) return <Shield />;
    return <Wrench />;
  };

  return (
    <div className="py-12 bg-gray-50 dark:bg-brand-surface-1/50 border-t border-gray-150 dark:border-brand-surface-2">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 text-center">
          Busca por Categoría
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIAS.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.nombre)}
              className="group cursor-pointer bg-white dark:bg-brand-bg hover:bg-white dark:hover:bg-brand-surface-1 border border-gray-100 dark:border-brand-surface-2 hover:border-brand-orange/30 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-brand-surface-2 group-hover:bg-brand-orange/10 border border-gray-100 dark:border-brand-surface-3 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-brand-orange transition-colors mb-4 shadow-sm">
                {getIcon(cat.nombre)}
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm text-center group-hover:text-brand-orange transition-colors">
                {cat.nombre}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};