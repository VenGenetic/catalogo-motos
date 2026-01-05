import { useNavigate } from 'react-router-dom';
import { Zap, Disc, CircleDot, Layers, Box, Wrench, Shield, Activity } from 'lucide-react';
import { CATEGORIAS } from '../utils/categories';

export const FeaturedCategories = () => {
  const navigate = useNavigate();

  const handleClick = (cat: string) => {
    // Navegamos al catálogo con la sección seleccionada
    // Nota: Pasamos el estado via state de react-router o URL params si prefieres
    // Por simplicidad, aquí asumimos que el usuario irá al catálogo y filtrará manual, 
    // pero idealmente App.tsx debería leer un param ?seccion=X.
    // Para esta versión, vamos a redirigir y dejar que el usuario explore.
    navigate(`/catalogo`); 
  };

  // Mapeo de iconos para cada categoría
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
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">
          Busca por Categoría
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIAS.slice(0, 8).map((cat) => (
            <div 
              key={cat.id}
              onClick={() => handleClick(cat.nombre)}
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