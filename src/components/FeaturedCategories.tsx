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
    <section className="bg-ui-canvas pb-12 pt-4 md:pb-16">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5 lg:px-8">
        <div className="catalog-rule mb-6 pt-4">
          <span className="section-kicker">Taller rápido</span>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-ui-ink md:text-3xl">Compra por sistema</h2>
        </div>

        <div className="grid grid-cols-2 gap-px border border-ui-border bg-ui-border sm:grid-cols-4 lg:grid-cols-8">
          {CATEGORIAS.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.nombre)}
              className="group flex min-h-[140px] cursor-pointer flex-col items-center justify-center bg-ui-surface p-4 transition-colors hover:bg-ui-muted md:min-h-[160px]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-ui-ink text-ui-ink transition-colors group-hover:border-brand-orange group-hover:bg-brand-orange group-hover:text-white">
                {getIcon(cat.nombre)}
              </div>
              <h3 className="text-center text-xs font-black uppercase leading-snug tracking-wide text-ui-ink transition-colors group-hover:text-brand-orange">
                {cat.nombre}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
