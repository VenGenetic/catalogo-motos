import { useState, useMemo, useEffect, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, useSearchParams, Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { productos, loading } = useProducts();
  
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
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');
  
  // CAMBIO CLAVE: Reducimos el tiempo de espera a 50ms para que se sienta INSTANTÁNEO
  const busquedaDebounced = useDebounce(busqueda, 50);

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

    const calcularRelevancia = (producto: Producto, terminos: string[]): number => {
      if (!producto.textoBusqueda) return 0;

      const textoBusqueda = producto.textoBusqueda.toLowerCase();
      const nombre = producto.nombre.toLowerCase();
      const codigo = producto.codigo_referencia?.toLowerCase() || '';
      let puntuacion = 0;

      const terminosExpandidos = expandirTerminos(terminos);

      if (busquedaDebounced.includes('"')) {
        const match = busquedaDebounced.match(/"([^"]+)"/);
        if (match && codigo.includes(match[1].toLowerCase())) {
          return 1000;
        }
      }

      for (const termino of [...terminos, ...terminosExpandidos]) {
        const terminoLower = termino.toLowerCase();

        if (codigo.includes(terminoLower)) puntuacion += 50;
        if (nombre.startsWith(terminoLower)) puntuacion += 30;
        if (nombre.includes(terminoLower)) puntuacion += 20;
        if (textoBusqueda.includes(terminoLower)) puntuacion += 10;

        const posicion = textoBusqueda.indexOf(terminoLower);
        if (posicion >= 0) {
          puntuacion += Math.max(0, 10 - Math.floor(posicion / 10));
        }
      }

      if (producto.stock === false) {
        puntuacion *= 0.7;
      }

      return puntuacion;
    };

    const terminos = busquedaDebounced ? limpiarTexto(busquedaDebounced).split(' ').filter(t => t.length > 0) : [];

    const productosConPuntuacion = productos
      .filter((p) => {
        if (!p.precio) return false;
        if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
        if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;

        if (terminos.length > 0) {
          const puntuacion = calcularRelevancia(p, terminos);
          return puntuacion > 3;
        }

        return true;
      })
      .map((p) => ({
        ...p,
        relevancia: terminos.length > 0 ? calcularRelevancia(p, terminos) : 0
      }))
      .sort((a, b) => {
        if (terminos.length > 0) {
          return b.relevancia - a.relevancia;
        }
        return 0;
      });

    return productosConPuntuacion;
  }, [productos, busquedaDebounced, filtroSeccion, filtroModelo, expandirTerminos]);

  const handleProductClick = useCallback((p: Producto) => {
    setSearchParams((prev: URLSearchParams) => { prev.set('prod', p.id); return prev; });
  }, [setSearchParams]);

  const handleCloseModal = useCallback(() => {
    setSearchParams((prev: URLSearchParams) => { prev.delete('prod'); return prev; });
  }, [setSearchParams]);

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
      
      <ProductDetailModal 
        product={selectedProduct} 
        allProducts={productos}         
        onClose={handleCloseModal} 
        onSelectRelated={handleProductClick}
      />
      <CartDrawer />
      <WhatsAppButton hideWhenModalOpen={!!selectedProduct || location.pathname !== '/'} /> 
      <ScrollToTopButton />
      <BottomNav />
      <Footer />
    </div>
  );
}