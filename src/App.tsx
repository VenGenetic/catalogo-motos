import { useState, useMemo, useEffect, useRef, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, useSearchParams, Link, useLocation, useNavigate, matchPath } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import './App.css';
import { limpiarTexto } from './utils/helpers';
import { trackPageView, trackViewContent } from './utils/tracking';
import { Navbar } from './components/Navbar';
import { TopBanner } from './components/TopBanner';
import { HomeView } from './components/HomeView';
import { WhatsAppButton } from './components/WhatsAppButton';

// Carga Diferida (Lazy Loading)
const CatalogView = lazy(() => import('./components/CatalogView').then(module => ({ default: module.CatalogView })));
const ContactView = lazy(() => import('./components/ContactView'));
// Diferidos: solo se necesitan tras una interacción del usuario (abrir producto / carrito)
const ProductDetailModal = lazy(() => import('./components/ProductDetailModal').then(module => ({ default: module.ProductDetailModal })));
const CartDrawer = lazy(() => import('./components/CartDrawer').then(module => ({ default: module.CartDrawer })));

import { BottomNav } from './components/BottomNav';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { Footer } from './components/Footer';
import { Producto } from './types';
import { useProducts } from './hooks/useProducts';
import { useDebounce } from './hooks/useDebounce';
import { useCart } from './context/CartContext';

const PageLoader = () => (
  <div className="flex h-[60vh] w-full items-center justify-center bg-ui-canvas">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange/20 border-t-brand-orange"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-orange/60 animate-spin animation-delay-300"></div>
      </div>
      <p className="font-medium text-ui-copy animate-pulse">Cargando catálogo...</p>
    </div>
  </div>
);

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { productos, loading } = useProducts();
  const location = useLocation();
  const { isOpen: isCartOpen } = useCart();

  // Derivamos el producto seleccionado de la URL
  const prodId = searchParams.get('prod');
  const selectedProduct = useMemo(() =>
    prodId ? productos.find(p => p.id === prodId) || null : null
    , [productos, prodId]);

  // Píxel de Meta: PageView en cada cambio de ruta del SPA.
  // El primer PageView lo dispara initMetaPixel(), por eso se omite el montaje inicial.
  const isFirstRoute = useRef(true);
  useEffect(() => {
    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }
    trackPageView();
  }, [location.pathname]);

  // Píxel de Meta: ViewContent al abrir la ficha de un producto.
  useEffect(() => {
    if (selectedProduct) trackViewContent(selectedProduct);
  }, [selectedProduct]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  // Lógica de URL para el modelo
  const getModelFromUrl = useCallback((pathname: string) => {
    const match = matchPath({ path: "/catalogo/:modelo", end: true }, pathname);
    return match?.params?.modelo ? decodeURIComponent(match.params.modelo) : '';
  }, []);

  const [filtroModelo, setFiltroModelo] = useState(() => getModelFromUrl(location.pathname));

  useEffect(() => {
    if (location.pathname.startsWith('/catalogo')) {
      const modelInUrl = getModelFromUrl(location.pathname);
      if (modelInUrl !== filtroModelo) {
        setFiltroModelo(modelInUrl);
      }
    } else {
      setFiltroModelo('');
    }
  }, [location.pathname, getModelFromUrl, filtroModelo]);

  const handleSetFiltroModelo = useCallback((modelo: string) => {
    if (modelo) navigate(`/catalogo/${encodeURIComponent(modelo)}`);
    else navigate('/catalogo');
  }, [navigate]);

  // Estado local para la búsqueda principal
  const [busqueda, setBusqueda] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q !== null) {
      return q;
    }

    try {
      const saved = localStorage.getItem('last_catalog_query');
      const savedTime = localStorage.getItem('last_catalog_query_time');
      if (saved && savedTime) {
        const ageMs = Date.now() - parseInt(savedTime, 10);
        if (ageMs < 24 * 60 * 60 * 1000) {
          return saved;
        }
      }
    } catch (e) {
      console.error('Error al leer búsqueda de localStorage', e);
    }

    return '';
  });

  // Guardar en localStorage cuando cambie la búsqueda
  useEffect(() => {
    if (busqueda.trim().length > 0) {
      localStorage.setItem('last_catalog_query', busqueda);
      localStorage.setItem('last_catalog_query_time', Date.now().toString());
    } else {
      localStorage.removeItem('last_catalog_query');
      localStorage.removeItem('last_catalog_query_time');
    }
  }, [busqueda]);

  // Sincronizar estado local de búsqueda hacia la URL de forma dinámica
  useEffect(() => {
    if (location.pathname.startsWith('/catalogo')) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (busqueda.trim()) {
          newParams.set('q', busqueda);
        } else {
          newParams.delete('q');
        }
        return newParams;
      }, { replace: true });
    }
  }, [busqueda, setSearchParams, location.pathname]);

  // Sincronizar desde la URL hacia el estado local (ej. si el usuario usa navegación Atrás/Adelante)
  useEffect(() => {
    if (location.pathname.startsWith('/catalogo')) {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      if (q !== busqueda) {
        setBusqueda(q);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.pathname]);

  const [filtroSeccion, setFiltroSeccion] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('seccion') || 'Todos';
  });

  // Leer la sección desde la URL cuando se llega desde un enlace externo (ej. categorías del home)
  useEffect(() => {
    if (location.pathname.startsWith('/catalogo')) {
      const params = new URLSearchParams(location.search);
      const seccion = params.get('seccion');
      if (seccion && seccion !== filtroSeccion) {
        setFiltroSeccion(seccion);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.pathname]);

  // Debounce de la búsqueda
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



  // Memoizar la función de expansión de términos
  const expandirTerminos = useMemo(() => (terminos: string[]): string[] => {
    const sinonimos: Record<string, string[]> = {
      'freno': ['frenos', 'frenado', 'pastilla', 'pastillas', 'disco', 'tambor'],
      'filtro': ['filtro', 'filtrar', 'filtrado'],
      'aceite': ['aceite', 'lubricante', 'motor oil'],
      'cadena': ['cadena', 'transmisión', 'piñón'],
      'amortiguador': ['amortiguadores', 'suspensión', 'monoshock'],
      'llanta': ['llantas', 'neumático', 'neumáticos', 'rueda', 'ruedas'],
      'faro': ['faros', 'luz', 'luces', 'farola'],
      'escape': ['escape', 'silenciador', 'tubo', 'caño'],
      'motor': ['motor', 'cilindro', 'cilindros', 'piston', 'pistones'],
      'velocimetro': ['velocímetro', 'velocimetros', 'instrumentos', 'panel', 'tablero', 'tacometro', 'tacómetro'],
      'carburador': ['carburador', 'carburadores', 'inyección', 'inyector'],
      'arranque': ['arranque', 'starter', 'partida'],
      'electrico': ['eléctrico', 'eléctrica', 'eléctricos', 'eléctricas', 'electricidad'],
      'telescopica': ['telescopicas', 'telescópica', 'telescópicas', 'barra', 'barras', 'suspensión delantera', 'telescopio', 'amortiguadores delanteros'],
      'monoshock': ['monoshock', 'monoshocks', 'amortiguador trasero', 'suspensión trasera', 'amortiguador', 'suspensión'],
      'instalacion electrica': ['arnes', 'cableado', 'instalacion electrica'],
      'mesa': ['mesa', 'mesas', 'araña', 'arañas', 'castillo'],
      'traccion': ['arrastre'],
      'bujia': ['bujia', 'bujias', 'bujías', 'bujías'],
      'placa': ['placa', 'placas', 'Plastico', 'plasticos'],
      'del': ['delantero', 'delantera', 'delanteros', 'delanteras'],
      'post': ['posterior', 'trasero', 'posteriores', 'traseros'],
      'der': ['derecha', 'derecho', 'derechos', 'derechas'],
      'izq': ['izquierda', 'izquierdo', 'izquierdos', 'izquierdas'],
      'protec': ['protector', 'protectores'],
    };

    const expandidos = new Set<string>();

    terminos.forEach(termino => {
      expandidos.add(termino);
      Object.entries(sinonimos).forEach(([clave, valores]) => {
        if (clave.includes(termino) || valores.some(v => v.includes(termino))) {
          expandidos.add(clave); // Añadimos la clave original para búsquedas bidireccionales
          valores.forEach(sinonimo => expandidos.add(sinonimo));
        }
      });
    });

    return Array.from(expandidos);
  }, []);

  // Función Custom ultra rápida de Fuzzy Matching para tolerar "dedos gordos" (1 error tipográfico)
  const isFuzzyMatch = useCallback((text: string, term: string): boolean => {
    if (text.includes(term)) return true;
    if (term.length <= 3) return false;
    const words = text.split(/[\s-]+/);
    for (const w of words) {
      if (Math.abs(w.length - term.length) <= 1) {
        let mismatches = 0;
        let i = 0, j = 0;
        while (i < term.length && j < w.length) {
          if (term[i] !== w[j]) {
            mismatches++;
            if (mismatches > 1) break;
            if (term[i + 1] === w[j]) i++;
            else if (term[i] === w[j + 1]) j++;
            else { i++; j++; }
          } else {
            i++; j++;
          }
        }
        mismatches += (term.length - i) + (w.length - j);
        if (mismatches <= 1) return true;
      }
    }
    return false;
  }, []);

  const filteredProducts = useMemo(() => {

    const calcularRelevancia = (
      producto: Producto,
      terminos: string[],
      expansionesPorTermino: Map<string, string[]>
    ): number => {
      const textoBusqueda = (producto.textoBusqueda || '').toLowerCase();
      const nombre = producto.nombre.toLowerCase();
      const codigo = producto.codigo_referencia?.toLowerCase() || '';
      const categoria = (producto.categoria || '').toLowerCase();
      let puntuacion = 0;

      // Buscar si la búsqueda contiene comillas dobles (SKU exacto)
      const exactSkuMatches: string[] = [];
      if (busquedaDebounced.includes('"')) {
        const match = busquedaDebounced.match(/"([^"]+)"/);
        if (match && match[1]) {
          exactSkuMatches.push(match[1].toLowerCase());
        }
      }

      for (const exactSku of exactSkuMatches) {
        if (codigo.includes(exactSku)) {
          return 1000;
        }
      }

      let terminosEncontrados = 0;

      for (const term of terminos) {
        const termLower = term.toLowerCase();
        const expansions = expansionesPorTermino.get(termLower) || [termLower];
        let maxTermScore = 0;

        for (const exp of expansions) {
          const expLower = exp.toLowerCase();
          const isOriginal = expLower === termLower;
          let termScore = 0;
          let matchedInExp = false;

          if (codigo === expLower) { termScore += 200; matchedInExp = true; }
          else if (codigo.includes(expLower)) { termScore += 100; matchedInExp = true; }
          else if (isFuzzyMatch(codigo, expLower)) { termScore += 80; matchedInExp = true; }

          // Boost para coincidencia exacta de palabra completa en el nombre
          const wordRegex = new RegExp(`\\b${expLower}\\b`, 'i');
          
          if (nombre === expLower) { termScore += 150; matchedInExp = true; }
          else if (wordRegex.test(nombre)) {
            // Si es la primera palabra, vale un poco más
            if (nombre.startsWith(expLower)) { termScore += 90; matchedInExp = true; }
            else { termScore += 70; matchedInExp = true; }
          }
          else if (nombre.startsWith(expLower)) { termScore += 50; matchedInExp = true; }
          else if (nombre.includes(expLower)) { termScore += 30; matchedInExp = true; }
          else if (isFuzzyMatch(nombre, expLower)) { termScore += 20; matchedInExp = true; }

          if (categoria.includes(expLower)) { termScore += 15; matchedInExp = true; }

          if (textoBusqueda.includes(expLower)) { termScore += 5; matchedInExp = true; }

          // Si la coincidencia provino de la palabra original exacta que escribió el usuario, 
          // le damos un bono gigante para que gane contra sus propios sinónimos
          if (matchedInExp && isOriginal) {
            termScore += 50;
          }

          if (matchedInExp && termScore > maxTermScore) {
            maxTermScore = termScore;
          }
        }

        if (maxTermScore > 0) {
          puntuacion += maxTermScore;
          terminosEncontrados++;
        }
      }

      // Requisito dinámico: Si el usuario busca 2 palabras, idealmente las 2 (o sus sinónimos) deben existir.
      // Castigamos brutalmente los productos que no tienen todas las palabras clave originales.
      if (terminosEncontrados < terminos.length) {
        puntuacion = puntuacion / 4;
      }

      if (producto.stock === false) {
        puntuacion *= 0.5;
      }

      return puntuacion;
    };

    // Extraemos todos los términos de la búsqueda no vacía
    const terminos = limpiarTexto(busquedaDebounced)
      .split(' ')
      .filter(t => t.length > 0);

    // Precalculamos la expansión de sinónimos UNA sola vez por búsqueda
    // (antes se recalculaba por cada uno de los ~6000 productos).
    const expansionesPorTermino = new Map<string, string[]>();
    terminos.forEach(term => {
      const termLower = term.toLowerCase();
      expansionesPorTermino.set(termLower, expandirTerminos([termLower]));
    });

    let resultado = productos
      .filter((p) => {
        if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
        if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;
        return true;
      })
      .map((p) => ({
        ...p,
        relevancia: terminos.length > 0 ? calcularRelevancia(p, terminos, expansionesPorTermino) : 0
      }));

    if (terminos.length > 0) {
      resultado = resultado
        .filter((p) => p.relevancia > 2) // Filtro mínimo
        .sort((a, b) => b.relevancia - a.relevancia);
    }

    return resultado;
  }, [productos, busquedaDebounced, filtroSeccion, filtroModelo, expandirTerminos, isFuzzyMatch]);

  const handleProductClick = useCallback((p: Producto) => {
    setSearchParams((prev: URLSearchParams) => { prev.set('prod', p.id); return prev; });
  }, [setSearchParams]);

  const handleCloseModal = useCallback(() => {
    setSearchParams((prev: URLSearchParams) => { prev.delete('prod'); return prev; });
  }, [setSearchParams]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-ui-canvas">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-orange/20 border-t-brand-orange"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-brand-orange/60 animate-spin animation-delay-300"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-ui-ink animate-pulse">Cargando catálogo</p>
            <p className="mt-1 text-sm text-ui-copy">Preparando repuestos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ui-canvas font-sans text-ui-ink">
      {!isOnline && (
        <div className="md:hidden bg-red-600 text-white text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
          <WifiOff size={16} />
          Sin conexión a internet
        </div>
      )}

      <TopBanner />
      <Navbar />
      <main className="fade-in flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={
              <>
                <title>LV PARTS | Repuestos de Moto Ecuador</title>
                <HomeView productos={productos} />
              </>
            } />

            <Route path="/catalogo" element={
              <>
                <title>Catálogo | LV PARTS</title>
                <CatalogView
                  productos={filteredProducts}
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
                <title>{filtroModelo ? `Repuestos ${filtroModelo}` : 'Catálogo'} | LV PARTS</title>
                <CatalogView
                  productos={filteredProducts}
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

            <Route path="/contacto" element={<><title>Contacto | LV PARTS</title><ContactView /></>} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <img
                  src="/Error_404.webp"
                  alt="Error 404 - Página no encontrada"
                  className="max-w-xs md:max-w-md w-full mb-6 object-contain"
                />
                <h1 className="mb-2 text-2xl font-bold text-ui-ink md:text-3xl">
                  ¡Ups! Página no encontrada
                </h1>
                <p className="mb-6 text-ui-copy">
                  Lo sentimos, la página que buscas no existe.
                </p>
                <Link
                  to="/"
                  className="rounded-xl bg-brand-orange-action px-8 py-3 font-semibold text-white shadow-md transition-colors hover:bg-brand-orange"
                >
                  Volver al Inicio
                </Link>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>

      {selectedProduct && (
        <Suspense fallback={null}>
          <ProductDetailModal
            product={selectedProduct}
            allProducts={productos}
            currentList={filteredProducts}
            onClose={handleCloseModal}
            onSelectRelated={handleProductClick}
          />
        </Suspense>
      )}
      {isCartOpen && (
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
      )}
      {/* Botón Flotante: Visible en todas las pantallas excepto al abrir un producto (ya tiene su propio botón) */}
      <WhatsAppButton hideWhenModalOpen={!!selectedProduct || isCartOpen} />
      <ScrollToTopButton />
      <BottomNav />
      <Footer />
    </div>
  );
}
