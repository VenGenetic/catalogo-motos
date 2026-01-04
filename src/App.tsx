import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './App.css';
import { APP_CONFIG } from './config/constants';
import { limpiarTexto } from './utils/helpers';

// Hooks y Componentes
import { useProducts } from './hooks/useProducts';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogView } from './components/CatalogView';
import { ContactView } from './components/ContactView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BottomNav } from './components/BottomNav';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';

export default function App() {
  const { productos, loading } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estado para el modal de producto
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Sincronizar URL con Modal
  useEffect(() => {
    if (!loading && productos.length > 0) {
      const prodId = searchParams.get('prod');
      if (prodId) {
        const found = productos.find((p) => p.id === prodId);
        if (found) setSelectedProduct(found);
      } else {
        setSelectedProduct(null);
      }
    }
  }, [searchParams, productos, loading]);

  // Función puente para que tus componentes viejos usen el nuevo Router
  const handleNavigate = (view: 'home' | 'catalogo' | 'contacto' | 'favoritos') => {
    if (view === 'home') navigate('/');
    else navigate(`/${view}`);
    window.scrollTo(0, 0);
  };

  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');

  // Lógica de Favoritos
  const toggleFav = (id: string) => {
    const nuevos = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
    setFavs(nuevos);
    localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS, JSON.stringify(nuevos));
  };

  // Filtrado
  const productosFiltrados = useMemo(() => {
    const isFavView = location.pathname === '/favoritos';
    const lista = isFavView ? productos.filter(p => favs.includes(p.id)) : productos;
    const terminos = limpiarTexto(busqueda).split(' ').filter(t => t.length > 0);
    
    return lista.filter((p: any) => {
      if (!p.precio) return false;
      if (terminos.length > 0 && !terminos.every((t) => p.textoBusqueda?.includes(t))) return false;
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;
      return true;
    });
  }, [productos, busqueda, filtroSeccion, filtroModelo, location.pathname, favs]);

  // Manejadores de Producto
  const handleProductClick = (p: any) => {
    setSearchParams({ prod: p.id });
  };

  const handleCloseModal = () => {
    setSearchParams({}); // Limpia la URL al cerrar
  };

  // Determinar vista actual para el BottomNav
  const currentView = location.pathname === '/' ? 'home' : location.pathname.substring(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar onNavigate={handleNavigate} />
        <div className="max-w-7xl mx-auto pt-20"><SkeletonLoader /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      <Navbar onNavigate={handleNavigate} />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <div>
              <HeroSection onExplore={() => handleNavigate('catalogo')} />
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="rounded-2xl overflow-hidden shadow-md relative h-48 md:h-[400px]">
                  <img src="/banner.png" alt="Banner" className="w-full h-full object-cover" />
                </div>
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => handleNavigate('catalogo')}
                    className="inline-block px-8 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-red-600 transition-colors"
                  >
                    Ver Catálogo Completo
                  </button>
                </div>
              </div>
            </div>
          } />

          <Route path="/catalogo" element={
            <CatalogView 
              productos={productosFiltrados} 
              isFav={(id) => favs.includes(id)} 
              toggleFav={toggleFav}
              filtroModelo={filtroModelo} setFiltroModelo={setFiltroModelo}
              busqueda={busqueda} setBusqueda={setBusqueda}
              filtroSeccion={filtroSeccion} setFiltroSeccion={setFiltroSeccion}
              onProductClick={handleProductClick} 
            />
          } />

          <Route path="/favoritos" element={
            <CatalogView 
              productos={productosFiltrados} 
              isFav={(id) => favs.includes(id)} 
              toggleFav={toggleFav}
              filtroModelo={filtroModelo} setFiltroModelo={setFiltroModelo}
              busqueda={busqueda} setBusqueda={setBusqueda}
              filtroSeccion={filtroSeccion} setFiltroSeccion={setFiltroSeccion}
              onProductClick={handleProductClick} 
            />
          } />

          <Route path="/contacto" element={<ContactView />} />
        </Routes>
      </main>

      <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} />
      <CartDrawer />
      <ScrollToTopButton />
      <BottomNav onNavigate={handleNavigate} currentView={currentView} />
      <Footer />
    </div>
  );
}