import { MapPin, Clock, Phone } from 'lucide-react';
import { HeroSection } from './HeroSection';
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
    "image": `${window.location.origin}/hero-nueva.png`,
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
      
      {/* Sección de Ubicación y Mapa */}
      <div className="py-16 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-150 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
               
             {/* Lado izquierdo: Información y detalles */}
             <div className="flex flex-col justify-between bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
               <div>
                 <span className="text-red-650 dark:text-red-500 text-xs font-black uppercase tracking-widest block mb-2">
                   Visítanos en Guayaquil
                 </span>
                 <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-4">
                   Love Daytona - LV PARTS
                 </h3>
                 <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                   Ven a nuestro local físico para recibir asesoría personalizada y encontrar todos los repuestos y accesorios que necesitas para tu motocicleta Daytona.
                 </p>
                 
                 <div className="space-y-4">
                   <div className="flex items-start gap-3">
                     <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded-xl text-red-650 dark:text-red-400 shrink-0">
                       <MapPin className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Dirección</h4>
                       <p className="text-xs text-gray-500 dark:text-gray-400">Love Daytona, Guayaquil, Ecuador</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start gap-3">
                     <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded-xl text-orange-600 dark:text-orange-400 shrink-0">
                       <Clock className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Horario de Atención</h4>
                       <p className="text-xs text-gray-500 dark:text-gray-400">Lunes a Sábado: 9:00 AM - 6:00 PM</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-xl text-green-600 dark:text-green-400 shrink-0">
                       <Phone className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Teléfono / WhatsApp</h4>
                       <p className="text-xs text-gray-500 dark:text-gray-400 font-mono font-bold">+593 99 327 9707</p>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="mt-8">
                 <a 
                   href="https://maps.app.goo.gl/xj8vjxQYTpfZ7XhRA" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-100 dark:shadow-none hover:shadow-red-200 transition-all active:scale-[0.98]"
                 >
                   <MapPin className="w-5 h-5" />
                   <span>Ir a la ubicación</span>
                 </a>
               </div>
             </div>
             
             {/* Lado derecho: Google Maps Embed */}
             <div className="rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 min-h-[300px] md:min-h-full shadow-sm relative bg-gray-150 dark:bg-slate-800">
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
      </div>
    </div>
  );
};