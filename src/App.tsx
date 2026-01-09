import { useState, useMemo, useEffect, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, useSearchParams, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import './App.css';
import { limpiarTexto } from './utils/helpers';
import { APP_CONFIG } from './config/constants';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView'; 
import { WhatsAppButton } from './components/WhatsAppButton'; 

// IMPORTANTE: Importamos el proveedor y el hook
import { GarageProvider, useGarage } from './context/GarageContext';

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
  <div className="flex h-[50vh] w-full items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
  </div>
);

// Componente Wrapper interno para poder usar el hook useGarage
const AppContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { productos, loading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  
  // Usamos el Garage Context en lugar de un estado local simple
  const { vehicle, setVehicle, clearGarage } = useGarage();
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');
  const busquedaDebounced = useDebounce(busqueda, 300);

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

  // --- LÓGICA DE FILTRADO AVANZADA ---
  const filteredProducts = useMemo(() => {
    // 1. Si no hay filtros activos, devolver todo
    if (!busquedaDebounced && filtroSeccion === 'Todos' && !vehicle) return productos;

    const terminos = busquedaDebounced ? limpiarTexto(busquedaDebounced).split(' ').filter(t => t.length > 0) : [];
    
    return productos.filter((p) => {
      if (!p.precio) return false;
      
      // 1. Filtro por Sección (Motor, Chasis, etc.)
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      
      // 2. Filtro por Moto (COMPATIBILIDAD)
      if (vehicle) {
        // Si es universal, pasa siempre
        if (p.isUniversal) return true;

        // Si tiene lista de modelos compatibles, verificamos
        if (p.compatibleModels && p.compatibleModels.length > 0) {
           const esCompatible = p.compatibleModels.some(m => 
             m.model.toLowerCase() === vehicle.model.toLowerCase()
           );
           if (!esCompatible) return false;
        } else {
           // FALLBACK: Si tus datos aún no tienen "compatibleModels", usamos la búsqueda por nombre antigua
           // para que la app no se rompa mientras actualizas el JSON.
           if (!p.nombre.toLowerCase().includes(vehicle.model.toLowerCase())) return false;
        }
      }

      // 3. Búsqueda por Texto
      if (terminos.length > 0 && !terminos.every((t) => p.textoBusqueda?.includes(t))) return false;
      
      return true;
    });
  }, [productos, busquedaDebounced, filtroSeccion, vehicle]);

  const handleProductClick = useCallback((p: Producto) => {
    setSelectedProduct(p);
    setSearchParams(prev => { prev.set('prod', p.id); return prev; });
  }, [setSearchParams]);

  const handleCloseModal = useCallback(() => {
    setSelectedProduct(null);
    setSearchParams(prev => { prev.delete('prod'); return prev; });
  }, [setSearchParams]);

  // Adaptador para el CatalogView antiguo que espera strings
  const filtroModeloString = vehicle ? vehicle.model : '';
  const setFiltroModeloString = (modelo: string) => {
    if (modelo === '') {
      clearGarage();
    } else {
      setVehicle({ make: 'Daytona', model: modelo }); // Asumimos Daytona por defecto en tu selector actual
    }
  };

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
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-500 font-medium animate-pulse">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
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
                  // Pasamos los adaptadores del contexto
                  filtroModelo={filtroModeloString} 
                  setFiltroModelo={setFiltroModeloString}
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
                <CatalogView 
                    productos={productosFavoritos}
                    isFav={(id) => favs.includes(id)} 
                    toggleFav={toggleFav}
                    filtroModelo={filtroModeloString} 
                    setFiltroModelo={setFiltroModeloString}
                    busqueda={busqueda} 
                    setBusqueda={setBusqueda}
                    filtroSeccion={filtroSeccion} 
                    setFiltroSeccion={setFiltroSeccion}
                    onProductClick={handleProductClick} 
                />
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
      <WhatsAppButton />
      <ScrollToTopButton />
      <BottomNav />
      <Footer />
    </div>
  );
};

// Componente Principal que envuelve todo con el Contexto
export default function App() {
  return (
    <GarageProvider>
      <AppContent />
    </GarageProvider>
  );
}