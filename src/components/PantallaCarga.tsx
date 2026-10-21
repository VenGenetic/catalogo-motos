import { AlertTriangle, MessageCircle, RotateCw } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { Progreso } from '../types';
import { buildWhatsAppUrl } from '../utils/attribution';
import { Tacometro, TacometroMini } from './Tacometro';

/*
  Pantalla de espera de toda la app: la cortina del local con un tacómetro.

  La primera visita baja el catálogo entero (unas 7.000 piezas en páginas de
  1.000), así que la aguja marca cuánto va, de verdad: la escala está en miles
  de repuestos, como las rpm, y avanza con cada página que llega. Mientras se
  conecta, la aguja tiembla en ralentí. Al terminar, la cortina sube y deja ver
  la tienda.

  Sólo se mueve la aguja (y su arco): es lo único que dice algo. El fondo es
  quieto y todo lo que se anima usa transform/opacity, que el navegador compone
  sin volver a pintar mientras el hilo principal procesa el catálogo.

  El logo queda en el centro exacto de la pantalla, igual que el de la pantalla
  estática de index.html: al tomar el control React, el logo no se mueve y el
  tacómetro se dibuja a su alrededor.

  La versión compacta es para los cambios de página (el tacómetro mini, ver
  Tacometro.tsx): aparece sólo si la espera pasa de 250 ms (si no, sería un
  parpadeo).
*/

interface Props {
  progreso?: Progreso;
  /** Qué decir si la carga falló y no hay catálogo guardado que mostrar. */
  error?: string | null;
  onReintentar?: () => void;
  /** La cortina sube y deja ver el catálogo ya dibujado (dura SALIDA_CARGA_MS de App). */
  saliendo?: boolean;
  /** Para los cambios de página: el tacómetro mini, sin cortina ni contador. */
  compacta?: boolean;
}

const MIL = 1000;
const numero = (n: number) => n.toLocaleString('es-EC');

export const PantallaCarga = ({ progreso, error, onReintentar, saliendo = false, compacta = false }: Props) => {
  if (compacta) {
    return (
      <div className="aparece-tarde flex min-h-[60vh] w-full items-center justify-center bg-ui-canvas" role="status" aria-label="Cargando la página">
        <TacometroMini tono="pagina" conLogo className="h-24 w-24" />
      </div>
    );
  }

  const total = progreso?.total ?? null;
  const cargadas = Math.min(progreso?.cargadas ?? 0, total ?? Infinity);
  // La escala llega justo por encima del total: 6.867 repuestos → de 0 a 7.
  const marcas = total ? Math.max(1, Math.ceil(total / MIL)) : 7;
  const fraccion = error || !total ? 0 : Math.min(1, cargadas / (marcas * MIL));
  const porcentaje = total ? Math.round((cargadas / total) * 100) : 0;
  const estado = total === null ? 'Conectando con la bodega…' : cargadas < total ? 'Trayendo los repuestos…' : 'Ordenando por sistema…';

  return (
    <div
      className={`viewport-fill fixed inset-0 z-modal overflow-hidden bg-brand-bg text-white ${saliendo ? 'carga-salida' : ''}`}
      role={error ? 'alert' : undefined}
    >
      <div className="carga-cortina viewport-fill absolute inset-0" aria-hidden="true" />
      {/* El riel de abajo de la cortina: al subir, la línea naranja barre la pantalla. */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-brand-orange" aria-hidden="true" />

      <div className="viewport-fill absolute inset-0 flex items-center justify-center">
        <div
          // También según la altura: en un celular acostado o bajo, la marca y los botones caben.
          className={`relative h-[min(70vw,280px,46vh)] w-[min(70vw,280px,46vh)] ${saliendo ? '' : 'animate-rise'}`}
          role={error ? undefined : 'progressbar'}
          aria-label="Cargando el catálogo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={total ? porcentaje : undefined}
          aria-valuetext={total ? `${numero(cargadas)} de ${numero(total)} repuestos` : estado}
        >
          {/* Arriba: la marca. */}
          <div className="absolute bottom-full left-1/2 mb-6 w-max -translate-x-1/2 text-center">
            <p className="font-anton text-4xl uppercase leading-none tracking-wide">
              LV <span className="text-brand-orange">PARTS</span>
            </p>
            <p className="mt-2 font-geist text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/55">Repuestos originales Daytona</p>
          </div>

          <Tacometro marcas={marcas} fraccion={fraccion} ralenti={!error && total === null} />

          {/* El eje de la aguja es el logo, en el centro exacto de la pantalla. */}
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white p-2.5 shadow-lifted ring-4 ring-brand-bg">
            <img src="/logo.svg" alt="" className="h-full w-full object-contain" />
            {error && (
              <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-brand-bg shadow-lg">
                <AlertTriangle size={16} strokeWidth={2.5} aria-hidden="true" />
              </span>
            )}
          </span>

          {/* La lectura digital, en el hueco de abajo del tacómetro. */}
          <div className="absolute left-0 right-0 top-[calc(50%+50px)] text-center" aria-hidden="true">
            <p className="font-anton text-3xl leading-none tabular-nums">
              {error ? '—' : total ? <>{porcentaje}<span className="text-lg text-white/60">%</span></> : <span className="text-white/35">0<span className="text-lg">%</span></span>}
            </p>
            <p className="mt-1 font-geist text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">× 1.000 repuestos</p>
          </div>

          {/* Abajo: qué está pasando, o qué hacer si falló. */}
          <div className="absolute left-1/2 top-full mt-6 w-[min(84vw,320px)] -translate-x-1/2 text-center">
            {error ? (
              <>
                <p className="text-base font-bold">No pudimos cargar el catálogo</p>
                <p className="mt-1 text-sm text-white/70">{error}</p>
                {/* Lado a lado: uno debajo del otro no cabían en un iPhone SE. */}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={onReintentar}
                    className="press flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-orange px-3 font-geist text-xs font-black uppercase tracking-wider text-white hover:bg-brand-orange-action"
                  >
                    <RotateCw size={17} aria-hidden="true" /> Reintentar
                  </button>
                  <a
                    href={buildWhatsAppUrl(APP_CONFIG.WHATSAPP_NUMBER, 'Hola LV PARTS, el catálogo de la web no me carga. ¿Me ayudan con un repuesto?')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/30 px-3 font-geist text-xs font-black uppercase tracking-wider text-white hover:border-white hover:bg-white/5"
                  >
                    <MessageCircle size={17} aria-hidden="true" /> WhatsApp
                  </a>
                </div>
              </>
            ) : (
              <div aria-live="polite">
                <p className="text-sm font-semibold text-white/85">{estado}</p>
                <p className="mt-1 font-mono text-xs tabular-nums text-white/55">
                  {total === null ? 'Buscando el inventario' : `${numero(cargadas)} de ${numero(total)} repuestos`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
