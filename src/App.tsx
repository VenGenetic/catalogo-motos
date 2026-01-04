import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useSearchParams, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import './App.css';
import { limpiarTexto } from './utils/helpers';
import { APP_CONFIG } from './config/constants';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogView } from './components/CatalogView';
import { ContactView } from './components/ContactView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BottomNav } from './components/BottomNav';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Producto } from './types';

// IMPORTAMOS LOS NUEVOS HOOKS
import { useProducts } from './hooks/useProducts';
import { useDebounce } from './hooks/useDebounce';

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 1. Lógica de datos extraída al Hook
  const { productos, loading } = useProducts();
  
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  // Estado para filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');

  // 2. Aplicamos Debounce (espera 300ms antes de filtrar)
  const busquedaDebounced = useDebounce(busqueda, 300);

  const toggleFav = (id: string) => {
    setFavs(prev => {
      const nuevos = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS, JSON.stringify(nuevos));
      return nuevos;
    });
  };

  const productosFavoritos = useMemo(() => {
    return productos.filter(p => favs.includes(p.id));
  }, [productos, favs]);

  // Función de filtrado centralizada
  const filtrarLista = (lista: Producto[]) => {
    // Usamos 'busquedaDebounced' para el filtro real (rendimiento)
    const terminos = limpiarTexto(busquedaDebounced).split(' ').filter(t => t.length > 0);
    
    return lista.filter((p) => {
      if (!p.precio) return false;
      if (terminos.length > 0 && !terminos.every((t) => p.textoBusqueda?.includes(t))) return false;
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;
      return true;
    });
  };

  // 3. Memorizamos las listas resultantes
  const filteredProducts = useMemo(() => {
    return filtrarLista(productos);
  }, [productos, busquedaDebounced, filtroSeccion, filtroModelo]);

  const filteredFavs = useMemo(() => {
    return filtrarLista(productosFavoritos);
  }, [productosFavoritos, busquedaDebounced, filtroSeccion, filtroModelo]);

  // Manejo de URL para modales
  useEffect(() => {
    if (!loading && productos.length > 0) {
      const prodId = searchParams.get('prod');
      if (prodId) {
        const found = productos.find((p) => p.id === prodId);
        if (found) setSelectedProduct(found);
      } else setSelectedProduct(null);
    }
  }, [searchParams, productos, loading]);

  const handleProductClick = (p: Producto) => {
    setSelectedProduct(p);
    setSearchParams(prev => { prev.set('prod', p.id); return prev; });
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSearchParams(prev => { prev.delete('prod'); return prev; });
  };

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
        <Routes>
          <Route path="/" element={
            <div>
              <HeroSection />
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="rounded-2xl overflow-hidden shadow-md relative h-48 md:h-[400px]">
                  <img
                    src="/banner.png"
                    alt="Banner Promocional"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="mt-6 text-center">
                  <Link 
                    to="/catalogo" 
                    className="inline-block px-8 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-red-600 transition-colors shadow-lg active:scale-95"
                  >
                    Ver Todos los Repuestos
                  </Link>
                </div>
              </div>
            </div>
          } />
          
          <Route path="/catalogo" element={
            <CatalogView 
              productos={filteredProducts}
              isFav={(id) => favs.includes(id)} 
              toggleFav={toggleFav}
              filtroModelo={filtroModelo} 
              setFiltroModelo={setFiltroModelo}
              busqueda={busqueda} // Input visual (inmediato)
              setBusqueda={setBusqueda}
              filtroSeccion={filtroSeccion} 
              setFiltroSeccion={setFiltroSeccion}
              onProductClick={handleProductClick} 
            />
          } />

          <Route path="/favoritos" element={
            favs.length > 0 ? (
              <div className="animate-fade-in">
                <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Heart className="text-red-600 fill-current" /> Mis Favoritos
                  </h2>
                </div>
                <CatalogView 
                  productos={filteredFavs}
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
                <p className="text-gray-500 mb-6 max-w-xs mx-auto">Marca los repuestos que te interesen con el corazón para encontrarlos aquí.</p>
                <Link to="/catalogo" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                  Explorar Catálogo
                </Link>
              </div>
            )
          } />
          
          <Route path="/contacto" element={<ContactView />} />
        </Routes>
      </main>
      <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} />
      <CartDrawer />
      <ScrollToTopButton />
      <BottomNav />
      <Footer />
    </div>
  );
}