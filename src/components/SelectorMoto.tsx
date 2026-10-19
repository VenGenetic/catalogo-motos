import { useEffect, useMemo, useRef, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { Bike, Check, MessageCircle, Search, X } from 'lucide-react';
import { GRUPOS_MOTO, MODELOS_CATALOGO, MOTOS_POPULARES, APP_CONFIG } from '../config/constants';
import { getMotoImageById } from '../config/motoImages';
import { useMoto } from '../context/MotoContext';
import { buildWhatsAppUrl } from '../utils/attribution';

/*
  "¿Qué moto tienes?": el único selector de motos de la página.

  Con foto de cada moto: mucha gente no sabe el nombre exacto de su modelo,
  pero la reconoce al verla. En el celular es una hoja que sube desde abajo
  (el pulgar alcanza todo); en la computadora, una ventana centrada.

  El buscador no exige escribir bien: "wolf250", "gp1 r" o "crucero" sirven.
*/

const plano = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

type Pestana = 'Todas' | 'Populares' | (typeof GRUPOS_MOTO)[number];

export const SelectorMoto = () => {
  const { selectorAbierto } = useMoto();
  // Se monta al abrir: cada vez empieza sin búsqueda y en "Todas".
  return selectorAbierto ? <Dialogo /> : null;
};

const Dialogo = () => {
  const { cerrarSelector, elegirMoto, miMoto } = useMoto();
  const location = useLocation();
  const [busqueda, setBusqueda] = useState('');
  const [pestana, setPestana] = useState<Pestana>('Todas');
  const inputRef = useRef<HTMLInputElement>(null);

  const actual = matchPath({ path: '/catalogo/:modelo', end: true }, location.pathname)?.params.modelo ?? miMoto;

  // Al abrir: bloquea el scroll de atrás y en la computadora pone el cursor en el buscador.
  // En el celular no: el teclado taparía las fotos, que es lo que la mayoría usa.
  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (window.matchMedia('(min-width: 768px)').matches) setTimeout(() => inputRef.current?.focus(), 50);
    const conEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrarSelector(); };
    window.addEventListener('keydown', conEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener('keydown', conEscape);
    };
  }, [cerrarSelector]);

  const grupos = useMemo(() => {
    const termino = plano(busqueda);
    if (termino) {
      const encontradas = MODELOS_CATALOGO.filter(m => plano(m.nombre).includes(termino));
      return encontradas.length ? [{ titulo: `${encontradas.length} ${encontradas.length === 1 ? 'moto' : 'motos'}`, motos: encontradas }] : [];
    }
    if (pestana === 'Populares') {
      return [{ titulo: 'Populares', motos: MOTOS_POPULARES.map(id => MODELOS_CATALOGO.find(m => m.id === id)!).filter(Boolean) }];
    }
    return GRUPOS_MOTO
      .filter(grupo => pestana === 'Todas' || grupo === pestana)
      .map(grupo => ({ titulo: grupo, motos: MODELOS_CATALOGO.filter(m => m.grupo === grupo) }));
  }, [busqueda, pestana]);

  const pestanas: Pestana[] = ['Todas', 'Populares', ...GRUPOS_MOTO];

  return (
    <div className="viewport-fill fixed inset-0 z-modal flex items-end justify-center md:items-center md:p-6">
      <div className="viewport-fill absolute inset-0 bg-brand-bg/72 backdrop-blur-sm animate-fade-in" onClick={cerrarSelector} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="selector-moto-titulo"
        className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-ui-surface shadow-2xl animate-slide-up md:max-h-[86vh] md:max-w-4xl md:rounded-2xl md:animate-scale-up"
      >
        <div className="shrink-0 border-b border-ui-border px-4 pb-3 pt-2 md:px-6 md:pt-5">
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-ui-border md:hidden" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="selector-moto-titulo" className="text-xl font-black text-ui-ink md:text-2xl">¿Qué moto tienes?</h2>
              <p className="mt-0.5 text-sm text-ui-copy">Te mostramos solo los repuestos que le sirven.</p>
            </div>
            <button
              type="button"
              onClick={cerrarSelector}
              className="touch-target -mr-2 flex shrink-0 items-center justify-center rounded-full text-ui-copy hover:bg-ui-muted hover:text-ui-ink"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
          </div>

          <label className="relative mt-3 block">
            <span className="sr-only">Buscar moto</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ui-copy" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Escribe tu moto: Wolf, GP1, Crucero…"
              className="h-12 w-full rounded-xl border border-ui-border bg-ui-muted pl-11 pr-11 text-base text-ui-ink outline-none placeholder:text-ui-copy/80 focus:border-brand-orange focus:bg-ui-surface"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => { setBusqueda(''); inputRef.current?.focus(); }}
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ui-copy hover:text-ui-ink"
                aria-label="Borrar búsqueda"
              >
                <X size={18} />
              </button>
            )}
          </label>

          {!busqueda && (
            <div className="scrollbar-hide -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Tipo de moto">
              {pestanas.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPestana(p)}
                  aria-pressed={pestana === p}
                  className={`min-h-[40px] shrink-0 rounded-full border px-4 text-sm font-bold transition-colors ${
                    pestana === p ? 'border-brand-bg bg-brand-bg text-white dark:border-white dark:bg-white dark:text-brand-bg' : 'border-ui-border bg-ui-surface text-ui-ink hover:border-ui-ink'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-safe pt-3 md:px-6 md:pb-6">
          {grupos.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <Bike size={40} className="mb-3 text-ui-copy/60" aria-hidden="true" />
              <p className="font-bold text-ui-ink">No encontramos esa moto</p>
              <p className="mt-1 max-w-xs text-sm text-ui-copy">Revisa cómo se escribe o pregúntanos: te ayudamos a encontrar tu repuesto.</p>
              <a
                href={buildWhatsAppUrl(APP_CONFIG.WHATSAPP_NUMBER, `Hola LV PARTS, busco repuestos para mi moto: ${busqueda}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#25D366] px-5 font-bold text-brand-bg"
              >
                <MessageCircle size={20} aria-hidden="true" /> Preguntar por WhatsApp
              </a>
            </div>
          ) : grupos.map(grupo => (
            <section key={grupo.titulo} className="mb-5 last:mb-2" aria-label={grupo.titulo}>
              <h3 className="mb-2 px-1 font-geist text-xs font-black uppercase tracking-[.14em] text-ui-copy">{grupo.titulo}</h3>
              <ul className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3 md:grid-cols-4">
                {grupo.motos.map(moto => {
                  const imagen = getMotoImageById(moto.id);
                  const elegida = moto.id === actual;
                  return (
                    <li key={moto.id}>
                      <button
                        type="button"
                        onClick={() => elegirMoto(moto.id)}
                        aria-current={elegida ? 'true' : undefined}
                        className={`group relative flex h-full w-full flex-col overflow-hidden rounded-xl border bg-ui-surface text-left transition-colors active:scale-[0.98] ${
                          elegida ? 'border-brand-orange ring-2 ring-brand-orange/30' : 'border-ui-border hover:border-ui-ink'
                        }`}
                      >
                        <span className="model-media-shell flex aspect-[4/3] w-full items-center justify-center overflow-hidden p-2">
                          {imagen
                            ? <img src={imagen} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]" />
                            : <Bike size={44} strokeWidth={1.5} className="text-ui-copy/50" aria-hidden="true" />}
                        </span>
                        <span className="flex min-h-[52px] flex-1 items-center gap-1.5 border-t border-ui-border px-2.5 py-2 text-sm font-bold leading-tight text-ui-ink">
                          <span className="min-w-0 flex-1">{moto.nombre}</span>
                          {elegida && <Check size={18} strokeWidth={3} className="shrink-0 text-brand-orange" aria-label="Tu moto" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
