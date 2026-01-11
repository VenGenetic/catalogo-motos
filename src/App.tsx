import { useState, useMemo, useEffect, Suspense, lazy, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useProducts } from './hooks/useProducts';
import { useDebounce } from './hooks/useDebounce';
import { useGarage } from './context/GarageContext'; // <--- NUEVO
import { APP_CONFIG } from './config/constants';
import { Producto } from './types';

// Componentes
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SkeletonLoader } from './components/SkeletonLoader';

// Lazy loading de vistas
const HomeView = lazy(() => import('./components/HomeView').then(m => ({ default: m.HomeView })));
const CatalogView = lazy(() => import('./components/CatalogView').then(m => ({ default: m.CatalogView })));

// Loader simple
const PageLoader = () => (
  <div className="pt-24 px-4 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => <SkeletonLoader key={i} />)}
  </div>
);

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { productos, loading } = useProducts();
  const { vehicle, setVehicle } = useGarage(); // <--- Usamos Contexto

  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });

  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');
  const busquedaDebounced = useDebounce(busqueda, 300);

  // Sincronizar Garage con Filtro
  useEffect(() => {
    if (vehicle?.model && !filtroModelo) {
      setFiltroModelo(vehicle.model);
    }
  }, [vehicle]);

  const handleSelectMoto = useCallback((modelo: string) => {
    setFiltroModelo(modelo);
    setVehicle({ make: 'Daytona', model: modelo });
    setBusqueda('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setVehicle]);

  const handleResetMoto = useCallback(() => {
    setFiltroModelo(''); 
    // setVehicle(null); // Descomenta si quieres "olvidar" la moto al volver
    setBusqueda('');
    setFiltroSeccion('Todos');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Lógica de favoritos y productos...
  const toggleFav = useCallback((id: string) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleProductClick = useCallback((p: Producto) => setSelectedProduct(p), []);
  const handleCloseModal = useCallback(() => setSelectedProduct(null), []);

  // Filtrado
  const filteredProducts = useMemo(() => {
    let result = productos;
    if (filtroModelo) {
      const term = filtroModelo.toLowerCase();
      result = result.filter(p => p.textoBusqueda.includes(term));
    }
    if (busquedaDebounced) {
      const term = busquedaDebounced.toLowerCase();
      result = result.filter(p => p.textoBusqueda.includes(term));
    }
    if (filtroSeccion !== 'Todos') {
      result = result.filter(p => p.seccion === filtroSeccion);
    }
    return result;
  }, [productos, filtroModelo, busquedaDebounced, filtroSeccion]);

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      <Navbar />
      <main className="fade-in flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<><Helmet><title>LV PARTS | Repuestos</title></Helmet><HomeView productos={productos} /></>} />
            <Route path="/catalogo" element={
              <>
                <Helmet><title>Catálogo | LV PARTS</title></Helmet>
                <CatalogView 
                  productos={filteredProducts}
                  allProducts={productos} // <--- Pasamos todo para el conteo
                  isFav={(id) => favs.includes(id)}
                  toggleFav={toggleFav}
                  filtroModelo={filtroModelo}
                  setFiltroModelo={handleSelectMoto} // <--- Nueva función
                  onResetMoto={handleResetMoto}      // <--- Nueva función
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  filtroSeccion={filtroSeccion}
                  setFiltroSeccion={setFiltroSeccion}
                  onProductClick={handleProductClick}
                />
              </>
            } />
            <Route path="*" element={<div className="p-20 text-center font-bold">404 - No encontrado</div>} />
          </Routes>
        </Suspense>
      </main>
      <ProductDetailModal product={selectedProduct} allProducts={productos} onClose={handleCloseModal} onSelectRelated={handleProductClick} />
      <CartDrawer />
      <WhatsAppButton />
      <ScrollToTopButton />
      <BottomNav />
      <Footer />
    </div>
  );
}