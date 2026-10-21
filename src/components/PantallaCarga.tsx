import { AlertTriangle, MessageCircle, RotateCw } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { Progreso } from '../types';
import { buildWhatsAppUrl } from '../utils/attribution';

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

  La versión compacta es para los cambios de página: aparece sólo si la espera
  pasa de 250 ms (si no, sería un parpadeo).
*/

interface Props {
  progreso?: Progreso;
  /** Qué decir si la carga falló y no hay catálogo guardado que mostrar. */
  error?: string | null;
  onReintentar?: () => void;
  /** La cortina sube y deja ver el catálogo ya dibujado (dura SALIDA_CARGA_MS de App). */
  saliendo?: boolean;
  /** Para los cambios de página: más chica, sin tacómetro. */
  compacta?: boolean;
}

const MIL = 1000;
const numero = (n: number) => n.toLocaleString('es-EC');

export const PantallaCarga = ({ progreso, error, onReintentar, saliendo = false, compacta = false }: Props) => {
  if (compacta) {
    return (
      <div className="aparece-tarde flex min-h-[60vh] w-full items-center justify-center bg-ui-canvas" role="status" aria-label="Cargando la página">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full animate-spin [animation-duration:1.1s]" viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r="37" fill="none" strokeWidth="3" className="stroke-ui-border" />
            <circle cx="40" cy="40" r="37" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 200" className="stroke-brand-orange" />
          </svg>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-card">
            <img src="/logo.svg" alt="" className="h-full w-full object-contain" />
          </span>
        </div>
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

/* --- El tacómetro ---
   Dibujado en un cuadro de 260 × 260: arco de 270° abierto abajo, de 135° a 405°
   (0° es la derecha y los ángulos crecen en el sentido del reloj, como en SVG). */

const C = 130;
const R = 112;
const ANGULO_INICIO = 135;
const BARRIDO = 270;

const punto = (grados: number, r: number) => {
  const rad = (grados * Math.PI) / 180;
  return [C + r * Math.cos(rad), C + r * Math.sin(rad)] as const;
};

const arco = (desde: number, hasta: number, r: number) => {
  const [x0, y0] = punto(desde, r);
  const [x1, y1] = punto(hasta, r);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${hasta - desde > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

const ARCO_COMPLETO = arco(ANGULO_INICIO, ANGULO_INICIO + BARRIDO, R);
const LARGO_ARCO = (R * Math.PI * BARRIDO) / 180;

const Tacometro = ({ marcas, fraccion, ralenti }: { marcas: number; fraccion: number; ralenti: boolean }) => {
  const pasos = marcas * 2; // una rayita a cada medio millar
  const anguloDe = (paso: number) => ANGULO_INICIO + (BARRIDO * paso) / pasos;

  return (
    <>
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 260 260" aria-hidden="true">
        {/* Resplandor detrás del arco. */}
        <circle cx={C} cy={C} r={R - 8} className="fill-brand-orange/[0.06]" />
        {/* Pista y zona roja (el último millar). */}
        <path d={ARCO_COMPLETO} fill="none" strokeWidth="8" strokeLinecap="round" className="stroke-white/10" />
        <path d={arco(anguloDe(pasos - 2), anguloDe(pasos), R - 15)} fill="none" strokeWidth="4" className="stroke-red-500/70" />
        {/* Lo que va cargado. */}
        <path
          d={ARCO_COMPLETO}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-brand-orange transition-[stroke-dashoffset] duration-[400ms] ease-out"
          strokeDasharray={`${LARGO_ARCO} ${LARGO_ARCO}`}
          strokeDashoffset={LARGO_ARCO * (1 - fraccion)}
          opacity={fraccion > 0 ? 1 : 0}
        />
        {/* Rayitas y números de la escala. */}
        {Array.from({ length: pasos + 1 }, (_, paso) => {
          const mayor = paso % 2 === 0;
          const [xa, ya] = punto(anguloDe(paso), R - (mayor ? 22 : 18));
          const [xb, yb] = punto(anguloDe(paso), R - 12);
          const [xt, yt] = punto(anguloDe(paso), R - 36);
          return (
            <g key={paso}>
              <line x1={xa} y1={ya} x2={xb} y2={yb} strokeWidth={mayor ? 2.5 : 1.5} strokeLinecap="round" className={mayor ? 'stroke-white/50' : 'stroke-white/20'} />
              {mayor && (
                <text x={xt} y={yt} textAnchor="middle" dominantBaseline="central" className="fill-white/60 font-geist text-[13px] font-bold">
                  {paso / 2}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* La aguja: un div que gira (se compone en la GPU), con la base escondida bajo el logo. */}
      <div
        className={`absolute bottom-1/2 left-[calc(50%-1.5px)] h-[38%] w-[3px] origin-bottom rounded-full bg-brand-orange shadow-[0_0_14px_rgba(241,91,39,0.75)] ${
          ralenti ? 'carga-ralenti' : 'transition-transform duration-[400ms] ease-out'
        }`}
        style={{ transform: `rotate(${-BARRIDO / 2 + BARRIDO * fraccion}deg)` }}
        aria-hidden="true"
      />
    </>
  );
};
