import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bike } from 'lucide-react';
import { GRUPOS_MOTO, MODELOS_CATALOGO, MOTOS_POPULARES } from '../config/constants';
import { getMotoImageById } from '../config/motoImages';
import { useMoto } from '../context/MotoContext';

/*
  "Elige tu moto" en el inicio: las populares a la vista y las demás por tipo.
  Son enlaces de verdad (/catalogo/wolf-250) para que Google llegue al
  despiece de cada moto; al tocarlos, además, la moto queda recordada.
*/

type Pestana = 'Populares' | (typeof GRUPOS_MOTO)[number];

export const ModelExplorer = () => {
  const { recordarMoto, abrirSelector } = useMoto();
  const [pestana, setPestana] = useState<Pestana>('Populares');

  const motos = pestana === 'Populares'
    ? MOTOS_POPULARES.map(id => MODELOS_CATALOGO.find(m => m.id === id)!).filter(Boolean)
    : MODELOS_CATALOGO.filter(m => m.grupo === pestana);

  return (
    <section className="bg-ui-canvas py-8 md:py-12" aria-labelledby="model-explorer-title">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5 lg:px-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="section-kicker">Despiece por moto</span>
            <h2 id="model-explorer-title" className="mt-2 text-2xl font-black text-ui-ink md:text-3xl">Elige tu moto</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-ui-copy">Te mostramos solo los repuestos que le sirven, ordenados por sistema.</p>
          </div>
          <button type="button" onClick={abrirSelector} className="hidden min-h-11 items-center gap-2 text-sm font-black text-brand-orange-action hover:underline dark:text-brand-orange sm:inline-flex">
            Todas las motos <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="scrollbar-hide -mx-3 mb-4 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Tipo de moto">
          {(['Populares', ...GRUPOS_MOTO] as Pestana[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPestana(p)}
              aria-pressed={pestana === p}
              className={`press min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-bold ${
                pestana === p ? 'border-brand-bg bg-brand-bg text-white dark:border-white dark:bg-white dark:text-brand-bg' : 'border-ui-border bg-ui-surface text-ui-ink hover:border-ui-ink'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* La `key` es la pestaña: al cambiar de tipo, las motos entran una tras otra. */}
        <ul key={pestana} className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {motos.map((moto, i) => {
            const imagen = getMotoImageById(moto.id);
            return (
              <li key={moto.id} className="stagger animate-rise" style={{ '--i': i } as React.CSSProperties}>
                <Link
                  to={`/catalogo/${moto.id}`}
                  onClick={() => recordarMoto(moto.id)}
                  className="group lift flex h-full flex-col overflow-hidden rounded-xl border border-ui-border bg-ui-surface shadow-card hover:border-ui-ink"
                >
                  <span className="model-media-shell flex aspect-[4/3] items-center justify-center overflow-hidden p-2 sm:p-3">
                    {imagen
                      ? <img src={imagen} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.05]" />
                      : <Bike size={44} strokeWidth={1.5} className="text-ui-copy/50" aria-hidden="true" />}
                  </span>
                  <span className="flex flex-1 items-center justify-between gap-2 border-t border-ui-border px-3 py-2.5">
                    <span className="text-sm font-bold leading-tight text-ui-ink">{moto.nombre}</span>
                    <ArrowRight size={16} className="shrink-0 text-ui-copy transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-brand-orange-action dark:group-hover:text-brand-orange" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <button type="button" onClick={abrirSelector} className="press mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-ui-ink bg-ui-surface text-sm font-black text-ui-ink sm:hidden">
          <Bike size={18} aria-hidden="true" /> Ver todas las motos
        </button>
      </div>
    </section>
  );
};
