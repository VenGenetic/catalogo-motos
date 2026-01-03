import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import './App.css';

// Utilidades
import { detectarSeccion } from './utils/categories';
import { limpiarTexto, optimizarImg } from './utils/helpers';
import { APP_CONFIG } from './config/constants';

// Componentes
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogView } from './components/CatalogView';
import { ContactView } from './components/ContactView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BottomNav } from './components/BottomNav';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';

// Tipos
import { Producto, DataFuente } from './types';

export default function App() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado de Productos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true); // Estado de carga

  // Estado Global
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');

  // --- 1. CARGA DE DATOS OPTIMIZADA (Fetch desde public) ---
  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then((data: DataFuente) => {
        const raw = data.RAW_SCRAPED_DATA || [];
        // Procesamos los datos UNA sola vez al cargar
        const procesados = raw.map((p) => ({
          ...p,
          seccion: detectarSeccion(p),
          textoBusqueda: limpiarTexto(`${p.nombre} ${p.codigo_referencia || ''} ${p.categoria || ''} ${detectarSeccion(p)}`)
        }));
        setProductos(procesados);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando productos:", err);
        setLoading(false);
      });
  }, []);

  // --- 2. LOGICA DE DATOS ---
  const toggleFav = (id: string) => {
    setFavs(prev => {
      const nuevos = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS, JSON.stringify(nuevos));
      return nuevos;
    });
  };

  const productosFiltrados = useMemo(() => {
    const terminos = limpiarTexto(busqueda).split(' ').filter(t => t.length > 0);
    return productos.filter((p) => {
      if (!p.precio) return false;
      // Filtro por texto (busca en nombre, codigo, categoria)
      if (terminos.length > 0 && !terminos.every((t) => p.textoBusqueda?.includes(t))) return false;
      // Filtro por Sección
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      // Filtro por Modelo (Búsqueda simple en el nombre)
      if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;
      return true;
    });
  }, [productos, busqueda, filtroSeccion, filtroModelo]);

  // Deep Linking
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

  const handleProductClick = (p: Producto) => {
    setSelectedProduct(p);
    setSearchParams(prev => { prev.set('prod', p.id); return prev; });
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSearchParams(prev => { prev.delete('prod'); return prev; });
  };

  const handleSearchFromHome = (term: string) => {
    setBusqueda(term);
    navigate('/catalogo');
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <main className="fade-in flex-1">
        <Routes>
          <Route path="/" element={
            <div>
              <HeroSection />
              <div className="px-4 py-8 max-w-7xl mx-auto">
                <h2 className="text-xl font-bold mb-4 text-slate-900">Destacados</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                  {productos.slice(0, 4).map((p) => (
                    <div 
                      key={p.id} 
                      className="border border-gray-100 rounded-lg p-3 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow group" 
                      onClick={() => handleSearchFromHome(p.nombre)}
                    >
                      <div className="overflow-hidden rounded-md mb-2 bg-gray-100 relative">
                          {/* CORRECCIÓN: Eliminado clipPath agresivo, añadido object-top */}
                          <img 
                            src={optimizarImg(p.imagen)} 
                            className="w-full h-32 object-cover object-top group-hover:scale-110 transition-transform duration-300" 
                            alt={p.nombre}
                          />
                      </div>
                      <h3 className="text-xs font-bold line-clamp-2 mb-1 text-slate-800">{p.nombre}</h3>
                      <span className="text-red-600 font-bold text-sm">${Number(p.precio).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          } />
          
          <Route path="/catalogo" element={
            <CatalogView 
              productos={productosFiltrados} 
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