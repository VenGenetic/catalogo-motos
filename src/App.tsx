import { useState, useMemo, useEffect, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, useSearchParams, Link, useLocation } from 'react-router-dom';
import { Heart, WifiOff } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import './App.css';
import { limpiarTexto } from './utils/helpers';
import { APP_CONFIG } from './config/constants';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView'; 
// Asegúrate de tener este componente creado (te lo di hace un par de pasos)
import { WhatsAppButton } from './components/WhatsAppButton'; 

const CatalogView = lazy(() => import('./components/CatalogView').then(module => ({ default: module.CatalogView })));
const ContactView = lazy(() => import('./components/ContactView').then(module => ({ default: module.ContactView })));

import { ProductDetailModal } from './components/ProductDetailModal';
import { BottomNav } from './components/BottomNav';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Producto } from './types';
import { useProducts } from './hooks/useProducts';
import { useDebounce } from './hooks/useDebounce';

const PageLoader = () => (
  <div className="flex h-[60vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-400 animate-spin animation-delay-300"></div>
      </div>
      <p className="text-gray-500 font-medium animate-pulse">Cargando catálogo...</p>
    </div>
  </div>
);

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { productos, loading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');
  const busquedaDebounced = useDebounce(busqueda, 300);

  // Monitorear estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Estado inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleFav = useCallback((id: string) => {
    setFavs(prev => {
      const nuevos = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS, JSON.stringify(nuevos));
      return nuevos;
    });
  }, []);

  const productosFavoritos = useMemo(() => {
    return productos.filter(p => favs.includes(p.id));
  }, [productos, favs]);

  const filteredProducts = useMemo(() => {
    if (!busquedaDebounced && filtroSeccion === 'Todos' && !filtroModelo) return productos;

    // Mapeo de palabras clave a categorías estándar basado en la tabla proporcionada
    const keywordToCategoryMap: Record<string, string> = {
      // Instrumentos / Velocímetro
      'tablero': 'Instrumentos / Velocímetro',
      'velocímetro': 'Instrumentos / Velocímetro',
      'tacómetro': 'Instrumentos / Velocímetro',
      'relojes': 'Instrumentos / Velocímetro',
      'panel de instrumentos': 'Instrumentos / Velocímetro',
      'cuenta kilómetros': 'Instrumentos / Velocímetro',

      // Motor / Culata
      'cabezote': 'Motor / Culata',
      'culata': 'Motor / Culata',
      'tapa de cilindro': 'Motor / Culata',
      'cabeza de fuerza': 'Motor / Culata',
      'tapa de compresión': 'Motor / Culata',

      // Sistema Eléctrico / Bujía
      'candela': 'Sistema Eléctrico / Bujía',
      'bujía': 'Sistema Eléctrico / Bujía',
      'spark plug': 'Sistema Eléctrico / Bujía',
      'chispero': 'Sistema Eléctrico / Bujía',

      // Carburador / Sistema de Aire
      'choke': 'Carburador / Sistema de Aire',
      'ahogador': 'Carburador / Sistema de Aire',
      'estrangulador': 'Carburador / Sistema de Aire',
      'válvula de aire': 'Carburador / Sistema de Aire',
      'choque': 'Carburador / Sistema de Aire',

      // Sistema Eléctrico / CDI - ECU
      'cerebro': 'Sistema Eléctrico / CDI - ECU',
      'cdi': 'Sistema Eléctrico / CDI - ECU',
      'ecu': 'Sistema Eléctrico / CDI - ECU',
      'computadora': 'Sistema Eléctrico / CDI - ECU',
      'módulo de encendido': 'Sistema Eléctrico / CDI - ECU',
      'caja negra': 'Sistema Eléctrico / CDI - ECU',
      'tci': 'Sistema Eléctrico / CDI - ECU',

      // Sistema Eléctrico / Relé de Arranque
      'chancho': 'Sistema Eléctrico / Relé de Arranque',
      'chanchito': 'Sistema Eléctrico / Relé de Arranque',
      'marrano': 'Sistema Eléctrico / Relé de Arranque',
      'relé de arranque': 'Sistema Eléctrico / Relé de Arranque',
      'solenoide de partida': 'Sistema Eléctrico / Relé de Arranque',
      'relay': 'Sistema Eléctrico / Relé de Arranque',
      'automático de arranque': 'Sistema Eléctrico / Relé de Arranque',
      'cochinito': 'Sistema Eléctrico / Relé de Arranque',

      // Iluminación / Faro Delantero
      'farola': 'Iluminación / Faro Delantero',
      'faro': 'Iluminación / Faro Delantero',
      'ojo': 'Iluminación / Faro Delantero',
      'luz delantera': 'Iluminación / Faro Delantero',
      'foco delantero': 'Iluminación / Faro Delantero',
      'lámpara principal': 'Iluminación / Faro Delantero',
      'farol': 'Iluminación / Faro Delantero',

      // Iluminación / Luz Trasera
      'stop': 'Iluminación / Luz Trasera',
      'luz de freno': 'Iluminación / Luz Trasera',
      'piloto trasero': 'Iluminación / Luz Trasera',
      'luz trasera': 'Iluminación / Luz Trasera',
      'calavera': 'Iluminación / Luz Trasera',
      'farol trasero': 'Iluminación / Luz Trasera',

      // Iluminación / Direccionales
      'guías': 'Iluminación / Direccionales',
      'direccionales': 'Iluminación / Direccionales',
      'intermitentes': 'Iluminación / Direccionales',
      'pidevías': 'Iluminación / Direccionales',
      'luces de giro': 'Iluminación / Direccionales',
      'flasher': 'Iluminación / Direccionales',

      // Sistema Eléctrico / Estator
      'bobinas': 'Sistema Eléctrico / Estator',
      'corona de bobinas': 'Sistema Eléctrico / Estator',
      'plato de bobinas': 'Sistema Eléctrico / Estator',
      'estator': 'Sistema Eléctrico / Estator',
      'generador': 'Sistema Eléctrico / Estator',
      'magneto': 'Sistema Eléctrico / Estator',
      'campo': 'Sistema Eléctrico / Estator',

      // Transmisión / Kit de Arrastre
      'kit de arrastre': 'Transmisión / Kit de Arrastre',
      'kit de transmisión': 'Transmisión / Kit de Arrastre',
      'catalina y piñón': 'Transmisión / Kit de Arrastre',
      'sprocket kit': 'Transmisión / Kit de Arrastre',
      'relación': 'Transmisión / Kit de Arrastre',
      'transmisión final': 'Transmisión / Kit de Arrastre',

      // Transmisión / Corona (Catalina)
      'catalina': 'Transmisión / Corona (Catalina)',
      'corona trasera': 'Transmisión / Corona (Catalina)',
      'sprocket trasero': 'Transmisión / Corona (Catalina)',
      'engranaje trasero': 'Transmisión / Corona (Catalina)',
      'plato dentado': 'Transmisión / Corona (Catalina)',

      // Transmisión / Piñón
      'piñón de ataque': 'Transmisión / Piñón',
      'piñón de salida': 'Transmisión / Piñón',
      'piñón delantero': 'Transmisión / Piñón',
      'sprocket delantero': 'Transmisión / Piñón',
      'piñón de motor': 'Transmisión / Piñón',

      // Mandos / Cables de Control
      'guaya': 'Mandos / Cables de Control',
      'cable': 'Mandos / Cables de Control',
      'piola': 'Mandos / Cables de Control',
      'alambre': 'Mandos / Cables de Control',
      'chicote': 'Mandos / Cables de Control',

      // Suspensión / Horquilla Delantera
      'barras': 'Suspensión / Horquilla Delantera',
      'telescópicas': 'Suspensión / Horquilla Delantera',
      'suspensión delantera': 'Suspensión / Horquilla Delantera',
      'botellas': 'Suspensión / Horquilla Delantera',
      'tubos de suspensión': 'Suspensión / Horquilla Delantera',
      'amortiguador delantero': 'Suspensión / Horquilla Delantera',

      // Suspensión / Basculante
      'tijera': 'Suspensión / Basculante',
      'basculante': 'Suspensión / Basculante',
      'horquilla trasera': 'Suspensión / Basculante',
      'brazo oscilante': 'Suspensión / Basculante',
      'cuadro trasero': 'Suspensión / Basculante',

      // Chasis / Soporte Lateral
      'pata de cabra': 'Chasis / Soporte Lateral',
      'pata lateral': 'Chasis / Soporte Lateral',
      'soporte lateral': 'Chasis / Soporte Lateral',
      'pata': 'Chasis / Soporte Lateral',
      'muleta': 'Chasis / Soporte Lateral',

      // Chasis / Soporte Central
      'gato central': 'Chasis / Soporte Central',
      'caballete': 'Chasis / Soporte Central',
      'burro': 'Chasis / Soporte Central',
      'soporte central': 'Chasis / Soporte Central',
      'parador central': 'Chasis / Soporte Central',
      'doble pata': 'Chasis / Soporte Central',

      // Frenos / Pastillas (Disco)
      'pastillas': 'Frenos / Pastillas (Disco)',
      'pastas de freno': 'Frenos / Pastillas (Disco)',
      'caliper pads': 'Frenos / Pastillas (Disco)',
      'balatas': 'Frenos / Pastillas (Disco)',

      // Frenos / Zapatas (Tambor)
      'bandas': 'Frenos / Zapatas (Tambor)',
      'zapatas': 'Frenos / Zapatas (Tambor)',
      'frenos de tambor': 'Frenos / Zapatas (Tambor)',
      'balatas de tambor': 'Frenos / Zapatas (Tambor)',

      // Ruedas / Neumáticos
      'llantas': 'Ruedas / Neumáticos',
      'cauchos': 'Ruedas / Neumáticos',
      'neumáticos': 'Ruedas / Neumáticos',
      'gomas': 'Ruedas / Neumáticos',
      'cubierta': 'Ruedas / Neumáticos',
      'cubiertas': 'Ruedas / Neumáticos',

      // Ruedas / Aros
      'aros': 'Ruedas / Aros',
      'rines': 'Ruedas / Aros',
      'ruedas metálicas': 'Ruedas / Aros',

      // Motor-Chasis / Rulimanes
      'rulimanes': 'Motor-Chasis / Rulimanes',
      'rodamientos': 'Motor-Chasis / Rulimanes',
      'baleros': 'Motor-Chasis / Rulimanes',
      'cojinetes': 'Motor-Chasis / Rulimanes',
      'bearings': 'Motor-Chasis / Rulimanes',
      'bolilleros': 'Motor-Chasis / Rulimanes',

      // Carrocería / Carenado
      'plásticos': 'Carrocería / Carenado',
      'carenado': 'Carrocería / Carenado',
      'cachas': 'Carrocería / Carenado',
      'tapas': 'Carrocería / Carenado',
      'vestidura': 'Carrocería / Carenado',
      'cowl': 'Carrocería / Carenado',
      'guardafangos': 'Carrocería / Carenado',

      // Mandos / Manubrio
      'volante': 'Mandos / Manubrio',
      'manubrio': 'Mandos / Manubrio',
      'manillar': 'Mandos / Manubrio',
      'timón': 'Mandos / Manubrio',
      'dirección': 'Mandos / Manubrio',
      'tubo de dirección': 'Mandos / Manubrio',

      // Mandos / Puños
      'puños': 'Mandos / Puños',
      'mangos': 'Mandos / Puños',
      'empuñaduras': 'Mandos / Puños',
      'gomas de manubrio': 'Mandos / Puños',
      'grips': 'Mandos / Puños',

      // Mandos / Manetas
      'maniguetas': 'Mandos / Manetas',
      'manillas': 'Mandos / Manetas',
      'palancas de freno': 'Mandos / Manetas',
      'levas': 'Mandos / Manetas',

      // Motor / Sistema de Escape
      'mofle': 'Motor / Sistema de Escape',
      'escape': 'Motor / Sistema de Escape',
      'tubo de escape': 'Motor / Sistema de Escape',
      'exhosto': 'Motor / Sistema de Escape',
      'silenciador': 'Motor / Sistema de Escape',
      'bala': 'Motor / Sistema de Escape'
    };

    // Función para expandir términos con sinónimos y mapeo de categorías
    const expandirTerminos = (terminos: string[]): string[] => {
      const expandidos = new Set<string>();

      terminos.forEach(termino => {
        const terminoLower = termino.toLowerCase();
        expandidos.add(termino);

        // Agregar mapeo de categoría si existe
        if (keywordToCategoryMap[terminoLower]) {
          expandidos.add(keywordToCategoryMap[terminoLower]);
        }

        // Agregar sinónimos existentes (mantener compatibilidad)
        const sinonimos: Record<string, string[]> = {
          'freno': ['frenos', 'frenado', 'pastilla', 'pastillas', 'disco', 'tambor'],
          'filtro': ['filtro', 'filtrar', 'filtrado'],
          'aceite': ['aceite', 'lubricante', 'motor oil'],
          'bateria': ['batería', 'baterías', 'acumulador'],
          'cadena': ['cadena', 'transmisión', 'piñón'],
          'amortiguador': ['amortiguadores', 'suspensión', 'shock'],
          'llanta': ['llantas', 'neumático', 'neumáticos', 'rueda', 'ruedas'],
          'faro': ['faros', 'luz', 'luces', 'farola'],
          'escape': ['escape', 'silenciador', 'tubo', 'caño'],
          'motor': ['motor', 'cilindro', 'cilindros', 'piston', 'pistones'],
          'clutch': ['clutch', 'embrague', 'clutches'],
          'velocimetro': ['velocímetro', 'velocimetros', 'instrumentos', 'panel'],
          'carburador': ['carburador', 'carburadores', 'inyección', 'inyector'],
          'arranque': ['arranque', 'starter', 'partida'],
          'electrico': ['eléctrico', 'eléctrica', 'eléctricos', 'eléctricas', 'electricidad']
        };

        Object.entries(sinonimos).forEach(([clave, valores]) => {
          if (clave.includes(terminoLower) || valores.some(v => v.includes(terminoLower))) {
            valores.forEach(sinonimo => expandidos.add(sinonimo));
          }
        });
      });

      return Array.from(expandidos);
    };

    // Función para calcular puntuación de relevancia
    const calcularRelevancia = (producto: Producto, terminos: string[]): number => {
      if (!producto.textoBusqueda) return 0;

      const textoBusqueda = producto.textoBusqueda.toLowerCase();
      const nombre = producto.nombre.toLowerCase();
      const codigo = producto.codigo_referencia?.toLowerCase() || '';
      const seccion = producto.seccion?.toLowerCase() || '';
      let puntuacion = 0;

      // Expandir términos con sinónimos
      const terminosExpandidos = expandirTerminos(terminos);

      // Búsqueda exacta por código si está entre comillas
      if (busquedaDebounced.includes('"')) {
        const match = busquedaDebounced.match(/"([^"]+)"/);
        if (match && codigo.includes(match[1].toLowerCase())) {
          return 1000; // Puntuación máxima para coincidencia exacta de código
        }
      }

      // Calcular puntuación por cada término (original y expandido)
      for (const termino of [...terminos, ...terminosExpandidos]) {
        const terminoLower = termino.toLowerCase();

        // Coincidencia exacta en código de referencia (muy alta puntuación)
        if (codigo.includes(terminoLower)) {
          puntuacion += 50;
        }

        // Coincidencia al inicio del nombre (alta puntuación)
        if (nombre.startsWith(terminoLower)) {
          puntuacion += 30;
        }

        // Coincidencia en el nombre (puntuación media)
        if (nombre.includes(terminoLower)) {
          puntuacion += 20;
        }

        // Coincidencia en sección/categoría (alta puntuación para términos mapeados)
        if (seccion.includes(terminoLower) || terminoLower.includes(seccion)) {
          puntuacion += 25;
        }

        // Coincidencia en cualquier campo (puntuación baja)
        if (textoBusqueda.includes(terminoLower)) {
          puntuacion += 10;
        }

        // Bonus por posición: términos que aparecen más temprano tienen más peso
        const posicion = textoBusqueda.indexOf(terminoLower);
        if (posicion >= 0) {
          puntuacion += Math.max(0, 10 - Math.floor(posicion / 10));
        }
      }

      // Bonus adicional para productos que coinciden con categorías mapeadas
      terminos.forEach(termino => {
        const terminoLower = termino.toLowerCase();
        const categoriaMapeada = keywordToCategoryMap[terminoLower];
        if (categoriaMapeada && seccion.includes(categoriaMapeada.toLowerCase())) {
          puntuacion += 40; // Bonus significativo para coincidencias de categoría mapeada
        }
      });

      // Penalización por productos sin stock
      if (producto.stock === false) {
        puntuacion *= 0.7;
      }

      return puntuacion;
    };

    const terminos = busquedaDebounced ? limpiarTexto(busquedaDebounced).split(' ').filter(t => t.length > 0) : [];

    // Filtrar y puntuar productos
    const productosConPuntuacion = productos
      .filter((p) => {
        if (!p.precio) return false;
        if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
        if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;

        // Si hay términos de búsqueda, debe tener al menos puntuación mínima
        if (terminos.length > 0) {
          const puntuacion = calcularRelevancia(p, terminos);
          return puntuacion > 3; // Umbral más bajo para incluir sinónimos
        }

        return true;
      })
      .map((p) => ({
        ...p,
        relevancia: terminos.length > 0 ? calcularRelevancia(p, terminos) : 0
      }))
      .sort((a, b) => {
        // Si hay búsqueda, ordenar por relevancia descendente
        if (terminos.length > 0) {
          return b.relevancia - a.relevancia;
        }
        // Si no hay búsqueda, mantener orden original
        return 0;
      });

    return productosConPuntuacion;
  }, [productos, busquedaDebounced, filtroSeccion, filtroModelo]);

  const handleProductClick = useCallback((p: Producto) => {
    setSelectedProduct(p);
    setSearchParams((prev: URLSearchParams) => { prev.set('prod', p.id); return prev; });
  }, [setSearchParams]);

  const handleCloseModal = useCallback(() => {
    setSelectedProduct(null);
    setSearchParams((prev: URLSearchParams) => { prev.delete('prod'); return prev; });
  }, [setSearchParams]);

  useEffect(() => {
      if (!loading && productos.length > 0) {
        const prodId = searchParams.get('prod');
        if (prodId) {
          const found = productos.find((p) => p.id === prodId);
          if (found) setSelectedProduct(found);
        } else setSelectedProduct(null);
      }
  }, [searchParams, productos, loading]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-red-400 animate-spin animation-delay-300"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-bold text-lg animate-pulse">Cargando catálogo</p>
            <p className="text-gray-400 text-sm mt-1">Preparando repuestos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      {/* Indicador de conexión para móviles */}
      {!isOnline && (
        <div className="md:hidden bg-red-600 text-white text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
          <WifiOff size={16} />
          Sin conexión a internet
        </div>
      )}

      <Navbar />
      <main className="fade-in flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={
              <>
                <Helmet><title>LV PARTS | Repuestos de Moto Ecuador</title></Helmet>
                <HomeView productos={productos} />
              </>
            } />
            
            <Route path="/catalogo" element={
              <>
                <Helmet><title>Catálogo | LV PARTS</title></Helmet>
                <CatalogView 
                  productos={filteredProducts}
                  isFav={(id) => favs.includes(id)} 
                  toggleFav={toggleFav}
                  filtroModelo={filtroModelo} 
                  setFiltroModelo={setFiltroModelo}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  filtroSeccion={filtroSeccion} 
                  setFiltroSeccion={setFiltroSeccion}
                  onProductClick={handleProductClick} 
                />
              </>
            } />

            <Route path="/favoritos" element={
              <>
                <Helmet><title>Mis Favoritos | LV PARTS</title></Helmet>
                {favs.length > 0 ? (
                  <div className="animate-fade-in">
                    <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Heart className="text-red-600 fill-current" /> Mis Favoritos
                      </h2>
                    </div>
                    <CatalogView 
                      productos={productosFavoritos}
                      isFav={(id) => favs.includes(id)} 
                      toggleFav={toggleFav}
                      filtroModelo={filtroModelo} 
                      setFiltroModelo={setFiltroModelo}
                      busqueda={busqueda} 
                      setBusqueda={setBusqueda}
                      filtroSeccion={filtroSeccion} 
                      setFiltroSeccion={setFiltroSeccion}
                      onProductClick={handleProductClick} 
                    />
                  </div>
                ) : (
                  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                      <Heart className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes favoritos</h2>
                    <Link to="/catalogo" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                      Explorar Catálogo
                    </Link>
                  </div>
                )}
              </>
            } />
            <Route path="/contacto" element={<><Helmet><title>Contacto | LV PARTS</title></Helmet><ContactView /></>} />
            <Route path="*" element={<div className="p-20 text-center font-bold text-2xl">404 - No encontrado</div>} />
          </Routes>
        </Suspense>
      </main>
      
      {/* Componentes Globales ACTUALIZADOS */}
      <ProductDetailModal 
        product={selectedProduct} 
        allProducts={productos}         // NUEVO: Pasamos todo el catálogo
        onClose={handleCloseModal} 
        onSelectRelated={handleProductClick} // NUEVO: Acción al hacer clic en un relacionado
      />
      <CartDrawer />
      <WhatsAppButton hideWhenModalOpen={!!selectedProduct || location.pathname !== '/'} /> {/* NUEVO: Botón flotante siempre visible */}
      <ScrollToTopButton />
      <BottomNav />
      <Footer />
    </div>
  );
}