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
import { PantallaCarga } from './components/PantallaCarga';
import { indexar, prepararBusqueda, puntuar } from './utils/busqueda';

// Carga Diferida (Lazy Loading)
// La vista del catálogo se pide también mientras baja el inventario (ver más abajo):
// así no hay una segunda espera cuando los datos ya llegaron.
const cargarVistaCatalogo = () => import('./components/CatalogView');
const CatalogView = lazy(() => cargarVistaCatalogo().then(module => ({ default: module.CatalogView })));
const ContactView = lazy(() => import('./components/ContactView'));
const PrivacyView = lazy(() => import('./components/PrivacyView'));
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

const PageLoader = () => <PantallaCarga compacta />;

/** Lo que tarda en subir la cortina de la pantalla de carga (igual que `.carga-salida` en index.css). */
const SALIDA_CARGA_MS = 320;

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { productos, loading, error, progreso, reintentar } = useProducts();
  const location = useLocation();
  const { isOpen: isCartOpen } = useCart();

  // La pantalla de carga no desaparece de golpe: su cortina sube encima del catálogo ya
  // dibujado. Con caché (visitas repetidas) ni siquiera aparece.
  const [cargaVisible, setCargaVisible] = useState(loading);
  useEffect(() => {
    if (loading) { setCargaVisible(true); return; }
    const t = setTimeout(() => setCargaVisible(false), SALIDA_CARGA_MS);
    return () => clearTimeout(t);
  }, [loading]);

  // Mientras baja el inventario, se adelanta la vista del catálogo (es la próxima pantalla).
  useEffect(() => {
    if (loading) void cargarVistaCatalogo();
  }, [loading]);

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



  // Los campos del buscador en minúsculas, una vez por catálogo (ver utils/busqueda.ts).
  const indiceBusqueda = useMemo(() => indexar(productos), [productos]);

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

    // 2. La búsqueda. Los términos, sus sinónimos y sus expresiones se preparan una
    // sola vez por búsqueda (no por cada uno de los ~7.000 productos).
    const preparada = prepararBusqueda(busquedaDebounced);

    let lista: Producto[];
    if (preparada.terminos.length > 0) {
      const puntajes = new Map<string, number>();
      for (const p of base) {
        const campos = indiceBusqueda.get(p.id);
        const puntaje = campos ? puntuar(p, campos, preparada) : 0;
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
  }, [productos, indiceBusqueda, busquedaDebounced, filtroSeccion, filtroModelo, piezasModelo, cargandoMoto]);

  const handleProductClick = useCallback((p: Producto) => {
    setSearchParams((prev: URLSearchParams) => { prev.set('prod', p.id); return prev; });
  }, [setSearchParams]);

  const handleCloseModal = useCallback(() => {
    setSearchParams((prev: URLSearchParams) => { prev.delete('prod'); return prev; });
  }, [setSearchParams]);

  // Sin nada que mostrar todavía: la pantalla de carga (o su aviso, si la carga falló).
  if (loading || (error && productos.length === 0)) {
    return (
      <PantallaCarga
        progreso={progreso}
        error={loading ? null : isOnline ? 'Revisa tu conexión e inténtalo otra vez.' : 'Estás sin internet. Conéctate y vuelve a intentarlo.'}
        onReintentar={reintentar}
      />
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
            <Route path="/privacidad" element={<><title>Política de privacidad | LV PARTS</title><PrivacyView /></>} />
            <Route path="*" element={
              <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center animate-rise">
                <img
                  src="/Error_404.webp"
                  alt="Error 404 - Página no encontrada"
                  className="mb-6 w-full max-w-xs object-contain md:max-w-md"
                />
                <h1 className="mb-2 font-anton text-3xl uppercase tracking-wide text-ui-ink md:text-4xl">
                  Esta página no existe
                </h1>
                <p className="mb-6 max-w-sm text-ui-copy">
                  Puede que el enlace esté mal escrito o que el repuesto haya cambiado de lugar.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link to="/" className="press flex min-h-[48px] items-center justify-center rounded-xl bg-brand-orange-action px-8 font-bold text-white shadow-md hover:bg-brand-orange">
                    Volver al inicio
                  </Link>
                  <Link to="/catalogo" className="press flex min-h-[48px] items-center justify-center rounded-xl border-2 border-ui-ink px-8 font-bold text-ui-ink hover:border-brand-orange hover:text-brand-orange-action dark:hover:text-brand-orange">
                    Ver el catálogo
                  </Link>
                </div>
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
      {cargaVisible && <PantallaCarga progreso={progreso} saliendo />}
    </div>
  );
}
