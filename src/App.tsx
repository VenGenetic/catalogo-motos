import { useState, useMemo, useEffect } from 'react';
import './App.css';
import dataOrigen from './data.json'; 

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

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');

  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);

  const toggleFav = (id: string) => {
    setFavs(prev => {
      const nuevos = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS, JSON.stringify(nuevos));
      return nuevos;
    });
  };

  // Procesamiento de datos
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

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Navbar ya no necesita props del carrito */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="fade-in min-h-[calc(100vh-64px)]">
        {activeTab === 'home' && (
          <div>
            <HeroSection setActiveTab={setActiveTab} />
            <div className="px-4 py-8 max-w-7xl mx-auto">
              <h2 className="text-xl font-bold mb-4 text-slate-900">Destacados</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {productosProcesados.slice(0, 4).map((p: any) => (
                  <div 
                    key={p.id} 
                    className="border border-gray-100 rounded-lg p-3 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow group" 
                    onClick={() => {setActiveTab('catalog'); setBusqueda(p.nombre)}}
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
        )}
        
        {activeTab === 'catalog' && (
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
            onProductClick={setSelectedProduct} 
          />
        )}
        
        {activeTab === 'contact' && <ContactView />}
      </main>

      {/* Modales y Drawers - Ya no necesitan props de control de carrito */}
      <ProductDetailModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      <CartDrawer />

      <ScrollToTopButton />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <Footer />
    </div>
  );
}