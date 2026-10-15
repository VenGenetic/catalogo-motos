import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const modelos = [
  { id: 'workforce-150', nombre: 'Workforce 150', grupo: 'Trabajo', imagen: 'workforce-150-cc.webp' },
  { id: 'wolf-250', nombre: 'Wolf 250', grupo: 'Deportiva', imagen: 'wolf-250-cc.webp' },
  { id: 'gp1-r-250', nombre: 'GP1 R 250', grupo: 'Deportiva', imagen: 'gp1-r-250cc.webp' },
  { id: 's1-adventure-180', nombre: 'S1 Adventure 180', grupo: 'Scooter', imagen: 's1-adventure-180-cc.webp' },
  { id: 'tekken-evo-250', nombre: 'Tekken Evo 250', grupo: 'Doble propósito', imagen: 'tekken-evo-250-cc.webp' },
  { id: 'shark-3-200', nombre: 'Shark 3 200', grupo: 'Doble propósito', imagen: 'shark-3-200cc.webp' },
];

export const ModelExplorer = () => (
  <section className="bg-ui-canvas py-8 md:py-12" aria-labelledby="model-explorer-title">
    <div className="mx-auto max-w-[1440px] px-3 sm:px-5 lg:px-8">
      <div className="catalog-rule mb-5 flex flex-wrap items-end justify-between gap-4 pt-4 md:mb-6">
        <div>
          <span className="section-kicker">Garage Daytona</span>
          <h2 id="model-explorer-title" className="mt-3 text-2xl font-black uppercase tracking-tight text-ui-ink md:text-3xl">Compra por modelo</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-ui-copy">Selecciona tu moto para mostrar únicamente los repuestos compatibles.</p>
        </div>
        <Link to="/catalogo" className="inline-flex min-h-11 items-center gap-2 text-sm font-black uppercase tracking-wide text-brand-orange hover:underline">Ver todos <ArrowRight size={17} /></Link>
      </div>
      <div className="grid grid-cols-2 gap-px border border-ui-border bg-ui-border sm:grid-cols-3 lg:grid-cols-6">
        {modelos.map(modelo => (
          <Link key={modelo.id} to={`/catalogo/${modelo.id}`} className="group flex min-w-0 flex-col bg-ui-surface focus-visible:outline-2 focus-visible:outline-brand-orange">
            <div className="model-media-shell flex aspect-[4/3] items-center justify-center p-3 sm:p-4">
              <img src={`/modelos/${modelo.imagen}`} alt="" loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.06]" />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-2 border-t border-ui-border p-3 sm:p-4">
              <div><span className="text-[9px] font-black uppercase tracking-[.13em] text-brand-orange">{modelo.grupo}</span><h3 className="mt-1 text-sm font-black uppercase leading-tight text-ui-ink">{modelo.nombre}</h3></div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-ui-copy group-hover:text-brand-orange">Buscar piezas <ArrowRight size={14} /></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
