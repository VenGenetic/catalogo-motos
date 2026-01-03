import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import './App.css';
import { detectarSeccion } from './utils/categories';
import { limpiarTexto, optimizarImg } from './utils/helpers';
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

// Función para asegurar que el precio sea un número válido
const limpiarPrecio = (valor: any): number => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  const limpio = String(valor).replace(/[^0-9.]/g, '');
  const numero = parseFloat(limpio);
  return isNaN(numero) ? 0 : numero;
};

export default function App() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');

  useEffect(() => {
    fetch('/data.json')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar data.json');
        return res.json();
      })
      .then((data: any) => {
        let raw: any[] = [];
        if (Array.isArray(data)) raw = data;
        else if (Array.isArray(data.RAW_SCRAPED_DATA)) raw = data.RAW_SCRAPED_DATA;
        else if (Array.isArray(data.products)) raw = data.products;

        const procesados = raw.map((p) => {
            const seccionCalc = detectarSeccion(p);
            return {
              ...p,
              precio: limpiarPrecio(p.precio),
              seccion: seccionCalc,
              textoBusqueda: limpiarTexto(`${p.nombre} ${p.codigo_referencia || ''} ${p.categoria || ''} ${seccionCalc}`)
            };
        });

        setProductos(procesados);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando productos:", err);
        setLoading(false);
      });
  }, []);

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
      if (terminos.length > 0 && !terminos.every((t) => p.textoBusqueda?.includes(t))) return false;
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;
      return true;
    });
  }, [productos, busqueda, filtroSeccion, filtroModelo]);

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

  const handleSearchFromHome = (term: string) => {
    setBusqueda(term);
    navigate('/catalogo');
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
              <div className="px-4 py-8 max-w-7xl mx-auto">
                <h2 className="text-xl font-bold mb-4 text-slate-900">Destacados</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                  {productos.slice(0, 4).map((p) => (
                    <div 
                      key={p.id} 
                      className="border border-gray-100 rounded-lg p-3 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow group" 
                      onClick={() => handleSearchFromHome(p.nombre)}
                    >
                      {/* VUELTA AL RECORTE DEL 25% */}
                      <div className="overflow-hidden rounded-md mb-2 bg-gray-100 relative h-32">
                          <img 
                            src={optimizarImg(p.imagen)} 
                            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300" 
                            style={{ clipPath: 'inset(0 0 25% 0)' }}
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