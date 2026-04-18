import { useState, useMemo, useEffect, Suspense, lazy, useCallback } from 'react';
import Fuse from 'fuse.js';
import { Routes, Route, useSearchParams, Link, useLocation, useNavigate, matchPath } from 'react-router-dom';
import { Heart, WifiOff } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import './App.css';
import { limpiarTexto } from './utils/helpers';
import { APP_CONFIG } from './config/constants';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView'; 
import { WhatsAppButton } from './components/WhatsAppButton'; 

// Carga Diferida (Lazy Loading)
const CatalogView = lazy(() => import('./components/CatalogView').then(module => ({ default: module.CatalogView })));
const ContactView = lazy(() => import('./components/ContactView'));

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
  const { productos, loading } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Derivamos el producto seleccionado de la URL
  const prodId = searchParams.get('prod');
  const selectedProduct = useMemo(() => 
    prodId ? productos.find(p => p.id === prodId) || null : null
  , [productos, prodId]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  const [busqueda, setBusqueda] = useState('');

  // Lógica de URL para el modelo
  const getModelFromUrl = useCallback((pathname: string) => {
    const match = matchPath({ path: "/catalogo/:modelo", end: true }, pathname);
    return match?.params?.modelo ? decodeURIComponent(match.params.modelo) : '';
  }, []);

  const [filtroModelo, setFiltroModelo] = useState(() => getModelFromUrl(location.pathname));

  useEffect(() => {
    // Solo sincronizamos si estamos en la sección de catálogo
    if (location.pathname.startsWith('/catalogo')) {
      const modelInUrl = getModelFromUrl(location.pathname);
      if (modelInUrl !== filtroModelo) {
        setFiltroModelo(modelInUrl);
      }
    }
  }, [location.pathname, getModelFromUrl, filtroModelo]);

  const handleSetFiltroModelo = useCallback((modelo: string) => {
    if (modelo) navigate(`/catalogo/${encodeURIComponent(modelo)}`);
    else navigate('/catalogo');
  }, [navigate]);

  const [filtroSeccion, setFiltroSeccion] = useState('Todos');
  
  // CAMBIO CLAVE: Aumentamos el tiempo a 250ms para no saturar el hilo principal filtrando más de 4000 items repetidas veces mientras se tipea
  const busquedaDebounced = useDebounce(busqueda, 250);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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

  // Memoizar la función de expansión de términos
  const expandirTerminos = useMemo(() => (terminos: string[]): string[] => {
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

    const expandidos = new Set<string>();

    terminos.forEach(termino => {
      expandidos.add(termino);
      Object.entries(sinonimos).forEach(([clave, valores]) => {
        if (clave.includes(termino) || valores.some(v => v.includes(termino))) {
          valores.forEach(sinonimo => expandidos.add(sinonimo));
        }
      });
    });

    return Array.from(expandidos);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!busquedaDebounced && filtroSeccion === 'Todos' && !filtroModelo) return productos;

    // 1. Filtrado Duro (Sección y Modelo no negocian, deben ser exactos)
    let prefiltrados = productos;
    if (filtroSeccion !== 'Todos' || filtroModelo) {
      prefiltrados = productos.filter((p) => {
        if (!p.precio) return false;
        if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
        if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;
        return true;
      });
    }

    if (!busquedaDebounced) return prefiltrados;

    const busquedaLimpia = limpiarTexto(busquedaDebounced).trim();
    if (!busquedaLimpia) return prefiltrados;

    // 2. Extraer caso de búsqueda estricta ("codigo")
    let isExactMatch = false;
    let textoCortado = busquedaLimpia;
    if (busquedaDebounced.includes('"')) {
      const match = busquedaDebounced.match(/"([^"]+)"/);
      if (match) {
        isExactMatch = true;
        textoCortado = match[1].toLowerCase();
      }
    }

    if (isExactMatch) {
       return prefiltrados.filter(p => 
         p.codigo_referencia?.toLowerCase().includes(textoCortado) || p.nombre.toLowerCase().includes(textoCortado)
       );
    }

    // 3. Configuración del Núcleo Fuse.js (Fuzzy Matcher)
    const fuseConfig = {
      keys: [
        { name: 'codigo_referencia', weight: 0.5 }, // 50% impacto
        { name: 'nombre', weight: 0.3 },            // 30% impacto
        { name: 'textoBusqueda', weight: 0.1 },     // 10% impacto
        { name: 'categoria', weight: 0.1 }          // 10% impacto
      ],
      threshold: 0.35, // Tolerancia a typos (0.35 = 35% de error en letras permitido)
      ignoreLocation: true,
      includeScore: true,  
    };

    const fuse = new Fuse(prefiltrados, fuseConfig);

    // Búsqueda base
    let resultados = fuse.search(busquedaLimpia);

    // Integrar el motor de sinónimos (Si "busquedaLimpia" contenía una palabra clave)
    const terminosOriginales = busquedaLimpia.split(' ');
    const terminosExpandidos = expandirTerminos(terminosOriginales);
    const nuevosTerminos = terminosExpandidos.filter(t => !terminosOriginales.includes(t));

    // Si encontramos "Sinónimos" (ej. puso neumático y el sinónimo es llanta), 
    // buscamos individualmente ese sinónimo y lo adjuntamos a los resultados
    const mIds = new Set(resultados.map(r => r.item.id));
    
    if (nuevosTerminos.length > 0) {
      if (nuevosTerminos.length < 5) { // Precaución de optimización
        for (const nt of nuevosTerminos) {
          const resAdicionales = fuse.search(nt);
          for (const res of resAdicionales) {
            if (!mIds.has(res.item.id)) {
              // Castigamos levemente el score porque es una coincidencia indirecta (menor score es mejor en Fuse, 0 = perfecto)
              if (res.score !== undefined) {
                 res.score = res.score + 0.15; 
              }
              resultados.push(res);
              mIds.add(res.item.id);
            }
          }
        }
      }
    }

    // Ordenar y castigar stock false (en Fuse menor score es MEJOR)
    resultados.sort((a, b) => {
       const scoreA = a.score || 0;
       const scoreB = b.score || 0;
       
       // Penalización si no hay stock (+0.5 al score)
       const finalA = a.item.stock ? scoreA : scoreA + 0.5;
       const finalB = b.item.stock ? scoreB : scoreB + 0.5;

       return finalA - finalB;
    });

    return resultados.map(r => r.item);
  }, [productos, busquedaDebounced, filtroSeccion, filtroModelo, expandirTerminos]);

  const handleProductClick = useCallback((p: Producto) => {
    setSearchParams((prev: URLSearchParams) => { prev.set('prod', p.id); return prev; });
  }, [setSearchParams]);

  const handleCloseModal = useCallback(() => {
    setSearchParams((prev: URLSearchParams) => { prev.delete('prod'); return prev; });
  }, [setSearchParams]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
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
                  setFiltroModelo={handleSetFiltroModelo}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  filtroSeccion={filtroSeccion} 
                  setFiltroSeccion={setFiltroSeccion}
                  onProductClick={handleProductClick} 
                />
              </>
            } />
            <Route path="/catalogo/:modelo" element={
              <>
                <Helmet><title>{filtroModelo ? `Repuestos ${filtroModelo}` : 'Catálogo'} | LV PARTS</title></Helmet>
                <CatalogView 
                  productos={filteredProducts}
                  isFav={(id) => favs.includes(id)} 
                  toggleFav={toggleFav}
                  filtroModelo={filtroModelo} 
                  setFiltroModelo={handleSetFiltroModelo}
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
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <img 
                  src="/Error_404.webp" 
                  alt="Error 404 - Página no encontrada" 
                  className="max-w-xs md:max-w-md w-full mb-6 object-contain"
                />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  ¡Ups! Página no encontrada
                </h1>
                <p className="text-gray-600 mb-6">
                  Lo sentimos, la página que buscas no existe.
                </p>
                <Link 
                  to="/" 
                  className="bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors shadow-md"
                >
                  Volver al Inicio
                </Link>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      
      <ProductDetailModal 
        product={selectedProduct} 
        allProducts={productos}         
        currentList={location.pathname === '/favoritos' ? productosFavoritos : filteredProducts}
        onClose={handleCloseModal} 
        onSelectRelated={handleProductClick}
      />
      <CartDrawer />
      {/* Botón Flotante: Visible en todas las pantallas excepto al abrir un producto (ya tiene su propio botón) */}
      <WhatsAppButton hideWhenModalOpen={!!selectedProduct} /> 
      <ScrollToTopButton />
      <BottomNav />
      <Footer />
    </div>
  );
}