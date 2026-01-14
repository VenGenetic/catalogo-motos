import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HeroSection } from './HeroSection';
import { FeaturedCategories } from './FeaturedCategories';
import { Producto } from '../types';
import { APP_CONFIG } from '../config/constants';

interface HomeViewProps {
  productos: Producto[];
}

// CORRECCIÓN: Renombramos 'productos' a '_productos' para silenciar el error de variable no usada
export const HomeView = ({ productos: _productos }: HomeViewProps) => {
  
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
  };

  return (
    <div className="animate-fade-in">
      <Helmet>
        <title>LV PARTS | Repuestos Daytona y Multimarca Ecuador</title>
        <meta name="description" content="Catálogo digital de repuestos originales y homologados. Encuentra piezas para motor, frenos y chasis de Daytona, Tekken e IGM." />
        <script type="application/ld+json">
          {JSON.stringify(businessSchema)}
        </script>
      </Helmet>

      <HeroSection />
      
      {/* Sección de Categorías Destacadas */}
      <div className="py-12 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
           <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
                Encuentra lo que necesitas
              </h2>
              <p className="text-gray-500 text-sm md:text-base">
                Explora nuestro catálogo organizado por sistemas de tu motocicleta
              </p>
           </div>
           
           <FeaturedCategories />
           
           <div className="mt-12 text-center">
             <Link 
               to="/catalogo" 
               className="inline-flex items-center justify-center px-8 py-3 bg-white border border-gray-200 text-slate-900 font-bold rounded-xl shadow-sm hover:shadow-md hover:border-red-500 hover:text-red-600 transition-all active:scale-95"
             >
               Ver Catálogo Completo
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
};