import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Bike, ChevronDown, Headphones, MessageCircle, Search, Truck } from 'lucide-react';
import { APP_CONFIG, MODELOS_CATALOGO } from '../config/constants';
import { trackContact } from '../utils/tracking';
import { buildWhatsAppUrl } from '../utils/attribution';

export const HeroSection = () => {
  const navigate = useNavigate();
  const [consulta, setConsulta] = useState('');
  const [modeloAbierto, setModeloAbierto] = useState(false);
  const [filtroModelo, setFiltroModelo] = useState('');
  const modelos = useMemo(() => MODELOS_CATALOGO.filter(modelo =>
    modelo.nombre.toLocaleLowerCase('es').includes(filtroModelo.trim().toLocaleLowerCase('es'))
  ), [filtroModelo]);
  const selectorRef = useRef<HTMLDivElement>(null);

  // El selector de modelo se cierra al tocar fuera de él o con Escape.
  useEffect(() => {
    if (!modeloAbierto) return;
    const cerrarFuera = (event: PointerEvent) => {
      if (!selectorRef.current?.contains(event.target as Node)) setModeloAbierto(false);
    };
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModeloAbierto(false);
    };
    document.addEventListener('pointerdown', cerrarFuera);
    document.addEventListener('keydown', cerrarConEscape);
    return () => {
      document.removeEventListener('pointerdown', cerrarFuera);
      document.removeEventListener('keydown', cerrarConEscape);
    };
  }, [modeloAbierto]);

  const buscar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const termino = consulta.trim();
    navigate(termino ? `/catalogo?q=${encodeURIComponent(termino)}` : '/catalogo');
  };

  const cotizar = () => {
    trackContact('hero');
    window.open(buildWhatsAppUrl(APP_CONFIG.WHATSAPP_NUMBER, 'Hola LV PARTS, quisiera cotizar unos repuestos.'), '_blank');
  };

  return (
    <section className="bg-ui-canvas py-5 md:py-7">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5 lg:px-8">
        <div className="grid overflow-visible border border-ui-border bg-ui-surface shadow-card lg:grid-cols-[minmax(0,1.65fr)_minmax(360px,.85fr)]">
          <div className="relative min-h-[330px] overflow-hidden sm:min-h-[430px] lg:min-h-[520px]">
            <img src="/hero-perchas.webp" alt="Bodega de repuestos originales Daytona" className="absolute inset-0 h-full w-full object-cover object-[center_44%]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/58 to-black/10" />
            <div className="relative flex h-full min-h-[330px] max-w-2xl flex-col justify-end p-6 text-white sm:min-h-[430px] sm:p-10 lg:min-h-[520px] lg:p-12">
              <span className="mb-3 font-geist text-[11px] font-black uppercase tracking-[0.18em] text-brand-orange sm:text-xs">El repuesto correcto. A la primera.</span>
              <h1 className="max-w-xl font-anton text-[clamp(2.8rem,7vw,5.25rem)] uppercase leading-[.9] tracking-[.02em]">
                Repuestos para mantenerte <span className="text-brand-orange">en ruta.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm font-medium leading-relaxed text-white/80 sm:text-base">Encuentra piezas originales Daytona por modelo, sistema o código de referencia. Stock actualizado en Guayaquil.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => navigate('/catalogo')} className="inline-flex min-h-12 items-center gap-2 bg-brand-orange px-6 font-geist text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-brand-orange-action">
                  Ver catálogo <ArrowRight size={18} />
                </button>
                <button onClick={cotizar} className="inline-flex min-h-12 items-center gap-2 border border-white/60 bg-black/25 px-5 font-geist text-xs font-black uppercase tracking-wider text-white backdrop-blur-sm hover:border-white hover:bg-black/45">
                  <MessageCircle size={18} /> Hablar con un asesor
                </button>
              </div>
            </div>
          </div>

          <div className="relative border-t border-ui-border bg-ui-surface p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
            <span className="section-kicker">Encuentra tu pieza</span>
            <h2 className="mt-4 font-anton text-3xl uppercase leading-none tracking-wide text-ui-ink sm:text-4xl">Busca en el catálogo</h2>
            <p className="mb-6 mt-2 text-sm leading-relaxed text-ui-copy">Usa el nombre, el código o empieza seleccionando tu Daytona.</p>

            <form onSubmit={buscar}>
              <label className="mb-2 block font-geist text-[11px] font-black uppercase tracking-wider text-ui-ink" htmlFor="hero-search">Repuesto o código</label>
              <div className="flex border border-ui-border bg-ui-muted focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/15">
                <Search className="ml-4 h-5 w-5 shrink-0 self-center text-ui-copy" />
                <input id="hero-search" value={consulta} onChange={event => setConsulta(event.target.value)} placeholder="Ej. pastillas de freno" className="min-h-[54px] min-w-0 flex-1 bg-transparent px-3 text-base text-ui-ink outline-none placeholder:text-ui-copy/70" />
                <button type="submit" className="flex min-h-[54px] min-w-[54px] items-center justify-center bg-brand-orange text-white hover:bg-brand-orange-action" aria-label="Buscar repuesto"><ArrowRight size={21} /></button>
              </div>
            </form>

            <div className="my-6 flex items-center gap-3 font-geist text-[10px] font-bold uppercase tracking-[.16em] text-ui-copy"><span className="h-px flex-1 bg-ui-border" /> o selecciona tu moto <span className="h-px flex-1 bg-ui-border" /></div>

            <div ref={selectorRef}>
            <button type="button" onClick={() => setModeloAbierto(abierto => !abierto)} aria-expanded={modeloAbierto} className="flex min-h-[58px] w-full items-center justify-between border border-ui-border bg-ui-surface px-4 text-left font-bold text-ui-ink transition-colors hover:border-brand-orange">
              <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center bg-brand-orange/10 text-brand-orange"><Bike className="h-5 w-5" /></span> Elegir mi Daytona</span>
              <ChevronDown className={`h-5 w-5 text-brand-orange transition-transform ${modeloAbierto ? 'rotate-180' : ''}`} />
            </button>

            {modeloAbierto && <div className="absolute left-5 right-5 z-dropdown mt-2 border border-ui-border bg-ui-surface p-2 shadow-lifted sm:left-7 sm:right-7 lg:left-8 lg:right-8">
              <label className="sr-only" htmlFor="hero-model-search">Buscar modelo Daytona</label>
              <input id="hero-model-search" autoFocus value={filtroModelo} onChange={event => setFiltroModelo(event.target.value)} placeholder="Wolf, GP1, Tekken..." className="mb-2 min-h-[44px] w-full border border-ui-border bg-ui-muted px-3 text-sm text-ui-ink outline-none focus:border-brand-orange" />
              <div className="max-h-56 overflow-y-auto" aria-label="Modelos Daytona">
                {modelos.map(modelo => <button key={modelo.id} type="button" onClick={() => navigate(`/catalogo/${encodeURIComponent(modelo.id)}`)} className="flex min-h-[43px] w-full items-center justify-between border-b border-ui-border/60 px-3 text-left text-sm font-semibold text-ui-ink last:border-0 hover:bg-brand-orange/10 hover:text-brand-orange">{modelo.nombre}<ArrowRight size={15} className="shrink-0" /></button>)}
                {modelos.length === 0 && <p className="p-3 text-sm text-ui-copy">No encontramos ese modelo. Prueba otro nombre.</p>}
              </div>
            </div>}
            </div>

            <button type="button" onClick={cotizar} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ui-copy underline-offset-4 hover:text-brand-orange hover:underline"><Headphones size={18} /> ¿No estás seguro? Te ayudamos</button>
          </div>
        </div>

        <div className="grid border-x border-b border-ui-border bg-ui-surface sm:grid-cols-3">
          <div className="flex items-center gap-3 border-b border-ui-border px-5 py-4 sm:border-b-0 sm:border-r"><BadgeCheck className="shrink-0 text-brand-orange" size={24} /><div><p className="text-xs font-black uppercase tracking-wide text-ui-ink">Piezas originales</p><p className="text-xs text-ui-copy">Calidad Daytona comprobada</p></div></div>
          <div className="flex items-center gap-3 border-b border-ui-border px-5 py-4 sm:border-b-0 sm:border-r"><Truck className="shrink-0 text-brand-orange" size={24} /><div><p className="text-xs font-black uppercase tracking-wide text-ui-ink">Envío nacional</p><p className="text-xs text-ui-copy">Despachos a todo Ecuador</p></div></div>
          <div className="flex items-center gap-3 px-5 py-4"><Headphones className="shrink-0 text-brand-orange" size={24} /><div><p className="text-xs font-black uppercase tracking-wide text-ui-ink">Asesoría real</p><p className="text-xs text-ui-copy">Te ayudamos a confirmar la pieza</p></div></div>
        </div>
      </div>
    </section>
  );
};
