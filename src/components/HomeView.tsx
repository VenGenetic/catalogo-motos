import { MapPin, Clock, Phone } from 'lucide-react';
import { HeroSection } from './HeroSection';
import { FeaturedCategories } from './FeaturedCategories';
import { Producto } from '../types';
import { APP_CONFIG } from '../config/constants';

interface HomeViewProps {
  productos: Producto[];
}

// CORRECCIÓN: Renombramos 'productos' a '_productos' para silenciar el error de variable no usada
export const HomeView = ({ productos: _ }: HomeViewProps) => {
  
  // DATOS DEL NEGOCIO LOCAL (Schema.org)
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "LV PARTS",
    "image": `${window.location.origin}/preview.jpg`,
    "description": "Distribuidor autorizado de repuestos para motos Daytona, Tekken, IGM y más en Ecuador.",
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
        <title>LV PARTS | Repuestos Daytona y Multimarca Ecuador</title>
        <meta name="description" content="Catálogo digital de repuestos originales y homologados. Encuentra piezas para motor, frenos y chasis de Daytona, Tekken e IGM." />
        <script type="application/ld+json">
          {JSON.stringify(businessSchema)}
        </script>

      <HeroSection />

      <FeaturedCategories />

      {/* Sección de Ubicación y Mapa */}
      <section className="border-t border-ui-border bg-ui-muted/45 py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
               
             {/* Lado izquierdo: Información y detalles */}
             <div className="surface-card flex flex-col justify-between rounded-[1.5rem] p-6 md:p-8">
               <div>
                 <span className="text-brand-orange text-xs font-black uppercase tracking-widest block mb-2">
                   Visítanos en Guayaquil
                 </span>
                 <h3 className="mb-4 text-xl font-black text-ui-ink md:text-2xl">
                   Love Daytona - LV PARTS
                 </h3>
                 <p className="mb-6 text-sm leading-relaxed text-ui-copy">
                   Ven a nuestro local físico para recibir asesoría personalizada y encontrar todos los repuestos y accesorios que necesitas para tu motocicleta Daytona.
                 </p>
                 
                 <div className="space-y-4">
                   <div className="flex items-start gap-3">
                     <div className="bg-brand-orange/10 p-2 rounded-xl text-brand-orange shrink-0">
                       <MapPin className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-ui-ink">Dirección</h4>
                       <p className="text-xs text-ui-copy">Love Daytona, Guayaquil, Ecuador</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start gap-3">
                     <div className="shrink-0 rounded-xl bg-brand-orange/10 p-2 text-brand-orange">
                       <Clock className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-ui-ink">Horario de Atención</h4>
                       <p className="text-xs text-ui-copy">Lunes a Sábado: 9:00 AM - 6:00 PM</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <div className="shrink-0 rounded-xl bg-[#25D366]/10 p-2 text-[#168b4c] dark:text-[#54e38b]">
                       <Phone className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-ui-ink">Teléfono / WhatsApp</h4>
                       <p className="font-mono text-xs font-bold text-ui-copy">+593 99 327 9707</p>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="mt-8">
                 <a 
                   href="https://maps.app.goo.gl/xj8vjxQYTpfZ7XhRA" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-orange-action px-6 py-3.5 font-bold text-white shadow-lg shadow-brand-orange/15 transition-all hover:bg-brand-orange active:scale-[0.98] primary-button-glow"
                 >
                   <MapPin className="w-5 h-5" />
                   <span>Ir a la ubicación</span>
                 </a>
               </div>
             </div>
             
             {/* Lado derecho: Google Maps Embed */}
             <div className="surface-card relative min-h-[320px] overflow-hidden rounded-[1.5rem] md:min-h-full">
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
