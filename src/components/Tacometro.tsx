/*
  Los tacómetros de los cargadores: toda espera del catálogo se ve igual.

  - `Tacometro`: el grande de la pantalla de carga (PantallaCarga). Marca de
    verdad cuántos repuestos van llegando, con la escala en miles.
  - `TacometroMini`: para las esperas sin un avance que medir (una foto, la
    ficha de un repuesto, las piezas de una moto, un cambio de página). La
    aguja acelera y vuelve, como quien prueba el motor.

  Los dos tienen el arco de 270° abierto abajo, la zona roja al final y la aguja
  naranja. La aguja es un div que gira: se compone en la GPU sin volver a pintar.
  Los ángulos van de 135° a 405° (0° es la derecha y crecen en el sentido del
  reloj, como en SVG).
*/

const ANGULO_INICIO = 135;
const BARRIDO = 270;

const puntoEn = (centro: number, grados: number, r: number) => {
  const rad = (grados * Math.PI) / 180;
  return [centro + r * Math.cos(rad), centro + r * Math.sin(rad)] as const;
};

const arcoEn = (centro: number, desde: number, hasta: number, r: number) => {
  const [x0, y0] = puntoEn(centro, desde, r);
  const [x1, y1] = puntoEn(centro, hasta, r);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${hasta - desde > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

/* --- El grande: un cuadro de 260 × 260 --- */

const C = 130;
const R = 112;
const ARCO_COMPLETO = arcoEn(C, ANGULO_INICIO, ANGULO_INICIO + BARRIDO, R);
const LARGO_ARCO = (R * Math.PI * BARRIDO) / 180;

export const Tacometro = ({ marcas, fraccion, ralenti }: { marcas: number; fraccion: number; ralenti: boolean }) => {
  const pasos = marcas * 2; // una rayita a cada medio millar
  const anguloDe = (paso: number) => ANGULO_INICIO + (BARRIDO * paso) / pasos;

  return (
    <>
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 260 260" aria-hidden="true">
        {/* Resplandor detrás del arco. */}
        <circle cx={C} cy={C} r={R - 8} className="fill-brand-orange/[0.06]" />
        {/* Pista y zona roja (el último millar). */}
        <path d={ARCO_COMPLETO} fill="none" strokeWidth="8" strokeLinecap="round" className="stroke-white/10" />
        <path d={arcoEn(C, anguloDe(pasos - 2), anguloDe(pasos), R - 15)} fill="none" strokeWidth="4" className="stroke-red-500/70" />
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
          const [xa, ya] = puntoEn(C, anguloDe(paso), R - (mayor ? 22 : 18));
          const [xb, yb] = puntoEn(C, anguloDe(paso), R - 12);
          const [xt, yt] = puntoEn(C, anguloDe(paso), R - 36);
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

      {/* La aguja, con la base escondida bajo el logo. */}
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

/* --- El mini: un cuadro de 100 × 100, del tamaño que le dé `className` (cuadrado) --- */

const M = 50;
const RM = 41;
const ARCO_MINI = arcoEn(M, ANGULO_INICIO, ANGULO_INICIO + BARRIDO, RM);
const ZONA_ROJA_MINI = arcoEn(M, ANGULO_INICIO + (BARRIDO * 6) / 7, ANGULO_INICIO + BARRIDO, RM - 10);
const RAYITAS_MINI = Array.from({ length: 8 }, (_, i) => {
  const grados = ANGULO_INICIO + (BARRIDO * i) / 7;
  const [x1, y1] = puntoEn(M, grados, RM - 14);
  const [x2, y2] = puntoEn(M, grados, RM - 8);
  return { x1, y1, x2, y2 };
});

/**
 * Sobre qué fondo va:
 * - `blanco`: el marco de las fotos, que es blanco también en modo oscuro;
 * - `pagina`: el fondo de la página (cambia con el tema);
 * - `oscuro`: encima de una capa oscura (la de la ficha del producto).
 */
type Tono = 'blanco' | 'pagina' | 'oscuro';

const TONOS: Record<Tono, { pista: string; rayita: string; borde: string }> = {
  blanco: { pista: 'stroke-neutral-200', rayita: 'stroke-neutral-300', borde: 'ring-white' },
  pagina: { pista: 'stroke-ui-border', rayita: 'stroke-ui-copy/40', borde: 'ring-ui-canvas' },
  oscuro: { pista: 'stroke-white/15', rayita: 'stroke-white/40', borde: 'ring-brand-bg' },
};

interface MiniProps {
  tono?: Tono;
  /** El logo como eje (en los grandes); si no, un punto naranja. */
  conLogo?: boolean;
  /** El tamaño, siempre cuadrado: `h-9 w-9`, `h-24 w-24`… */
  className?: string;
}

export const TacometroMini = ({ tono = 'pagina', conLogo = false, className = '' }: MiniProps) => {
  const t = TONOS[tono];
  return (
    <span className={`relative inline-block shrink-0 ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        <path d={ARCO_MINI} fill="none" strokeWidth="7" strokeLinecap="round" className={t.pista} />
        <path d={ZONA_ROJA_MINI} fill="none" strokeWidth="4" className="stroke-red-500/70" />
        {conLogo && RAYITAS_MINI.map((r, i) => (
          <line key={i} {...r} strokeWidth="2.5" strokeLinecap="round" className={t.rayita} />
        ))}
      </svg>
      <span
        className={`carga-acelera absolute bottom-1/2 left-[calc(50%-1.25px)] h-[40%] w-[2.5px] origin-bottom rounded-full bg-brand-orange ${
          tono === 'oscuro' ? 'shadow-[0_0_10px_rgba(241,91,39,0.7)]' : ''
        }`}
      />
      {conLogo ? (
        <span className={`absolute left-1/2 top-1/2 flex h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[22%] bg-white p-[8%] shadow-card ring-2 ${t.borde}`}>
          <img src="/logo.svg" alt="" className="h-full w-full object-contain" />
        </span>
      ) : (
        <span className={`absolute left-1/2 top-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-orange ring-2 ${t.borde}`} />
      )}
    </span>
  );
};
