// src/App.tsx
import { useState, useMemo, useEffect, Suspense, lazy, useCallback } from 'react';
// IMPORTANTE: Agregamos BrowserRouter aquí
import { Routes, Route, useSearchParams, BrowserRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './App.css';
import { limpiarTexto } from './utils/helpers';
import { APP_CONFIG } from './config/constants';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView'; 
import { WhatsAppButton } from './components/WhatsAppButton'; 

import { GarageProvider, useGarage } from './context/GarageContext';

const CatalogView = lazy(() => import('./components/CatalogView').then(module => ({ default: module.CatalogView })));
const ContactView = lazy(() => import('./components/ContactView').then(module => ({ default: module.ContactView })));

import { ProductDetailModal } from './components/ProductDetailModal';
import { BottomNav } from './components/BottomNav';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Producto, Motorcycle } from './types'; // Importamos Motorcycle para el tipado correcto
import { useProducts } from './hooks/useProducts';
import { useDebounce } from './hooks/useDebounce';

const PageLoader = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
  </div>
);

// Contenido interno de la App
const AppContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { productos, loading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  
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

  // Lógica de Filtrado Corregida
  const filteredProducts = useMemo(() => {
    if (!busquedaDebounced && filtroSeccion === 'Todos' && !vehicle) return productos;

    const terminos = busquedaDebounced ? limpiarTexto(busquedaDebounced).split(' ').filter(t => t.length > 0) : [];
    
    return productos.filter((p) => {
      if (!p.precio) return false;
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      
      // Filtro por Vehículo
      if (vehicle) {
        if (p.isUniversal) return true;

        if (p.compatibleModels && p.compatibleModels.length > 0) {
           // TypeScript ahora sabe que 'm' es Motorcycle gracias al import en l.22
           const esCompatible = p.compatibleModels.some((m: Motorcycle) => 
             m.model.toLowerCase() === vehicle.model.toLowerCase()
           );
           if (!esCompatible) return false;
        } else {
           // Fallback por nombre si no hay datos de compatibilidad
           if (!p.nombre.toLowerCase().includes(vehicle.model.toLowerCase())) return false;
        }
      }

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

  const filtroModeloString = vehicle ? vehicle.model : '';
  const setFiltroModeloString = (modelo: string) => {
    if (modelo === '') {
      clearGarage();
    } else {
      setVehicle({ make: 'Daytona', model: modelo });
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

// COMPONENTE PRINCIPAL
// Aquí envolvemos todo con GarageProvider Y BrowserRouter
export default function App() {
  return (
    <GarageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </GarageProvider>
  );
}