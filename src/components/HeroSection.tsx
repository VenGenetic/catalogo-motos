import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Bike, Headphones, MessageCircle, RefreshCw, Truck } from 'lucide-react';
import { APP_CONFIG, nombreDeModelo } from '../config/constants';
import { getMotoImageById } from '../config/motoImages';
import { useMoto } from '../context/MotoContext';
import { trackContact } from '../utils/tracking';
import { buildWhatsAppUrl } from '../utils/attribution';
import { useDespiece } from '../utils/cargarDespiece';

/*
  Portada. Una sola pregunta: ¿qué moto tienes? Elegirla abre su despiece,
  que es la forma más rápida de dar con la pieza correcta. El buscador está
  siempre en la barra de arriba. Si el cliente ya eligió una moto antes, la
  portada se la ofrece con un toque.
*/

const VENTAJAS = [
  { Icono: BadgeCheck, titulo: 'Piezas originales', texto: 'Calidad Daytona' },
  { Icono: Truck, titulo: 'Envío nacional', texto: 'A todo Ecuador' },
  { Icono: Headphones, titulo: 'Asesoría real', texto: 'Confirmamos tu pieza' },
];

export const HeroSection = () => {
  const { miMoto, abrirSelector, elegirMoto } = useMoto();
  const { despiece } = useDespiece();
  const imagenMoto = getMotoImageById(miMoto ?? '') ?? '/modelos/wolf-250-cc.webp';

  const cotizar = () => {
    trackContact('hero');
    window.open(buildWhatsAppUrl(APP_CONFIG.WHATSAPP_NUMBER, 'Hola LV PARTS, quisiera cotizar unos repuestos.'), '_blank');
  };

  return (
    <section className="bg-ui-canvas">
      <div className="relative overflow-hidden bg-brand-bg text-white">
        <img src="/hero-perchas.webp" alt="" className="absolute inset-0 h-full w-full object-cover object-[center_44%] opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-6 px-4 pb-7 pt-7 sm:px-5 md:pb-12 md:pt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] lg:px-8 lg:pb-16 lg:pt-16">
          {/* El texto entra en cuatro tiempos (--i), de arriba hacia abajo. */}
          <div>
            <p className="stagger font-geist text-[11px] font-black uppercase tracking-[0.18em] text-brand-orange animate-rise sm:text-xs" style={{ '--i': 0 } as React.CSSProperties}>Repuestos originales Daytona</p>
            <h1 className="stagger mt-2 max-w-xl font-anton text-[clamp(2.3rem,9vw,4.75rem)] uppercase leading-[.95] tracking-[.02em] animate-rise lg:max-w-3xl" style={{ '--i': 1 } as React.CSSProperties}>
              El repuesto correcto <span className="text-brand-orange">para tu moto</span>
            </h1>
            <p className="stagger mt-3 max-w-lg text-[15px] leading-relaxed text-white/80 animate-rise sm:text-base" style={{ '--i': 2 } as React.CSSProperties}>
              Elige tu moto y te mostramos solo lo que le sirve. Stock en Guayaquil y envíos a todo Ecuador.
            </p>

            <div className="stagger mt-6 flex max-w-xl flex-col gap-2.5 animate-rise sm:flex-row sm:flex-wrap" style={{ '--i': 3 } as React.CSSProperties}>
              {miMoto ? (
                <>
                  <button
                    type="button"
                    onClick={() => elegirMoto(miMoto)}
                    className="group press flex min-h-[56px] items-center justify-center gap-2.5 rounded-xl bg-brand-orange-action px-6 text-base font-black text-white shadow-lg hover:bg-brand-orange sm:flex-1"
                  >
                    <Bike size={22} aria-hidden="true" />
                    <span className="truncate">Repuestos de mi {nombreDeModelo(miMoto, despiece)}</span>
                    <ArrowRight size={20} className="shrink-0 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={abrirSelector}
                    className="group press flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/40 bg-black/25 px-5 text-sm font-bold text-white backdrop-blur-sm hover:border-white"
                  >
                    <RefreshCw size={17} className="transition-transform duration-500 ease-out group-hover:rotate-180" aria-hidden="true" /> Otra moto
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={abrirSelector}
                  className="group press flex min-h-[56px] items-center justify-center gap-2.5 rounded-xl bg-brand-orange-action px-7 text-base font-black text-white shadow-lg hover:bg-brand-orange sm:flex-1"
                >
                  <Bike size={22} aria-hidden="true" /> Elegir mi moto <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </button>
              )}
              <div className="grid grid-cols-2 gap-2.5 sm:contents">
                <Link to="/catalogo" className="press flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/40 bg-black/25 px-4 text-sm font-bold text-white backdrop-blur-sm hover:border-white">
                  Ver todo el catálogo
                </Link>
                <button type="button" onClick={cotizar} className="press flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#25D366]/60 bg-black/25 px-4 text-sm font-bold text-[#7df0a6] backdrop-blur-sm hover:border-[#25D366]">
                  <MessageCircle size={18} aria-hidden="true" /> Asesor
                </button>
              </div>
            </div>
          </div>

          <div className="relative hidden aspect-[4/3] lg:block">
            <div className="absolute inset-[12%] rounded-full bg-brand-orange/25 blur-3xl" aria-hidden="true" />
            {/* La `key` es la foto: cuando el cliente cambia de moto, la nueva entra rodando. */}
            <img key={imagenMoto} src={imagenMoto} alt="" className="relative h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,.5)] animate-drive-in" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] sm:px-5 lg:px-8">
        <div className="scrollbar-hide flex overflow-x-auto border-b border-ui-border bg-ui-surface sm:grid sm:grid-cols-3 sm:border-x">
          {VENTAJAS.map(({ Icono, titulo, texto }, i) => (
            <div key={titulo} className={`stagger flex min-w-[64%] items-center gap-3 px-4 py-3.5 animate-rise sm:min-w-0 ${i < VENTAJAS.length - 1 ? 'border-r border-ui-border' : ''}`} style={{ '--i': i + 4 } as React.CSSProperties}>
              <Icono className="shrink-0 text-brand-orange" size={24} aria-hidden="true" />
              <div>
                <p className="text-sm font-black text-ui-ink">{titulo}</p>
                <p className="text-xs text-ui-copy">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
