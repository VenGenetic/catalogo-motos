import { useMemo } from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';
import { HeroSection } from './HeroSection';
import { FeaturedCategories } from './FeaturedCategories';
import { ModelExplorer } from './ModelExplorer';
import { Producto } from '../types';
import { APP_CONFIG } from '../config/constants';

interface HomeViewProps {
  productos: Producto[];
}

export const HomeView = ({ productos }: HomeViewProps) => {
  // Cuántos repuestos activos hay de cada sistema, para "¿Qué parte buscas?".
  const conteo = useMemo(() => {
    const porSistema = new Map<string, number>();
    for (const p of productos) if (p.is_active !== false) porSistema.set(p.seccion || 'Otros', (porSistema.get(p.seccion || 'Otros') ?? 0) + 1);
    return porSistema;
  }, [productos]);
  
  // DATOS DEL NEGOCIO LOCAL (Schema.org)
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "LV PARTS",
    "image": `${window.location.origin}/preview.jpg`,
    "description": "Distribuidor autorizado de repuestos originales para motos Daytona en Ecuador. Stock en Guayaquil y envíos a todo el país.",
    "telephone": APP_CONFIG.WHATSAPP_NUMBER,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ecuador",
      "addressCountry": "EC"
    },
    "url": window.location.origin,
    "priceRange": "$$"
  };  return (
    <div className="animate-fade-in">
        <title>LV PARTS | Repuestos originales Daytona en Ecuador</title>
        <meta name="description" content="Catálogo de repuestos originales para motos Daytona: Wing Evo, Tekken, GP1, Wolf, Shark y más. Precios actualizados, stock en Guayaquil y envíos a todo Ecuador." />
        <script type="application/ld+json">
          {JSON.stringify(businessSchema)}
        </script>

      <HeroSection />

      <ModelExplorer />

      <FeaturedCategories conteo={conteo} />

      {/* Sección de Ubicación y Mapa */}
      <section className="border-t border-ui-border bg-ui-surface py-10 md:py-14">
        <div className="mx-auto max-w-[1440px] px-3 sm:px-5 lg:px-8">
          <div className="mb-5">
            <span className="section-kicker">Atención y despacho</span>
            <h2 className="mt-2 text-2xl font-black text-ui-ink md:text-3xl">Estamos en Guayaquil</h2>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-px overflow-hidden rounded-xl border border-ui-border bg-ui-border md:grid-cols-2">
               
             {/* Lado izquierdo: Información y detalles */}
             <div className="flex flex-col justify-between bg-ui-surface p-6 md:p-9">
               <div>
                 <span className="section-kicker mb-3">
                   Punto de atención
                 </span>
                 <h3 className="mb-4 text-2xl font-black uppercase text-ui-ink md:text-3xl">
                   Love Daytona - LV PARTS
                 </h3>
                 <p className="mb-6 text-sm leading-relaxed text-ui-copy">
                   Ven a nuestro local físico para recibir asesoría personalizada y encontrar todos los repuestos y accesorios que necesitas para tu motocicleta Daytona.
                 </p>
                 
                 <div className="space-y-4">
                   <div className="flex items-start gap-3">
                     <div className="shrink-0 bg-brand-orange/10 p-2 text-brand-orange-action dark:text-brand-orange">
                       <MapPin className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-ui-ink">Dirección</h4>
                       <p className="text-xs text-ui-copy">Love Daytona, Guayaquil, Ecuador</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start gap-3">
                     <div className="shrink-0 bg-brand-orange/10 p-2 text-brand-orange-action dark:text-brand-orange">
                       <Clock className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-ui-ink">Horario de Atención</h4>
                       <p className="text-xs text-ui-copy">Lunes a Sábado: 8:00 AM - 6:00 PM</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <div className="shrink-0 bg-wa/10 p-2 text-wa-deep dark:text-wa-light">
                       <Phone className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-ui-ink">Teléfono / WhatsApp</h4>
                       <p className="text-xs font-bold tabular-nums text-ui-copy">+593 99 327 9707</p>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="mt-8">
                 <a 
                   href="https://maps.app.goo.gl/xj8vjxQYTpfZ7XhRA" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-orange-action px-6 py-3.5 text-sm font-black text-white transition-colors hover:bg-brand-orange active:scale-[0.98]"
                 >
                   <MapPin className="w-5 h-5" />
                   <span>Ir a la ubicación</span>
                 </a>
               </div>
             </div>
             
             {/* Lado derecho: Google Maps Embed */}
             <div className="relative min-h-[340px] overflow-hidden bg-ui-surface md:min-h-full">
               <iframe 
                 src="https://maps.google.com/maps?q=-2.2153801,-79.8986826&t=&z=16&ie=UTF8&iwloc=&output=embed"
                 className="absolute inset-0 w-full h-full border-0"
                 allowFullScreen={true}
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
                 title="Ubicación de Love Daytona - LV PARTS"
               ></iframe>
             </div>
             
          </div>
        </div>
      </section>
    </div>
  );
};
