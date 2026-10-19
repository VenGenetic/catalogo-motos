import { Link } from 'react-router-dom';
import { ORDEN_SECCIONES } from '../config/constants';
import { IconoSistema } from './IconoSistema';

/** "Compra por sistema": los mismos sistemas del despiece, con cuántos repuestos hay de cada uno. */
export const FeaturedCategories = ({ conteo }: { conteo: Map<string, number> }) => {
  const sistemas = ORDEN_SECCIONES.filter(s => s !== 'Todos' && s !== 'Otros' && (conteo.size === 0 || (conteo.get(s) ?? 0) > 0));

  return (
    <section className="bg-ui-canvas pb-10 pt-2 md:pb-14">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5 lg:px-8">
        <div className="mb-4">
          <span className="section-kicker">Por sistema</span>
          <h2 className="mt-2 text-2xl font-black text-ui-ink md:text-3xl">¿Qué parte buscas?</h2>
        </div>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
          {sistemas.map(sistema => (
            <li key={sistema}>
              <Link
                to={`/catalogo?seccion=${encodeURIComponent(sistema)}`}
                className="group flex h-full min-h-[72px] items-center gap-3 rounded-xl border border-ui-border bg-ui-surface p-3 shadow-card transition-colors hover:border-brand-orange"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange-action transition-colors group-hover:bg-brand-orange group-hover:text-white dark:text-brand-orange">
                  <IconoSistema sistema={sistema} size={22} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black leading-tight text-ui-ink">{sistema}</span>
                  {conteo.size > 0 && <span className="block text-xs text-ui-copy">{(conteo.get(sistema) ?? 0).toLocaleString('es-EC')} repuestos</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
