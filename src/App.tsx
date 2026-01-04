import { useState, useMemo, useEffect } from 'react';
import { Heart } from 'lucide-react';
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
  const [view, setView] = useState<'home' | 'catalogo' | 'contacto' | 'favoritos'>('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');

  // Filtrado de productos
  const productosFiltrados = useMemo(() => {
    const lista = view === 'favoritos' ? productos.filter(p => favs.includes(p.id)) : productos;
    const terminos = limpiarTexto(busqueda).split(' ').filter(t => t.length > 0);
    return lista.filter((p: any) => {
      if (!p.precio) return false;
      if (terminos.length > 0 && !terminos.every((t) => p.textoBusqueda?.includes(t))) return false;
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;
      return true;
    });
  }, [productos, busqueda, filtroSeccion, filtroModelo, view, favs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar onNavigate={setView} />
        <div className="max-w-7xl mx-auto pt-20">
            <SkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      {/* Pasamos setView a la Navbar para cambiar de sección manualmente */}
      <Navbar onNavigate={setView} />
      
      <main className="flex-1">
        {view === 'home' && (
          <div>
            <HeroSection onExplore={() => setView('catalogo')} />
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="rounded-2xl overflow-hidden shadow-md relative h-48 md:h-[400px]">
                <img src="/banner.png" alt="Banner" className="w-full h-full object-cover" />
              </div>
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setView('catalogo')}
                  className="inline-block px-8 py-3 bg-slate-900 text-white font-bold rounded-full"
                >
                  Ver Catálogo Completo
                </button>
              </div>
            </div>
          </div>
        )}

        {(view === 'catalogo' || view === 'favoritos') && (
          <CatalogView 
            productos={productosFiltrados} 
            isFav={(id) => favs.includes(id)} 
            toggleFav={(id) => {
              const nuevos = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
              setFavs(nuevos);
              localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS, JSON.stringify(nuevos));
            }}
            filtroModelo={filtroModelo} setFiltroModelo={setFiltroModelo}
            busqueda={busqueda} setBusqueda={setBusqueda}
            filtroSeccion={filtroSeccion} setFiltroSeccion={setFiltroSeccion}
            onProductClick={setSelectedProduct} 
          />
        )}

        {view === 'contacto' && <ContactView />}
      </main>

      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <CartDrawer />
      <ScrollToTopButton />
      <BottomNav onNavigate={setView} currentView={view} />
      <Footer />
    </div>
  );
}