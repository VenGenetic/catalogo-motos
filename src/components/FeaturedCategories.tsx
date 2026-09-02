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
    <section className="border-t border-ui-border bg-ui-canvas py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="mb-8 text-center text-2xl font-extrabold text-ui-ink md:text-3xl">
          Busca por Categoría
        </h2>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {CATEGORIAS.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.nombre)}
              className="surface-card-interactive group flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[1.25rem] p-4 md:min-h-[170px] md:p-6"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-ui-border bg-ui-muted text-ui-copy shadow-sm transition-colors group-hover:border-brand-orange/25 group-hover:bg-brand-orange/10 group-hover:text-brand-orange">
                {getIcon(cat.nombre)}
              </div>
              <h3 className="text-center text-sm font-bold leading-snug text-ui-ink transition-colors group-hover:text-brand-orange">
                {cat.nombre}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
