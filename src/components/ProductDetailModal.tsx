import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Copy, Info, MessageCircle, Share2, ShoppingCart, X } from 'lucide-react';
import { Producto } from '../types';
import { useCart } from '../context/CartContext';
import { useMoto } from '../context/MotoContext';
import { useToast } from '../context/ToastContext';
import { optimizarImg } from '../utils/helpers';
import { shareProductAsImage } from '../utils/shareHelper';
import { preguntarPorRepuesto } from '../utils/consultas';
import { useDespiece, type Despiece } from '../utils/cargarDespiece';
import type { PiezaDeModelo } from '../utils/despiece';
import { nombreDeModelo } from '../config/constants';
import { ImageZoom } from './ImageZoom';
import { LazyImage } from './LazyImage';
import { EstadoStock, precioTexto } from './ProductCard';
import { SirveParaFicha, nombreCorto, useCompatibles } from './SirvePara';

/*
  Ficha del repuesto.

  Celular: pantalla completa. Arriba la foto a todo el ancho (es apaisada, así
  se ve grande), después precio, "Sirve para" y más piezas de la misma moto;
  abajo, fijos, "Preguntar" y "Agregar". Se desliza a los lados para pasar al
  repuesto anterior o siguiente de la lista.
  Computadora: ventana de dos columnas, foto a la izquierda.
*/

interface Props {
  product: Producto | null;
  allProducts: Producto[];
  currentList?: Producto[];
  onClose: () => void;
  onSelectRelated: (p: Producto) => void;
  despiece: Despiece | null;
  /** La moto que el catálogo está mostrando. */
  filtroModelo?: string;
  /** Las piezas de esa moto, ya calculadas por el catálogo. */
  piezasModelo?: Map<string | number, PiezaDeModelo> | null;
}

export const ProductDetailModal = ({ product, allProducts, currentList, onClose, onSelectRelated, despiece, filtroModelo, piezasModelo }: Props) => {
  const { addToCart, cart } = useCart();
  const { miMoto, elegirMoto } = useMoto();
  const { showToast } = useToast();
  const { noDisponible } = useDespiece();
  const [copiado, setCopiado] = useState(false);

  const compatibles = useCompatibles(product ?? ({ id: '', nombre: '', precio: 0, categoria: '', imagen: '' } as Producto), despiece);
  // La moto del cliente: la que está viendo o, si no eligió ninguna aquí, la última que eligió.
  const motoCliente = filtroModelo || miMoto;

  // Navegación (Siguiente / Anterior)
  const currentIndex = currentList?.findIndex(p => p.id === product?.id) ?? -1;
  const hasPrev = currentIndex > 0;
  const hasNext = Boolean(currentList && currentIndex >= 0 && currentIndex < currentList.length - 1);

  const navigateTo = useCallback((direction: 1 | -1) => {
    if (!currentList) return;
    const nextIdx = currentIndex + direction;
    if (nextIdx >= 0 && nextIdx < currentList.length) onSelectRelated(currentList[nextIdx]);
  }, [currentIndex, currentList, onSelectRelated]);

  // Teclado (ESC y flechas)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) navigateTo(-1);
      if (e.key === 'ArrowRight' && hasNext) navigateTo(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, hasPrev, hasNext, navigateTo]);

  // Deslizar a los lados (celular y tablet) para cambiar de repuesto.
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    // Las filas que se desplazan solas a los lados (más fotos, más repuestos) no cambian de repuesto.
    if ((e.target as HTMLElement).closest('[data-sin-deslizar]')) { setTouchStart(null); return; }
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dx = touchStart.x - e.changedTouches[0].clientX;
    const dy = touchStart.y - e.changedTouches[0].clientY;
    setTouchStart(null);
    // Sólo un gesto claramente horizontal: al bajar leyendo la ficha no se cambia de repuesto.
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx > 0 && hasNext) navigateTo(1);
    if (dx < 0 && hasPrev) navigateTo(-1);
  };

  // Precarga la foto del anterior y del siguiente: al deslizar rápido no se ve en blanco.
  useEffect(() => {
    if (!currentList) return;
    if (hasNext) new Image().src = optimizarImg(currentList[currentIndex + 1].imagen, 1024);
    if (hasPrev) new Image().src = optimizarImg(currentList[currentIndex - 1].imagen, 1024);
  }, [currentIndex, currentList, hasNext, hasPrev]);

  // Bloquear el scroll de la página de atrás.
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = anterior; };
  }, []);

  // La moto de la que se muestran "más repuestos": la del cliente si le sirve; si no, la dueña del código.
  const motoRelacionada = useMemo(() => {
    if (!compatibles?.length) return null;
    if (motoCliente && compatibles.some(c => c.modelo.id === motoCliente)) return motoCliente;
    return (compatibles.find(c => c.origen === 'propia') ?? compatibles[0]).modelo.id;
  }, [compatibles, motoCliente]);

  const piezasRelacionadas = useMemo(() => {
    if (!despiece || !motoRelacionada) return null;
    if (motoRelacionada === filtroModelo && piezasModelo) return piezasModelo;
    return despiece.piezasDeModelo(allProducts.map(p => ({ id: p.id, sku: p.codigo_referencia ?? null, name: p.nombre })), motoRelacionada);
  }, [despiece, motoRelacionada, filtroModelo, piezasModelo, allProducts]);

  // Del mismo sistema primero (lo que se suele cambiar junto), con stock primero.
  const relacionados = useMemo(() => {
    if (!product || !piezasRelacionadas) return [];
    return allProducts
      .filter(p => p.id !== product.id && piezasRelacionadas.has(p.id))
      .sort((a, b) =>
        Number(b.seccion === product.seccion) - Number(a.seccion === product.seccion)
        || Number(Boolean(b.stock)) - Number(Boolean(a.stock)))
      .slice(0, 10);
  }, [product, piezasRelacionadas, allProducts]);

  const galleryImages = product?.gallery || [];

  if (!product) return null;

  const enPedido = cart.find(i => i.id === product.id)?.cantidad ?? 0;
  const motoCorta = motoCliente ? nombreCorto(nombreDeModelo(motoCliente, despiece)) : undefined;

  const copiarCodigo = () => {
    if (!product.codigo_referencia) return;
    navigator.clipboard?.writeText(product.codigo_referencia).catch(() => undefined);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.nombre,
    "image": [`${window.location.origin}${optimizarImg(product.imagen)}`],
    "description": `Repuesto ${product.nombre}. Categoría: ${product.categoria}.`,
    "sku": product.codigo_referencia || product.id,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": product.precio,
      // "Bajo pedido" es BackOrder: así lo dice también el feed de Google (ver vite/sitemapYFeed.ts).
      "availability": !product.stock ? "https://schema.org/OutOfStock"
        : product.origenes?.includes('bajo pedido') ? "https://schema.org/BackOrder" : "https://schema.org/InStock"
    }
  };

  const flecha = (direccion: 1 | -1) => (
    <button
      type="button"
      onClick={() => navigateTo(direccion)}
      className={`absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ui-border bg-ui-surface/95 text-ui-ink shadow-lg transition-[border-color,background-color] duration-200 hover:border-ui-ink hover:bg-ui-surface md:flex ${direccion === -1 ? 'left-3' : 'right-3'}`}
      aria-label={direccion === -1 ? 'Repuesto anterior' : 'Repuesto siguiente'}
    >
      {direccion === -1 ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
    </button>
  );

  return (
    <div
      className="viewport-fill product-modal-layer fixed inset-0 z-modal flex items-center justify-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${product.nombre}`}
    >
      <title>{`${product.nombre} | LV PARTS`}</title>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="viewport-fill absolute inset-0 bg-brand-bg/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="product-modal-panel relative flex h-full w-full flex-col overflow-hidden bg-ui-surface shadow-2xl animate-scale-up md:grid md:h-[min(88vh,760px)] md:max-w-6xl md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:rounded-2xl"
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Barra de arriba (celular) */}
        <div className="flex shrink-0 items-center justify-between border-b border-ui-border px-1.5 pb-1 pt-[calc(0.25rem+env(safe-area-inset-top))] md:hidden">
          <button type="button" onClick={onClose} className="touch-target flex items-center justify-center rounded-full text-ui-ink active:bg-ui-muted" aria-label="Cerrar">
            <X size={26} />
          </button>
          {currentList && currentIndex >= 0 && (
            <span className="text-xs font-semibold tabular-nums text-ui-copy">{(currentIndex + 1).toLocaleString('es-EC')} de {currentList.length.toLocaleString('es-EC')}</span>
          )}
          <button type="button" onClick={() => shareProductAsImage(product, showToast)} className="touch-target flex items-center justify-center rounded-full text-ui-ink active:bg-ui-muted" aria-label="Compartir repuesto">
            <Share2 size={22} />
          </button>
        </div>

        {/* FOTO */}
        <div className="relative shrink-0 border-b border-ui-border bg-white md:flex md:h-full md:flex-col md:border-b-0 md:border-r">
          {hasPrev && flecha(-1)}
          {hasNext && flecha(1)}
          <div className="relative aspect-[1024/531] w-full overflow-hidden md:aspect-auto md:min-h-0 md:flex-1">
            <ImageZoom
              src={optimizarImg(product.imagen, 1024)}
              fallbackSrc={`/imagenes_repuestos/${product.codigo_referencia}.webp`}
              alt={product.nombre}
              className="h-full w-full p-1 md:p-8"
            />
          </div>
          <p className="hidden pb-4 text-center text-xs text-ui-copy md:block">Toca la foto para ampliarla · ← → para ver otro repuesto</p>
        </div>

        {/* INFORMACIÓN */}
        <div className="flex min-h-0 flex-1 flex-col md:h-full">
          <div className="hidden h-14 shrink-0 items-center justify-end gap-1 border-b border-ui-border px-3 md:flex">
            <button type="button" onClick={() => shareProductAsImage(product, showToast)} className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-ui-ink hover:bg-ui-muted">
              <Share2 size={18} /> Compartir
            </button>
            <button type="button" onClick={onClose} className="touch-target flex items-center justify-center rounded-full text-ui-ink hover:bg-ui-muted" aria-label="Cerrar">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 md:p-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <EstadoStock product={product} grande />
                {product.codigo_referencia && (
                  <button type="button" onClick={copiarCodigo} className="inline-flex min-h-[32px] items-center gap-1.5 rounded-md border border-ui-border bg-ui-muted px-2 font-mono text-xs text-ui-copy hover:border-ui-ink" aria-label={`Copiar código ${product.codigo_referencia}`}>
                    {copiado ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                    {product.codigo_referencia}
                  </button>
                )}
              </div>
              <h2 className="text-xl font-black leading-snug text-ui-ink md:text-2xl">{product.nombre}</h2>
              <p className="mt-1 text-sm text-ui-copy">{product.seccion}</p>
            </div>

            <div className="flex items-end justify-between gap-3">
              <span className={product.precio ? 'text-3xl font-black tracking-tight text-ui-ink' : 'text-xl font-bold text-ui-copy'}>
                {precioTexto(product.precio)}
              </span>
              {product.is_discontinued && <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-800 dark:bg-red-950 dark:text-red-200">Descontinuado</span>}
            </div>

            {/* Sin despiece (iPhone anterior a iOS 16.4) no se sabe: mejor no decir nada que adivinar. */}
            {!noDisponible && <SirveParaFicha
              compatibles={compatibles}
              miMoto={motoCliente}
              despiece={despiece}
              onElegir={elegirMoto}
              onPreguntar={() => preguntarPorRepuesto(product, motoCorta)}
            />}

            <p className="flex gap-2 text-xs leading-relaxed text-ui-copy">
              <Info size={16} className="shrink-0" aria-hidden="true" />
              Compara la foto y el código con tu pieza usada. Si tienes dudas, pregúntanos antes de comprar.
            </p>

            {galleryImages.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-black text-ui-ink">Más fotos</h3>
                <div data-sin-deslizar className="scrollbar-hide flex gap-2 overflow-x-auto">
                  {galleryImages.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 w-36 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-ui-border bg-white"
                      onClick={() => { if (item.type === 'video') window.open(item.url, '_blank'); }}
                    >
                      {item.type === 'video' ? (
                        <>
                          <video src={item.url} className="h-full w-full object-cover" muted playsInline />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-white" />
                          </span>
                        </>
                      ) : (
                        <ImageZoom src={optimizarImg(item.url)} fallbackSrc={`/imagenes_repuestos/${product.codigo_referencia}.webp`} alt={`${product.nombre} - vista ${idx + 1}`} className="h-full w-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {motoRelacionada && relacionados.length > 0 && (
              <div>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-black text-ui-ink">Más repuestos de la {nombreCorto(nombreDeModelo(motoRelacionada, despiece))}</h3>
                  <button type="button" onClick={() => elegirMoto(motoRelacionada)} className="inline-flex min-h-[40px] shrink-0 items-center gap-1 text-sm font-bold text-brand-orange-action hover:underline dark:text-brand-orange">
                    Ver todos <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
                <div data-sin-deslizar className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:-mx-6 md:px-6">
                  {relacionados.map(rel => (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => onSelectRelated(rel)}
                      className="press flex w-40 shrink-0 flex-col overflow-hidden rounded-xl border border-ui-border bg-ui-surface text-left hover:border-ui-ink"
                    >
                      <span className="block aspect-[1024/531] w-full border-b border-ui-border bg-white">
                        <LazyImage src={optimizarImg(rel.imagen)} fallbackSrc={`/imagenes_repuestos/${rel.codigo_referencia}.webp`} alt={rel.nombre} className="h-full w-full !bg-white" imageFit="contain" />
                      </span>
                      <span className="flex flex-1 flex-col gap-1 p-2">
                        <span className="line-clamp-2 text-xs font-semibold leading-snug text-ui-ink">{rel.nombre}</span>
                        <span className="mt-auto text-sm font-black text-ui-ink">{precioTexto(rel.precio)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACCIONES: siempre a la vista */}
          <div className="shrink-0 border-t border-ui-border bg-ui-surface p-3 pb-safe md:p-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => preguntarPorRepuesto(product, motoCorta)}
                className="press flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-wa px-3 text-base font-bold text-brand-bg hover:bg-wa-hover"
              >
                <MessageCircle size={20} className="shrink-0" aria-hidden="true" />
                Preguntar
              </button>
              <button
                type="button"
                onClick={() => addToCart(product)}
                disabled={!product.stock}
                className={`press flex min-h-[52px] flex-[1.4] items-center justify-center gap-2 rounded-xl px-3 text-base font-bold ${
                  product.stock
                    ? 'bg-brand-orange-action text-white hover:bg-brand-orange'
                    : 'cursor-not-allowed bg-ui-muted text-ui-copy'
                }`}
              >
                {enPedido > 0 ? <Check key={enPedido} size={20} strokeWidth={3} className="shrink-0 animate-check-in" aria-hidden="true" /> : <ShoppingCart size={20} className="shrink-0" aria-hidden="true" />}
                {!product.stock ? 'Agotado' : enPedido > 0 ? `Agregar otro (${enPedido})` : 'Agregar al pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
