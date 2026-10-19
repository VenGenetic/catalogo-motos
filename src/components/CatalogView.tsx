import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, ChevronDown, FileText, MessageCircle, RefreshCw, Search, TriangleAlert, X } from 'lucide-react';
import { APP_CONFIG, AVISOS_CLIENTE, ORDEN_SECCIONES, nombreDeModelo } from '../config/constants';
import { getMotoImageById } from '../config/motoImages';
import { useCart } from '../context/CartContext';
import { useMoto } from '../context/MotoContext';
import { Producto } from '../types';
import type { Despiece } from '../utils/cargarDespiece';
import { pedirAyuda, preguntarPorRepuesto } from '../utils/consultas';
import { useScrolled } from '../hooks/useScrolled';
import { IconoSistema } from './IconoSistema';
import { ProductCard } from './ProductCard';
import { nombreCorto } from './SirvePara';

/*
  El catálogo. Con una moto elegida (/catalogo/wolf-250) es su despiece: sólo
  lo que le sirve, por sistema y en el orden de la lista de la importadora,
  como el despiece del ERP.

  Celular: una sola fila fija bajo la barra de arriba, con la moto y los
  sistemas (con cuántas piezas tiene cada uno), y la grilla de dos columnas.
  El buscador es el de la barra de arriba: uno solo para toda la página.
  Computadora: la moto y los sistemas van en una columna a la izquierda.
*/

interface Props {
  /** Lo que se muestra: moto, búsqueda y sistema ya aplicados. */
  productos: Producto[];
  /** Repuestos por sistema con la moto y la búsqueda (sin el sistema). */
  conteoSistemas: Map<string, number>;
  totalSinSistema: number;
  filtroModelo: string;
  /** Todas las piezas de la moto elegida, sin búsqueda ni sistema. */
  piezasDeMoto: number | null;
  cargandoMoto: boolean;
  /** Mostrar el despiece agrupado por sistema (moto elegida, sin búsqueda, "Todos"). */
  agrupar: boolean;
  despiece: Despiece | null;
  busqueda: string;
  setBusqueda: (s: string) => void;
  filtroSeccion: string;
  setFiltroSeccion: (s: string) => void;
  onProductClick: (p: Producto) => void;
}

const repuestosTexto = (n: number) => `${n.toLocaleString('es-EC')} ${n === 1 ? 'repuesto' : 'repuestos'}`;

export const CatalogView = memo(({
  productos, conteoSistemas, totalSinSistema,
  filtroModelo, piezasDeMoto, cargandoMoto, agrupar, despiece,
  busqueda, setBusqueda,
  filtroSeccion, setFiltroSeccion,
  onProductClick,
}: Props) => {
  const [pagina, setPagina] = useState(1);
  const resultadosRef = useRef<HTMLDivElement>(null);
  const { cart, addToCart } = useCart();
  const { abrirSelector, quitarMoto } = useMoto();
  const bajado = useScrolled(24);

  const nombreModelo = filtroModelo ? nombreDeModelo(filtroModelo, despiece) : '';
  const modelo = filtroModelo ? despiece?.modeloPorId(filtroModelo) : undefined;
  const aviso = filtroModelo ? (AVISOS_CLIENTE[filtroModelo] ?? modelo?.aviso) : undefined;
  const imagenModelo = filtroModelo ? getMotoImageById(filtroModelo) : null;

  // Con otros filtros se vuelve a la primera página.
  const [filtrosPrevios, setFiltrosPrevios] = useState({ busqueda, filtroModelo, filtroSeccion });
  if (filtrosPrevios.busqueda !== busqueda || filtrosPrevios.filtroModelo !== filtroModelo || filtrosPrevios.filtroSeccion !== filtroSeccion) {
    setFiltrosPrevios({ busqueda, filtroModelo, filtroSeccion });
    setPagina(1);
  }

  // Si la lista cambia con la página bajada, se vuelve al comienzo de los resultados (no al de la página).
  useEffect(() => {
    const ancla = resultadosRef.current;
    if (ancla && ancla.getBoundingClientRect().top < 0) ancla.scrollIntoView({ block: 'start' });
  }, [busqueda, filtroModelo, filtroSeccion]);

  const visibles = useMemo(() => productos.slice(0, pagina * APP_CONFIG.ITEMS_PER_PAGE), [productos, pagina]);

  const enPedido = useMemo(() => new Map(cart.map(item => [item.id, item.cantidad || item.cant || 0])), [cart]);
  const motoCorta = nombreModelo ? nombreCorto(nombreModelo) : undefined;
  const preguntar = useCallback((p: Producto) => preguntarPorRepuesto(p, motoCorta), [motoCorta]);

  // "Frenos 0" no aparece: sólo si es el sistema elegido (la búsqueda lo dejó vacío).
  const sistemas = ORDEN_SECCIONES.filter(s => s === 'Todos' || s === filtroSeccion || (conteoSistemas.get(s) ?? 0) > 0);
  const contar = (s: string) => s === 'Todos' ? totalSinSistema : (conteoSistemas.get(s) ?? 0);

  const botonMoto = (
    <button
      type="button"
      onClick={abrirSelector}
      aria-haspopup="dialog"
      className={`press flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-bold ${
        filtroModelo ? 'border-brand-orange bg-brand-orange text-white' : 'border-brand-orange bg-ui-surface text-brand-orange-action dark:text-brand-orange'
      }`}
    >
      <Bike size={18} aria-hidden="true" />
      <span className="max-w-[9.5rem] truncate">{filtroModelo ? motoCorta : 'Elegir mi moto'}</span>
      <ChevronDown size={16} aria-hidden="true" />
    </button>
  );

  const fichaSistema = (s: string) => {
    const activa = filtroSeccion === s;
    return (
      <button
        key={s}
        type="button"
        onClick={e => { setFiltroSeccion(s); e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); }}
        aria-pressed={activa}
        className={`press flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-bold ${
          activa ? 'border-brand-bg bg-brand-bg text-white dark:border-white dark:bg-white dark:text-brand-bg' : 'border-ui-border bg-ui-surface text-ui-ink hover:border-ui-ink'
        }`}
      >
        {s === 'Todos' ? 'Todo' : s}
        <span className={`tabular-nums ${activa ? 'opacity-75' : 'text-ui-copy'}`}>{contar(s).toLocaleString('es-EC')}</span>
      </button>
    );
  };

  const cabeceraMoto = filtroModelo && (
    <section aria-label={`Despiece de la ${nombreModelo}`} className="overflow-hidden rounded-xl border border-ui-border bg-ui-surface shadow-card animate-rise">
      <div className="flex items-center gap-3 p-3 md:gap-5 md:p-5">
        <div className="model-media-shell flex aspect-[4/3] w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg p-1 md:w-44">
          {imagenModelo
            // La `key` es la moto: al cambiar de moto, la nueva entra rodando.
            ? <img key={filtroModelo} src={imagenModelo} alt={nombreModelo} className="h-full w-full object-contain animate-drive-in" />
            : <Bike size={36} strokeWidth={1.5} className="text-ui-copy/50" aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-geist text-[11px] font-black uppercase tracking-[.14em] text-brand-orange-action dark:text-brand-orange">Repuestos para tu moto</p>
          <h1 className="mt-0.5 font-anton text-[1.6rem] uppercase leading-none tracking-wide text-ui-ink md:text-4xl">{nombreModelo}</h1>
          <p className="mt-1.5 text-sm text-ui-copy">
            {cargandoMoto ? 'Buscando sus repuestos…'
              : piezasDeMoto !== null ? `${repuestosTexto(piezasDeMoto)} en su despiece`
              : 'Repuestos que la nombran'}
          </p>
        </div>
      </div>
      {aviso && (
        <p role="note" className="mx-3 mb-3 flex gap-2 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/50 dark:text-amber-100 md:mx-5">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span><strong>Confirma la versión de tu moto.</strong> {aviso}</span>
        </p>
      )}
      {modelo?.documentos?.map(doc => (
        <a key={doc.url} href={doc.url} target="_blank" rel="noopener noreferrer" className="mx-3 mb-3 flex min-h-[44px] items-center gap-2 text-sm font-bold text-brand-orange-action hover:underline dark:text-brand-orange md:mx-5">
          <FileText size={18} className="shrink-0" aria-hidden="true" />
          Ver el despiece con dibujos (PDF)<span className="sr-only"> (abre en otra pestaña)</span>
        </a>
      ))}
      <div className="grid grid-cols-2 border-t border-ui-border lg:hidden">
        <button type="button" onClick={abrirSelector} className="flex min-h-[48px] items-center justify-center gap-2 text-sm font-bold text-ui-ink active:bg-ui-muted">
          <RefreshCw size={16} aria-hidden="true" /> Cambiar moto
        </button>
        <button type="button" onClick={quitarMoto} className="flex min-h-[48px] items-center justify-center gap-2 border-l border-ui-border text-sm font-bold text-ui-ink active:bg-ui-muted">
          <X size={16} aria-hidden="true" /> Ver todas las motos
        </button>
      </div>
    </section>
  );

  const ayuda = (
    <div className="rounded-xl border border-ui-border bg-ui-surface p-4">
      <p className="font-bold text-ui-ink">¿No encuentras tu repuesto?</p>
      <p className="mt-1 text-sm text-ui-copy">Mándanos una foto de la pieza por WhatsApp y te decimos cuál es.</p>
      <button
        type="button"
        onClick={() => pedirAyuda('catalogo_ayuda', motoCorta)}
        className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-bold text-brand-bg transition-colors hover:bg-[#20bd5a]"
      >
        <MessageCircle size={18} aria-hidden="true" /> Escribir por WhatsApp
      </button>
    </div>
  );

  // La grilla, con el título de cada sistema cuando se ve el despiece completo de la moto.
  const tarjetas = visibles.map((product, i) => {
    const sistema = product.seccion || 'Otros';
    const titulo = agrupar && (i === 0 || sistema !== (visibles[i - 1].seccion || 'Otros'));
    return (
      <Fragment key={product.id}>
        {titulo && (
          <h2 className="col-span-full mt-3 flex items-center gap-2 border-b-2 border-ui-ink pb-2 pt-1 text-base font-black text-ui-ink animate-rise first:mt-0">
            <IconoSistema sistema={sistema} className="text-brand-orange" />
            {sistema}
            <span className="text-sm font-bold text-ui-copy">{(conteoSistemas.get(sistema) ?? 0).toLocaleString('es-EC')}</span>
          </h2>
        )}
        <ProductCard
          product={product}
          despiece={despiece}
          modeloActual={filtroModelo || undefined}
          enPedido={enPedido.get(product.id) ?? 0}
          onOpen={onProductClick}
          onAdd={addToCart}
          onAsk={preguntar}
          indice={i}
        />
      </Fragment>
    );
  });

  return (
    <div className="bg-ui-canvas pb-28 font-sans text-ui-ink md:pb-16">
      {/* CELULAR: moto + sistemas en una fila fija */}
      <div className={`sticky top-14 z-sticky border-b bg-ui-canvas/95 backdrop-blur-md transition-[box-shadow,border-color] duration-300 lg:hidden ${bajado ? 'border-ui-border shadow-[0_6px_16px_-8px_rgba(0,0,0,.25)]' : 'border-transparent'}`}>
        <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-3 py-2" role="group" aria-label="Filtrar por moto y sistema">
          {botonMoto}
          <span className="h-7 w-px shrink-0 bg-ui-border" aria-hidden="true" />
          {sistemas.map(fichaSistema)}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-5 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-7 lg:px-8 lg:pt-6">
        {/* COMPUTADORA: columna de filtros */}
        <aside className="hidden lg:block">
          <div className="sticky top-[132px] flex max-h-[calc(100vh-148px)] flex-col gap-4 overflow-y-auto pb-4 scrollbar-hide">
            <div className="rounded-xl border border-ui-border bg-ui-surface p-4 shadow-card">
              <h2 className="mb-3 font-geist text-[11px] font-black uppercase tracking-[.14em] text-ui-copy">Tu moto</h2>
              {filtroModelo ? (
                <>
                  <p className="font-black leading-tight text-ui-ink">{nombreModelo}</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={abrirSelector} className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-ui-border text-sm font-bold hover:border-ui-ink">
                      <RefreshCw size={15} aria-hidden="true" /> Cambiar
                    </button>
                    <button type="button" onClick={quitarMoto} className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-ui-border text-sm font-bold hover:border-ui-ink">
                      <X size={15} aria-hidden="true" /> Quitar
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" onClick={abrirSelector} className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-brand-orange-action px-4 text-sm font-bold text-white transition-colors hover:bg-brand-orange">
                  <Bike size={18} aria-hidden="true" /> Elegir mi moto
                </button>
              )}
            </div>

            <nav className="rounded-xl border border-ui-border bg-ui-surface p-2 shadow-card" aria-label="Filtrar por sistema">
              <h2 className="mb-1 px-2 pt-2 font-geist text-[11px] font-black uppercase tracking-[.14em] text-ui-copy">Sistema</h2>
              {sistemas.map(s => {
                const activa = filtroSeccion === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFiltroSeccion(s)}
                    aria-pressed={activa}
                    className={`flex min-h-[40px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm transition-colors ${
                      activa ? 'bg-brand-orange/10 font-black text-brand-orange-action dark:text-brand-orange' : 'font-semibold text-ui-ink hover:bg-ui-muted'
                    }`}
                  >
                    <IconoSistema sistema={s} size={17} className={activa ? '' : 'text-ui-copy'} />
                    <span className="flex-1">{s === 'Todos' ? 'Todos los sistemas' : s}</span>
                    <span className="text-xs tabular-nums text-ui-copy">{contar(s).toLocaleString('es-EC')}</span>
                  </button>
                );
              })}
            </nav>

            {ayuda}
          </div>
        </aside>

        <div className="min-w-0">
          {!filtroModelo && (
            <div className="mb-4 hidden lg:block">
              <p className="mb-2 text-xs font-bold text-ui-copy"><Link to="/" className="hover:text-brand-orange">Inicio</Link> <span className="px-1.5">/</span> Catálogo</p>
              <h1 className="font-anton text-4xl uppercase tracking-wide text-ui-ink">Catálogo de repuestos</h1>
            </div>
          )}

          {cabeceraMoto && <div className="mb-3">{cabeceraMoto}</div>}

          <div ref={resultadosRef} className="scroll-mt-[124px] lg:scroll-mt-[132px]">
            <div className="mb-3 flex min-h-[28px] flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ui-copy">
              {/* La `key` es la cantidad: al cambiar, el número entra de nuevo. */}
              <span key={cargandoMoto ? 'buscando' : productos.length} className="font-bold text-ui-ink animate-rise">{cargandoMoto ? 'Buscando…' : repuestosTexto(productos.length)}</span>
              {busqueda && (
                <span className="inline-flex items-center gap-1">
                  para <strong className="text-ui-ink">“{busqueda}”</strong>
                  <button type="button" onClick={() => setBusqueda('')} className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full hover:bg-ui-muted" aria-label="Quitar búsqueda">
                    <X size={15} aria-hidden="true" />
                  </button>
                </span>
              )}
              {filtroSeccion !== 'Todos' && (
                <span className="inline-flex items-center gap-1">
                  en <strong className="text-ui-ink">{filtroSeccion}</strong>
                  <button type="button" onClick={() => setFiltroSeccion('Todos')} className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full hover:bg-ui-muted" aria-label="Quitar sistema">
                    <X size={15} aria-hidden="true" />
                  </button>
                </span>
              )}
            </div>

            {cargandoMoto ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="stagger overflow-hidden rounded-xl border border-ui-border bg-ui-surface animate-rise" style={{ '--i': i } as React.CSSProperties}>
                    <div className="skeleton aspect-[1024/531]" />
                    <div className="space-y-2 p-3">
                      <div className="skeleton h-3 rounded" />
                      <div className="skeleton h-3 w-2/3 rounded" />
                      <div className="skeleton h-5 w-1/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibles.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {tarjetas}
                </div>

                {visibles.length < productos.length && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setPagina(p => p + 1)}
                      className="press mx-auto flex min-h-[52px] w-full max-w-sm items-center justify-center gap-2 rounded-xl border-2 border-ui-ink bg-ui-surface px-6 text-sm font-black text-ui-ink hover:border-brand-orange hover:text-brand-orange"
                    >
                      Ver más repuestos
                      <span className="font-semibold text-ui-copy">({(productos.length - visibles.length).toLocaleString('es-EC')})</span>
                    </button>
                  </div>
                )}
                <div className="mt-8 lg:hidden">{ayuda}</div>
              </>
            ) : (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-ui-border bg-ui-surface px-4 py-14 text-center">
                <Search size={40} className="mb-4 text-ui-copy/50" aria-hidden="true" />
                <h2 className="text-lg font-black text-ui-ink">
                  {busqueda ? `No encontramos “${busqueda}”` : 'No hay repuestos aquí'}
                  {filtroModelo ? ` para tu ${motoCorta}` : ''}
                </h2>
                <p className="mt-1 max-w-sm text-sm text-ui-copy">Prueba con otra palabra o pregúntanos: muchas piezas tienen otro nombre.</p>
                <div className="mt-5 flex w-full max-w-sm flex-col gap-2">
                  {filtroModelo && busqueda && (
                    <button type="button" onClick={quitarMoto} className="min-h-[48px] rounded-xl border-2 border-ui-ink px-4 text-sm font-black text-ui-ink">Buscar en todas las motos</button>
                  )}
                  {busqueda && (
                    <button type="button" onClick={() => setBusqueda('')} className="min-h-[48px] rounded-xl border border-ui-border px-4 text-sm font-bold text-ui-ink">Borrar la búsqueda</button>
                  )}
                  {filtroSeccion !== 'Todos' && (
                    <button type="button" onClick={() => setFiltroSeccion('Todos')} className="min-h-[48px] rounded-xl border border-ui-border px-4 text-sm font-bold text-ui-ink">Ver todos los sistemas</button>
                  )}
                  <button type="button" onClick={() => pedirAyuda('catalogo_sin_resultados', motoCorta)} className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-brand-bg">
                    <MessageCircle size={18} aria-hidden="true" /> Preguntar por WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

CatalogView.displayName = 'CatalogView';
