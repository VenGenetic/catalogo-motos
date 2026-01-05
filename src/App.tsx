import { useState, useMemo, useEffect, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, useSearchParams, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
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
  <div className="flex h-[50vh] w-full items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
  </div>
);

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { productos, loading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
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

  const filteredProducts = useMemo(() => {
    if (!busquedaDebounced && filtroSeccion === 'Todos' && !filtroModelo) return productos;

    const terminos = busquedaDebounced ? limpiarTexto(busquedaDebounced).split(' ').filter(t => t.length > 0) : [];
    
    return productos.filter((p) => {
      if (!p.precio) return false;
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;
      if (terminos.length > 0 && !terminos.every((t) => p.textoBusqueda?.includes(t))) return false;
      return true;
    });
  }, [productos, busquedaDebounced, filtroSeccion, filtroModelo]);

  const handleProductClick = useCallback((p: Producto) => {
    setSelectedProduct(p);
    setSearchParams(prev => { prev.set('prod', p.id); return prev; });
  }, [setSearchParams]);

  const handleCloseModal = useCallback(() => {
    setSelectedProduct(null);
    setSearchParams(prev => { prev.delete('prod'); return prev; });
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
      <WhatsAppButton /> {/* NUEVO: Botón flotante siempre visible */}
      <ScrollToTopButton />
      <BottomNav />
      <Footer />
    </div>
  );
}