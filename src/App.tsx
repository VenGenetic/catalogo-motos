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
import { ProductDetailBoundary, ProductDetailLoader } from './components/ProductDetailBoundary';

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
import { nombreDeModelo, ORDEN_SECCIONES } from './config/constants';
import { useCart } from './context/CartContext';
import { useDespiece } from './utils/cargarDespiece';
import { sistemaDeEnlace } from './utils/sistemas';
import { SelectorMoto } from './components/SelectorMoto';

/** En bodega antes que bajo pedido, y agotado al final; con foto antes que sin foto. */
const rangoDisponible = (p: Producto) => (!p.stock ? 4 : p.origenes?.includes('bajo pedido') ? 2 : 0)
  + (p.imagen && !p.imagen.includes('sin_imagen') ? 0 : 1);

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

  // La búsqueda vive en la dirección (?q=): se puede compartir y "Atrás" la recuerda.
  const [busqueda, setBusqueda] = useState<string>(() => new URLSearchParams(window.location.search).get('q') ?? '');

  // El buscador está en la barra de arriba de todas las páginas: fuera del
  // catálogo, la primera letra lleva al catálogo y ahí se sigue escribiendo.
  const buscar = useCallback((texto: string) => {
    setBusqueda(texto);
    if (!location.pathname.startsWith('/catalogo') && texto.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(texto)}`);
    }
  }, [location.pathname, navigate]);

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

  const [filtroSeccion, setFiltroSeccion] = useState<string>(() => sistemaDeEnlace(new URLSearchParams(window.location.search).get('seccion')));

  // Leer la sección desde la URL cuando se llega desde un enlace (categorías del home, menú, pie).
  // Después se quita de la dirección: los botones de sección solo cambian el estado, y si el
  // parámetro se quedara, al escribir una búsqueda volvería a imponer la sección vieja y un
  // segundo clic al mismo enlace no haría nada.
  // Fuera del catálogo vuelve a "Todos" (como el modelo): si no, al regresar por "Compra por
  // modelo", el buscador o "Ver catálogo" se vería solo la sección elegida antes.
  useEffect(() => {
    if (!location.pathname.startsWith('/catalogo')) {
      setFiltroSeccion('Todos');
    } else {
      const params = new URLSearchParams(location.search);
      const seccion = params.get('seccion');
      if (seccion) {
        // Los enlaces viejos (`Motor e Internos`) llevan al sistema que les corresponde (`Motor`).
        setFiltroSeccion(sistemaDeEnlace(seccion));
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('seccion');
          return newParams;
        }, { replace: true });
      }
    }
  }, [location.search, location.pathname, setSearchParams]);

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
    // Palabras cortas no: "aro" no es "faro" mal escrito.
    if (term.length < 5) return false;
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

  // El despiece se carga aparte (ver utils/cargarDespiece.ts).
  const { despiece, noDisponible } = useDespiece();
  const proyeccion = useMemo(() => productos.map(p => ({ id: p.id, sku: p.codigo_referencia ?? null, name: p.nombre })), [productos]);

  // Las piezas de la moto elegida (null si la dirección no es una moto del despiece).
  const piezasModelo = useMemo(() => {
    if (!filtroModelo || !despiece?.modeloPorId(filtroModelo)) return null;
    return despiece.piezasDeModelo(proyeccion, filtroModelo);
  }, [despiece, proyeccion, filtroModelo]);
  // Mientras llega el despiece no se sabe qué le sirve a la moto: se espera en vez de mostrar todo.
  const cargandoMoto = Boolean(filtroModelo) && !despiece && !noDisponible;
  const hayBusqueda = limpiarTexto(busquedaDebounced).trim().length > 0;

  const { filteredProducts, conteoSistemas, totalSinSistema } = useMemo(() => {

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
          else if (isOriginal && isFuzzyMatch(codigo, expLower)) { termScore += 80; matchedInExp = true; }

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
          else if (isOriginal && isFuzzyMatch(nombre, expLower)) { termScore += 20; matchedInExp = true; }

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

    // 1. La moto.
    let base = productos;
    if (filtroModelo) {
      if (piezasModelo) base = productos.filter(p => piezasModelo.has(p.id));
      else if (cargandoMoto) base = [];
      else {
        // Navegador sin despiece o dirección vieja (/catalogo/Wolf): por el nombre.
        const palabras = limpiarTexto(filtroModelo).split(/[\s-]+/).filter(t => t.length > 1);
        base = productos.filter(p => { const n = limpiarTexto(p.nombre); return palabras.every(t => n.includes(t)); });
      }
    }

    // 2. La búsqueda. Los términos y sus sinónimos se calculan una sola vez
    // por búsqueda (no por cada uno de los ~6.500 productos).
    const terminos = limpiarTexto(busquedaDebounced).split(' ').filter(t => t.length > 0);
    const expansionesPorTermino = new Map<string, string[]>();
    terminos.forEach(term => expansionesPorTermino.set(term.toLowerCase(), expandirTerminos([term.toLowerCase()])));

    let lista: Producto[];
    if (terminos.length > 0) {
      const puntajes = new Map<string, number>();
      for (const p of base) {
        const puntaje = calcularRelevancia(p, terminos, expansionesPorTermino);
        if (puntaje > 2) puntajes.set(p.id, puntaje);
      }
      lista = base.filter(p => puntajes.has(p.id))
        .sort((a, b) => puntajes.get(b.id)! - puntajes.get(a.id)! || rangoDisponible(a) - rangoDisponible(b));
    } else if (piezasModelo) {
      // El despiece de la moto, por sistema. Dentro de cada sistema, primero lo que se puede
      // comprar ya; después, como en el ERP, las piezas de su código en el orden de su lista.
      const orden = (p: Producto) => ORDEN_SECCIONES.indexOf(p.seccion || 'Otros');
      lista = [...base].sort((a, b) => {
        const pa = piezasModelo.get(a.id)!, pb = piezasModelo.get(b.id)!;
        return orden(a) - orden(b)
          || rangoDisponible(a) - rangoDisponible(b)
          || (pa.origen === pb.origen ? 0 : pa.origen === 'propia' ? -1 : 1)
          || (pa.posicion ?? 0) - (pb.posicion ?? 0)
          || (a.codigo_referencia || '').localeCompare(b.codigo_referencia || '');
      });
    } else {
      // Sin moto ni búsqueda: primero lo que hay en bodega y con foto.
      lista = [...base].sort((a, b) => rangoDisponible(a) - rangoDisponible(b));
    }

    // 3. Cuántos hay de cada sistema (para las fichas de sistema).
    const conteo = new Map<string, number>();
    for (const p of lista) conteo.set(p.seccion || 'Otros', (conteo.get(p.seccion || 'Otros') ?? 0) + 1);

    // 4. El sistema.
    const final = filtroSeccion === 'Todos' ? lista : lista.filter(p => (p.seccion || 'Otros') === filtroSeccion);
    return { filteredProducts: final, conteoSistemas: conteo, totalSinSistema: lista.length };
  }, [productos, busquedaDebounced, filtroSeccion, filtroModelo, piezasModelo, cargandoMoto, expandirTerminos, isFuzzyMatch]);

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
      <Navbar busqueda={busqueda} buscar={buscar} productos={productos} filtroModelo={filtroModelo} />
      <main className="fade-in flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={
              <>
                <title>LV PARTS | Repuestos de Moto Ecuador</title>
                <HomeView productos={productos} />
              </>
            } />

            {['/catalogo', '/catalogo/:modelo'].map(ruta => (
              <Route key={ruta} path={ruta} element={
                <>
                  {/* Un solo texto: con varias piezas React 19 no pone el título. */}
                  <title>{`${filtroModelo ? `Repuestos para ${nombreDeModelo(filtroModelo, despiece)}` : 'Catálogo de repuestos'} | LV PARTS`}</title>
                  <CatalogView
                    productos={filteredProducts}
                    conteoSistemas={conteoSistemas}
                    totalSinSistema={totalSinSistema}
                    filtroModelo={filtroModelo}
                    piezasDeMoto={piezasModelo ? piezasModelo.size : null}
                    cargandoMoto={cargandoMoto}
                    agrupar={Boolean(piezasModelo) && !hayBusqueda && filtroSeccion === 'Todos'}
                    despiece={despiece}
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    filtroSeccion={filtroSeccion}
                    setFiltroSeccion={setFiltroSeccion}
                    onProductClick={handleProductClick}
                  />
                </>
              } />
            ))}

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
        <ProductDetailBoundary key={selectedProduct.id} onClose={handleCloseModal}>
          <Suspense fallback={<ProductDetailLoader />}>
            <ProductDetailModal
              product={selectedProduct}
              allProducts={productos}
              currentList={location.pathname.startsWith('/catalogo') ? filteredProducts : undefined}
              onClose={handleCloseModal}
              onSelectRelated={handleProductClick}
              despiece={despiece}
              filtroModelo={filtroModelo}
              piezasModelo={piezasModelo}
            />
          </Suspense>
        </ProductDetailBoundary>
      )}
      {isCartOpen && (
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
      )}
      <SelectorMoto />
      {/* Botón flotante (computadora): no se muestra con un producto o el pedido abiertos */}
      <WhatsAppButton hideWhenModalOpen={!!selectedProduct || isCartOpen} />
      <ScrollToTopButton />
      <BottomNav />
      <Footer />
    </div>
  );
}
