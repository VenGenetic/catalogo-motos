import { memo } from 'react';
import { Check, MessageCircle, ShoppingCart } from 'lucide-react';
import { Producto } from '../types';
import { optimizarImg } from '../utils/helpers';
import type { Despiece } from '../utils/cargarDespiece';
import { LazyImage } from './LazyImage';
import { SirveParaLinea, useCompatibles } from './SirvePara';

/*
  Tarjeta de repuesto.

  Casi todas las fotos miden lo mismo (1024×531 u 800×414: dos vistas de la
  pieza sobre fondo blanco), así que el marco tiene esa misma proporción y
  fondo blanco: la foto lo llena entero, sin franjas vacías, y todas las
  tarjetas de una fila quedan iguales. Las pocas fotos de otra medida se
  centran dentro del mismo marco.

  Toda la parte de arriba abre la ficha; el botón de abajo agrega al pedido
  (o, si está agotado, pregunta por WhatsApp). Son hermanos, no anidados.
*/

interface Props {
  product: Producto;
  despiece: Despiece | null;
  /** La moto que se está viendo (su despiece). */
  modeloActual?: string;
  /** Cuántas hay ya en el pedido. */
  enPedido: number;
  onOpen: (p: Producto) => void;
  onAdd: (p: Producto) => void;
  onAsk: (p: Producto) => void;
  /** Posición en la grilla: las tarjetas entran una tras otra (se repite cada 8). */
  indice?: number;
}

export const precioTexto = (precio: number) => precio ? `$${Number(precio).toFixed(2)}` : 'Consultar precio';

export const EstadoStock = ({ product, grande = false }: { product: Producto; grande?: boolean }) => {
  const bajoPedido = product.stock && product.origenes?.includes('bajo pedido');
  const [texto, punto, color] = !product.stock
    ? ['Agotado', 'bg-ui-copy/50', 'text-ui-copy']
    : bajoPedido
      ? ['Bajo pedido', 'bg-amber-500', 'text-amber-800 dark:text-amber-300']
      : ['En stock', 'bg-green-600', 'text-green-800 dark:text-green-400'];
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${grande ? 'text-sm' : 'text-xs'} ${color}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${punto}`} aria-hidden="true" />
      {texto}
    </span>
  );
};

export const ProductCard = memo(({ product, despiece, modeloActual, enPedido, onOpen, onAdd, onAsk, indice = 0 }: Props) => {
  const compatibles = useCompatibles(product, despiece);
  const agotado = !product.stock;

  return (
    <article
      className="group lift stagger flex h-full flex-col overflow-hidden rounded-xl border border-ui-border bg-ui-surface shadow-card animate-rise hover:border-ui-copy/40 [contain-intrinsic-size:320px] [content-visibility:auto]"
      style={{ '--i': indice % 8 } as React.CSSProperties}
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="flex flex-1 cursor-pointer flex-col text-left"
        aria-label={`Ver ${product.nombre}`}
      >
        <span className="relative block aspect-[1024/531] w-full overflow-hidden border-b border-ui-border bg-white">
          <LazyImage
            src={optimizarImg(product.imagen)}
            fallbackSrc={`/imagenes_repuestos/${product.codigo_referencia}.webp`}
            alt={product.nombre}
            className={`h-full w-full !bg-white transition-transform duration-300 group-hover:scale-[1.03] ${agotado ? 'opacity-55' : ''}`}
            imageFit="contain"
          />
          {(agotado || product.is_discontinued) && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-brand-bg/85 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              {product.is_discontinued ? 'Descontinuado' : 'Agotado'}
            </span>
          )}
        </span>

        <span className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
          <span className="line-clamp-3 min-h-[3.9em] text-[13px] font-semibold leading-[1.3] text-ui-ink transition-colors group-hover:text-brand-orange-action dark:group-hover:text-brand-orange sm:text-sm">
            {product.nombre}
          </span>
          {product.codigo_referencia && (
            <span className="hidden truncate font-mono text-xs text-ui-copy sm:block">{product.codigo_referencia}</span>
          )}
          <SirveParaLinea compatibles={compatibles} modeloActual={modeloActual} despiece={despiece} />
          <span className="mt-auto flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 pt-1">
            <span className={product.precio ? 'text-lg font-black tracking-tight text-ui-ink sm:text-xl' : 'text-sm font-bold text-ui-copy'}>
              {precioTexto(product.precio)}
            </span>
            <EstadoStock product={product} />
          </span>
        </span>
      </button>

      <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3">
        {agotado ? (
          <button
            type="button"
            onClick={() => onAsk(product)}
            className="press flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-ui-border bg-ui-surface text-sm font-bold text-ui-ink hover:border-green-600 hover:text-green-700"
          >
            <MessageCircle size={17} aria-hidden="true" />
            Preguntar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(product)}
            className={`press flex h-10 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-bold ${
              enPedido > 0
                ? 'border border-green-600 bg-green-50 text-green-800 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-300'
                : 'bg-brand-bg text-white hover:bg-brand-orange-action dark:bg-white dark:text-brand-bg dark:hover:bg-brand-orange dark:hover:text-white'
            }`}
            aria-label={enPedido > 0 ? `Agregar otra unidad de ${product.nombre} (ya tienes ${enPedido})` : `Agregar ${product.nombre} al pedido`}
          >
            {enPedido > 0
              // La `key` cambia con cada unidad: el visto se vuelve a dibujar en cada toque.
              ? <><Check key={enPedido} size={17} strokeWidth={3} className="animate-check-in" aria-hidden="true" /> En pedido · {enPedido}</>
              : <><ShoppingCart size={17} aria-hidden="true" /> Agregar</>}
          </button>
        )}
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';
