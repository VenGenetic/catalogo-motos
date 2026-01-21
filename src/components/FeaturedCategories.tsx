import { useNavigate } from 'react-router-dom';
import { Zap, Disc, CircleDot, Box, Wrench, Shield, Activity } from 'lucide-react'; // Se eliminó 'Layers'
import { CATEGORIAS } from '../utils/categories';

export const FeaturedCategories = () => {
  const navigate = useNavigate();

  // CORREGIDO: Eliminamos el parámetro 'cat' que no se estaba usando
  const handleClick = () => {
    navigate(`/catalogo`); 
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
    <div className="py-12 bg-[#f4f6f8]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">
          Busca por Categoría
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIAS.slice(0, 8).map((cat) => (
            <div 
              key={cat.id}
              onClick={handleClick} // CORREGIDO: Llamada simple sin argumentos
              className="group cursor-pointer bg-gray-50 hover:bg-white border border-gray-100 hover:border-red-200 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-white group-hover:bg-red-50 border border-gray-100 flex items-center justify-center text-slate-700 group-hover:text-red-600 transition-colors mb-4 shadow-sm">
                {getIcon(cat.nombre)}
              </div>
              <h3 className="font-bold text-slate-800 text-sm text-center group-hover:text-red-600 transition-colors">
                {cat.nombre}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};