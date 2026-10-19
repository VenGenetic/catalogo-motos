import { useMemo } from 'react';
import { Bike, CheckCircle2, ChevronRight, CircleHelp, TriangleAlert } from 'lucide-react';
import type { CompatibilidadDespiece } from '../utils/despiece';
import type { Despiece } from '../utils/cargarDespiece';
import { AVISOS_CLIENTE, nombreDeModelo } from '../config/constants';
import { getMotoImageById } from '../config/motoImages';
import { Producto } from '../types';

/*
  A qué motos sirve un repuesto, con la misma regla que el despiece del ERP
  (`modelosCompatiblesDe`): el catálogo, la ficha y el despiece de cada moto
  no pueden decir cosas distintas. Si el nombre no deja clara la moto, no se
  adivina: se dice y se ofrece confirmarlo por WhatsApp.
*/

export function useCompatibles(producto: Producto, despiece: Despiece | null): CompatibilidadDespiece[] | null {
  const { id, codigo_referencia, nombre } = producto;
  return useMemo(
    () => despiece ? despiece.modelosCompatiblesDe({ id, sku: codigo_referencia ?? null, name: nombre }) : null,
    [despiece, id, codigo_referencia, nombre],
  );
}

/** "Wolf 250 CC (anterior)" → "Wolf 250": para una línea angosta. */
export const nombreCorto = (nombre: string) => nombre.replace(/\s*\([^)]*\)/g, '').replace(/\s*CC\b/gi, '').trim();

/** Una línea para la tarjeta. Siempre ocupa su alto, así las tarjetas de una fila no saltan. */
export function SirveParaLinea({ compatibles, modeloActual, despiece }: {
  compatibles: CompatibilidadDespiece[] | null;
  /** La moto que se está viendo: en su despiece, la pieza le sirve. */
  modeloActual?: string;
  despiece: Despiece | null;
}) {
  if (!compatibles) return <span className="block h-[18px]" aria-hidden="true" />;

  if (modeloActual && compatibles.some(c => c.modelo.id === modeloActual)) {
    return (
      <span className="flex h-[18px] items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400">
        <CheckCircle2 size={14} className="shrink-0" aria-hidden="true" />
        <span className="truncate">Le sirve a tu {nombreCorto(nombreDeModelo(modeloActual, despiece))}</span>
      </span>
    );
  }

  if (!compatibles.length) {
    return (
      <span className="flex h-[18px] items-center gap-1 text-xs text-ui-copy">
        <CircleHelp size={14} className="shrink-0" aria-hidden="true" />
        <span className="truncate">Consulta para qué moto es</span>
      </span>
    );
  }

  // La primera moto y cuántas más: en una tarjeta angosta dos nombres se cortaban a la mitad
  // ("Wolf 200 · Adventure …") y el "+N" quedaba escondido.
  const resto = compatibles.length - 1;
  return (
    <span className="flex h-[18px] items-center gap-1 text-xs text-ui-copy" title={compatibles.map(c => nombreDeModelo(c.modelo.id, despiece)).join(', ')}>
      <Bike size={14} className="shrink-0 text-brand-orange-action dark:text-brand-orange" aria-hidden="true" />
      <span className="sr-only">Sirve para </span>
      <span className="min-w-0 truncate font-semibold text-ui-ink">{nombreCorto(nombreDeModelo(compatibles[0].modelo.id, despiece))}</span>
      {resto > 0 && <span className="shrink-0 font-semibold">y {resto} más</span>}
    </span>
  );
}

/** La lista completa en la ficha del repuesto. Cada moto abre todos sus repuestos. */
export function SirveParaFicha({ compatibles, miMoto, despiece, onElegir, onPreguntar }: {
  compatibles: CompatibilidadDespiece[] | null;
  /** La moto del cliente (la que está viendo o la última que eligió). */
  miMoto?: string | null;
  despiece: Despiece | null;
  onElegir: (id: string) => void;
  onPreguntar: () => void;
}) {
  if (!compatibles) {
    return <div className="h-24 animate-pulse rounded-xl bg-ui-muted" aria-label="Buscando las motos de este repuesto" />;
  }

  const leSirve = Boolean(miMoto && compatibles.some(c => c.modelo.id === miMoto));
  // La moto del cliente primero; después las de código propio y las demás, en el orden del despiece.
  const ordenados = [...compatibles].sort((a, b) =>
    Number(b.modelo.id === miMoto) - Number(a.modelo.id === miMoto)
    || Number(b.origen === 'propia') - Number(a.origen === 'propia'));
  const avisos = ordenados
    .map(c => ({ id: c.modelo.id, texto: AVISOS_CLIENTE[c.modelo.id] ?? c.modelo.aviso }))
    .filter((a): a is { id: string; texto: string } => Boolean(a.texto));

  return (
    <section aria-labelledby="sirve-para-titulo" className="rounded-xl border border-ui-border bg-ui-muted/60 p-3.5">
      <h3 id="sirve-para-titulo" className="flex items-center gap-2 text-sm font-black text-ui-ink">
        <Bike size={18} className="text-brand-orange-action dark:text-brand-orange" aria-hidden="true" />
        Sirve para
        {compatibles.length > 0 && (
          <span className="rounded-full bg-ui-surface px-2 py-0.5 text-xs font-bold tabular-nums text-ui-copy">
            {compatibles.length} {compatibles.length === 1 ? 'moto' : 'motos'}
          </span>
        )}
      </h3>

      {miMoto && compatibles.length > 0 && (
        leSirve ? (
          <p className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-800 dark:bg-green-950/50 dark:text-green-300">
            <CheckCircle2 size={18} className="shrink-0" aria-hidden="true" />
            Le sirve a tu {nombreDeModelo(miMoto, despiece)}
          </p>
        ) : (
          <p className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
            <TriangleAlert size={18} className="mt-px shrink-0" aria-hidden="true" />
            <span>No aparece para tu {nombreDeModelo(miMoto, despiece)}. Si tienes dudas, pregúntanos.</span>
          </p>
        )
      )}

      {compatibles.length > 0 ? (
        <>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Motos compatibles">
            {ordenados.map((c, i) => {
              const imagen = getMotoImageById(c.modelo.id);
              const esLaMia = c.modelo.id === miMoto;
              return (
                <li key={c.modelo.id} className="stagger max-w-full animate-rise" style={{ '--i': Math.min(i, 8) } as React.CSSProperties}>
                  <button
                    type="button"
                    onClick={() => onElegir(c.modelo.id)}
                    className={`press flex min-h-[44px] max-w-full items-center gap-2 rounded-full border py-1 pl-1.5 pr-3 text-left text-sm font-bold ${
                      esLaMia
                        ? 'border-green-600 bg-green-50 text-green-900 dark:bg-green-950/50 dark:text-green-200'
                        : 'border-ui-border bg-ui-surface text-ui-ink hover:border-brand-orange hover:text-brand-orange-action dark:hover:text-brand-orange'
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ui-muted">
                      {imagen
                        ? <img src={imagen} alt="" loading="lazy" className="h-full w-full object-contain" />
                        : <Bike size={16} className="text-ui-copy" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 break-words leading-tight">{nombreDeModelo(c.modelo.id, despiece)}</span>
                    <span className="sr-only">: ver todos sus repuestos</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {avisos.length > 0 && (
            <div role="note" className="mt-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
              <p className="flex items-center gap-1.5 font-bold"><TriangleAlert size={16} aria-hidden="true" />Confirma la versión de tu moto</p>
              <ul className="mt-1 space-y-1">
                {avisos.map(a => <li key={a.id}>{a.texto}</li>)}
              </ul>
            </div>
          )}
          <p className="mt-2.5 flex items-center gap-1 text-xs text-ui-copy">
            Toca una moto para ver todos sus repuestos <ChevronRight size={14} aria-hidden="true" />
          </p>
        </>
      ) : (
        <div className="mt-2 text-sm text-ui-copy">
          <p>El nombre de este repuesto no dice para qué moto es.</p>
          <button type="button" onClick={onPreguntar} className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 font-bold text-green-700 underline-offset-4 hover:underline dark:text-green-400">
            Pregúntanos si le sirve a tu moto <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
