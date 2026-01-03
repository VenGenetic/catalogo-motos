import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';

// Estilos y Datos
import './App.css';
import dataOrigen from './data.json'; 

// Utilidades y Configuración
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
import { Producto } from './types';

export default function App() {
  // --- HOOKS DE ROUTER ---
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- ESTADO GLOBAL DE DATOS ---
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  // Estado de Filtros (Se mantienen globales para persistir al navegar entre home/catalogo)
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');

  // --- LÓGICA DE DATOS ---
  const toggleFav = (id: string) => {
    setFavs(prev => {
      const nuevos = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS, JSON.stringify(nuevos));
      return nuevos;
    });
  };

  const productosProcesados = useMemo(() => {
    const raw = (dataOrigen as any).RAW_SCRAPED_DATA || (dataOrigen as any).products || [];
    return (Array.isArray(raw) ? raw : []).map((p: any) => ({
      ...p,
      seccion: detectarSeccion(p),
      textoBusqueda: limpiarTexto(`${p.nombre} ${p.codigo_referencia || ''} ${p.categoria || ''} ${detectarSeccion(p)}`)
    }));
  }, []);

  const productosFiltrados = useMemo(() => {
    const terminos = limpiarTexto(busqueda).split(' ').filter(t => t.length > 0);
    return productosProcesados.filter((p: any) => {
      if (!p.precio) return false;
      if (terminos.length > 0 && !terminos.every((t: string) => p.textoBusqueda.includes(t))) return false;
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;
      return true;
    });
  }, [productosProcesados, busqueda, filtroSeccion, filtroModelo]);

  // --- EFECTO DE DEEP LINKING (URL MAGICA) ---
  // Si la URL tiene ?prod=123, abrimos el modal automáticamente
  useEffect(() => {
    const prodId = searchParams.get('prod');
    if (prodId) {
      const found = productosProcesados.find((p:any) => p.id === prodId);
      if (found) setSelectedProduct(found);
    } else {
      setSelectedProduct(null);
    }
  }, [searchParams, productosProcesados]);

  // Función para abrir producto y actualizar URL
  const handleProductClick = (p: Producto) => {
    setSelectedProduct(p);
    setSearchParams(prev => {
      prev.set('prod', p.id);
      return prev;
    });
  };

  // Función para cerrar modal y limpiar URL
  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSearchParams(prev => {
      prev.delete('prod');
      return prev;
    });
  };

  // Función auxiliar para navegar al catálogo desde Home y buscar
  const handleSearchFromHome = (term: string) => {
    setBusqueda(term);
    navigate('/catalogo');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <main className="fade-in flex-1">
        <Routes>
          {/* RUTA: INICIO */}
          <Route path="/" element={
            <div>
              <HeroSection />
              <div className="px-4 py-8 max-w-7xl mx-auto">
                <h2 className="text-xl font-bold mb-4 text-slate-900">Destacados</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                  {productosProcesados.slice(0, 4).map((p: any) => (
                    <div 
                      key={p.id} 
                      className="border border-gray-100 rounded-lg p-3 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow group" 
                      onClick={() => handleSearchFromHome(p.nombre)}
                    >
                      <div className="overflow-hidden rounded-md mb-2 bg-gray-100 relative">
                          <img 
                            src={optimizarImg(p.imagen)} 
                            className="w-full h-32 object-cover object-top scale-[1.15] origin-top group-hover:scale-[1.2] transition-transform duration-300" 
                            style={{ clipPath: 'inset(0 0 25% 0)' }}
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
          
          {/* RUTA: CATÁLOGO */}
          <Route path="/catalogo" element={
            <CatalogView 
              productos={productosFiltrados} 
              isFav={(id: string) => favs.includes(id)} 
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
          
          {/* RUTA: CONTACTO */}
          <Route path="/contacto" element={<ContactView />} />
        </Routes>
      </main>

      {/* --- MODALES GLOBALES --- */}
      {/* El modal se renderiza siempre que haya un producto seleccionado (vía estado o URL) */}
      <ProductDetailModal 
        product={selectedProduct} 
        onClose={handleCloseModal} 
      />

      <CartDrawer />
      <ScrollToTopButton />
      <BottomNav />
      <Footer />
    </div>
  );
}