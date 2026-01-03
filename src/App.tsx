import { useState, useMemo, useEffect } from 'react';
import { 
  Home, ShoppingBag, Phone, Menu, X, Search, ChevronRight, 
  Mail, Heart, Bike, Filter, Plus, Minus, MessageCircle, Grid
} from 'lucide-react';

import './App.css';
import dataOrigen from './data.json'; 
import { detectarSeccion } from './utils/categories';

// --- CONFIGURACIÓN ---
const CONFIG = {
  WHATSAPP: "593993279707",
  ITEMS_PAGINA: 20, 
  KEY_FAVS: 'loveDaytonaFavs'
};

const ORDEN_SECCIONES = [
  'Todos', 'Motor e Internos', 'Transmisión', 'Sistema Eléctrico', 'Sistema de Frenos', 
  'Chasis y Suspensión', 'Carrocería y Plásticos', 'Ruedas y Ejes', 
  'Cables y Mandos', 'Filtros y Mantenimiento', 'Otros Repuestos'
];

const MODELOS = [
  "Tekken", "Tekken Evo", "Axxo Tracker", "DK Nativa", "Scrambler", "Scrambler Clasica", 
  "Scrambler Revolution", "Axxo Scrambler", "Scorpion", "Axxo TRX", "TH Mig25", "DK250-D Sport",
  "Bull", "Shark", "Shark II", "Shark III", "Maverick", "Wolf", "Adventure", "Adventure R 250", 
  "Adventure 200", "Hunter", "GP1", "Tundra Veloce", "Thunder Veloce", "Crossfire", "Xtreem", 
  "Thunder F16", "DK Hornet", "IGM Wind", "Z1 V8200", "Tundra Ghost", "Axxo Asfalt", "Axxo F51",
  "Ranger CFZ", "Honda CB190", "Honda CB1", "Force", "DK XTZ", "Axxo TR1", "DK200B", "SHM Armi150",
  "Axxo Viper", "Ranger 150BWSM", "Bultaco Storm", "Z1 Super", "Sukida Joy", "Agility", "Agility X",
  "Boneville", "Axxo Milano", "Bultaco Freedom", "Tanq", "Dynamic", "Dynamic Pro", "SHM Jedi",
  "Feroce", "Predator", "Elvissa", "Viper", "CX7", "Comander", "Crucero", "Spitfire", "Delta", 
  "Montana", "Workforce", "GTR", "Panther", "Cafe Racer", "Eagle", "Speed", "Everest",
  "Wing Evo", "Wing Evo 200", "Wing Evo 2", "Scooter Evo 2 180", "S1", "S1 Adv", "S1 Crossover 180"
];

// --- UTILIDADES ---
const limpiarTexto = (texto: string) => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const optimizarImg = (url: string) => {
  if (!url || url === 'No imagen') return 'https://via.placeholder.com/400x300?text=No+Image';
  if (url.includes('wsrv.nl')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=cover&a=top&q=80&output=webp`;
};

// --- COMPONENTES ---

// 1. Bottom Navigation (Solo visible en Móvil)
const BottomNav = ({ activeTab, setActiveTab, cartCount, openCart }: any) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
      <button 
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-red-600' : 'text-gray-400'}`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-bold">Inicio</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('catalog')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'catalog' ? 'text-red-600' : 'text-gray-400'}`}
      >
        <Grid className="w-6 h-6" />
        <span className="text-[10px] font-bold">Catálogo</span>
      </button>

      <button 
        onClick={openCart}
        className="flex flex-col items-center gap-1 relative text-gray-400"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold">Carrito</span>
      </button>

      <button 
        onClick={() => setActiveTab('contact')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'contact' ? 'text-red-600' : 'text-gray-400'}`}
      >
        <Phone className="w-6 h-6" />
        <span className="text-[10px] font-bold">Contacto</span>
      </button>
    </div>
  );
};

const Navbar = ({ activeTab, setActiveTab, cartCount, openCart }: any) => {
  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo (Mantenido) */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-red-600 p-2 rounded-lg">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-bold text-lg md:text-xl tracking-wider">MOTO<span className="text-red-500">PARTS</span></span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <button onClick={() => setActiveTab('home')} className="hover:text-red-500 font-medium">Inicio</button>
            <button onClick={() => setActiveTab('catalog')} className="hover:text-red-500 font-medium">Catálogo</button>
            <button onClick={() => setActiveTab('contact')} className="hover:text-red-500 font-medium">Contacto</button>
            
            <button onClick={openCart} className="relative p-2 bg-slate-800 rounded-full hover:bg-red-600 transition-colors">
              <ShoppingBag className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* En móvil solo mostramos el botón de carrito extra (opcional) o nada si usamos bottom nav */}
          <div className="md:hidden">
             {/* Espacio reservado para acciones futuras */}
          </div>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = ({ setActiveTab }: any) => (
  <div className="relative bg-slate-900 overflow-hidden font-sans">
    <div className="absolute inset-0">
      <img 
        src="https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1920" 
        alt="Moto Workshop" 
        className="w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
    </div>
    <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-32">
      <div className="lg:w-2/3">
        <h1 className="text-3xl md:text-6xl font-extrabold text-white tracking-tight mb-4 md:mb-6 leading-tight">
          Potencia tu Pasión <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            Repuestos de Calidad
          </span>
        </h1>
        <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl">
          Encuentra las mejores piezas para tu Daytona. Calidad garantizada.
        </p>
        <button 
          onClick={() => setActiveTab('catalog')}
          className="w-full md:w-auto flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg active:scale-95"
        >
          Ver Catálogo <ChevronRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

const CatalogView = ({ 
  productos, onAdd, isFav, toggleFav, 
  filtroModelo, setFiltroModelo, 
  busqueda, setBusqueda,
  filtroSeccion, setFiltroSeccion
}: any) => {
  const [pagina, setPagina] = useState(1);
  const [modalModelos, setModalModelos] = useState(false);
  const [busquedaModelo, setBusquedaModelo] = useState('');

  useEffect(() => { setPagina(1); }, [busqueda, filtroModelo, filtroSeccion]);

  const visibles = useMemo(() => {
    return productos.slice(0, pagina * CONFIG.ITEMS_PAGINA);
  }, [productos, pagina]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-4 px-3 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Controles Principales (Sticky en móvil para fácil acceso) */}
        <div className="sticky top-[64px] z-30 bg-gray-50/95 backdrop-blur-sm pb-4 pt-2">
          <div className="flex gap-2 mb-3">
            <button 
              onClick={() => setModalModelos(true)}
              className={`flex-1 flex items-center justify-center px-3 py-3 rounded-xl transition-colors shadow-sm text-sm font-bold border ${filtroModelo ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-800 border-gray-200'}`}
            >
              <Bike className="w-4 h-4 mr-2" />
              {filtroModelo ? filtroModelo : 'Filtrar Moto'}
            </button>
            
            <div className="flex-[2] relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar repuesto..."
                className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {/* Categorías Scrolleables */}
          <div className="overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
            <div className="flex space-x-2">
              {ORDEN_SECCIONES.map((category) => (
                <button
                  key={category}
                  onClick={() => setFiltroSeccion(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                    filtroSeccion === category
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Optimizado para Móvil (2 Columnas) */}
        {visibles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {visibles.map((product: any) => (
                <div key={product.id || Math.random()} className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden relative">
                  {/* Botón Fav Flotante */}
                  <button 
                    className={`absolute top-2 right-2 p-1.5 rounded-full z-10 ${isFav(product.id) ? 'bg-red-100 text-red-600' : 'bg-black/10 text-white backdrop-blur-sm'}`}
                    onClick={(e) => { e.stopPropagation(); toggleFav(product.id); }}
                  >
                    <Heart className={`w-4 h-4 ${isFav(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  <div className="h-32 md:h-56 overflow-hidden bg-gray-100 relative">
                    <img 
                      src={optimizarImg(product.imagen)}
                      alt={product.nombre} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  </div>

                  <div className="p-3 flex flex-col flex-grow">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1 line-clamp-1">
                      {product.seccion}
                    </span>
                    <h3 className="text-xs md:text-sm font-bold text-slate-800 mb-2 line-clamp-2 flex-grow leading-tight">
                      {product.nombre}
                    </h3>
                    
                    <div className="flex items-end justify-between mt-auto pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400">Precio</span>
                        <span className="text-sm md:text-lg font-extrabold text-slate-900">
                          ${Number(product.precio).toFixed(2)}
                        </span>
                      </div>
                      <button 
                        onClick={() => onAdd(product)}
                        className="bg-slate-900 text-white p-2 rounded-lg hover:bg-red-600 active:scale-90 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Botón Cargar Más */}
            {visibles.length < productos.length && (
              <div className="mt-8 text-center">
                <button 
                  onClick={() => setPagina(p => p + 1)}
                  className="w-full md:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-full shadow-sm active:bg-gray-50"
                >
                  Ver más productos ({productos.length - visibles.length})
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-gray-900 font-medium">Sin resultados</h3>
            <button onClick={() => { setBusqueda(''); setFiltroModelo(''); setFiltroSeccion('Todos'); }} className="mt-2 text-red-600 font-bold text-sm">Limpiar filtros</button>
          </div>
        )}
      </div>

      {/* Modal Modelos (Full Screen en Móvil) */}
      {modalModelos && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end md:items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-full md:max-w-2xl h-[80vh] md:h-auto md:max-h-[80vh] rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden animate-slide-up">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-slate-900">Selecciona tu Moto</h3>
              <button onClick={() => setModalModelos(false)} className="p-2 bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-3 bg-white border-b">
              <input 
                type="text" 
                placeholder="Buscar modelo..." 
                className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none text-sm"
                value={busquedaModelo}
                onChange={(e) => setBusquedaModelo(e.target.value)}
              />
            </div>
            <div className="overflow-y-auto p-4 grid grid-cols-2 gap-2 content-start">
              <button onClick={() => { setFiltroModelo(''); setModalModelos(false); }} className="p-3 rounded-xl border border-dashed border-red-300 bg-red-50 text-red-600 font-bold text-sm">
                TODAS LAS MOTOS
              </button>
              {MODELOS.filter(m => m.toLowerCase().includes(busquedaModelo.toLowerCase())).map(m => (
                <button
                  key={m}
                  onClick={() => { setFiltroModelo(m); setModalModelos(false); }}
                  className={`p-3 rounded-xl text-left text-xs font-bold border ${filtroModelo === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 border-gray-100'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContactView = () => (
  <div className="min-h-screen bg-gray-50 pb-24 pt-8 px-4">
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Phone className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Contáctanos</h2>
      <p className="text-gray-500 mb-8 text-sm">Estamos listos para ayudarte por WhatsApp.</p>
      <a 
        href={`https://wa.me/${CONFIG.WHATSAPP}`} 
        target="_blank"
        className="block w-full bg-[#25D366] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all mb-4"
      >
        Chat en WhatsApp
      </a>
      <p className="text-xs text-gray-400">Horario: Lunes a Sábado, 9am - 6pm</p>
    </div>
  </div>
);

// --- APP PRINCIPAL ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(CONFIG.KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');

  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);

  const toggleFav = (id: string) => {
    setFavs(prev => {
      const nuevos = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(CONFIG.KEY_FAVS, JSON.stringify(nuevos));
      return nuevos;
    });
  };

  const addCarrito = (p: any) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setCarrito(prev => {
      const existe = prev.find(i => i.id === p.id);
      return existe ? prev.map(i => i.id === p.id ? {...i, cant: i.cant + 1} : i) : [...prev, {...p, cant: 1}];
    });
    setCarritoAbierto(true);
  };

  const enviarPedido = () => {
    let msg = "Hola LV PARTS, mi pedido:\n\n";
    carrito.forEach(i => msg += `▪ ${i.cant}x ${i.nombre}\n`);
    msg += `\nTotal: $${carrito.reduce((a, b) => a + b.precio * b.cant, 0).toFixed(2)}`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
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
      if (terminos.length > 0 && !terminos.every(t => p.textoBusqueda.includes(t))) return false;
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;
      return true;
    });
  }, [productosProcesados, busqueda, filtroSeccion, filtroModelo]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} cartCount={carrito.reduce((a,b)=>a+b.cant,0)} openCart={() => setCarritoAbierto(true)} />
      
      <main className="fade-in">
        {activeTab === 'home' && (
          <div>
            <HeroSection setActiveTab={setActiveTab} />
            <div className="px-4 py-8">
              <h2 className="text-xl font-bold mb-4">Destacados</h2>
              <div className="grid grid-cols-2 gap-3">
                {productosProcesados.slice(0, 4).map((p:any) => (
                  <div key={p.id} className="border border-gray-100 rounded-lg p-3 bg-white shadow-sm" onClick={() => {setActiveTab('catalog'); setBusqueda(p.nombre)}}>
                    <img src={optimizarImg(p.imagen)} className="w-full h-32 object-cover rounded-md mb-2 bg-gray-100" />
                    <h3 className="text-xs font-bold line-clamp-2 mb-1">{p.nombre}</h3>
                    <span className="text-red-600 font-bold text-sm">${Number(p.precio).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'catalog' && (
          <CatalogView 
            productos={productosFiltrados} onAdd={addCarrito} isFav={(id:string) => favs.includes(id)} toggleFav={toggleFav}
            filtroModelo={filtroModelo} setFiltroModelo={setFiltroModelo}
            busqueda={busqueda} setBusqueda={setBusqueda}
            filtroSeccion={filtroSeccion} setFiltroSeccion={setFiltroSeccion}
          />
        )}
        
        {activeTab === 'contact' && <ContactView />}
      </main>

      {/* Menú Inferior Móvil */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} cartCount={carrito.reduce((a,b)=>a+b.cant,0)} openCart={() => setCarritoAbierto(true)} />

      {/* Drawer Carrito */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCarritoAbierto(false)}></div>
          <div className="relative w-full md:max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold">Tu Pedido</h2>
              <button onClick={() => setCarritoAbierto(false)}><X className="w-6 h-6"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {carrito.map(item => (
                <div key={item.id} className="flex gap-3 p-2 border rounded-lg">
                  <img src={optimizarImg(item.imagen)} className="w-16 h-16 object-cover rounded bg-gray-100" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold line-clamp-2">{item.nombre}</h4>
                    <p className="text-red-600 font-bold text-sm">${(item.precio * item.cant).toFixed(2)}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <button onClick={() => setCarrito(c => c.map(x => x.id === item.id ? {...x, cant: x.cant-1} : x).filter(x => x.cant > 0))} className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center"><Minus size={12}/></button>
                      <span className="text-xs font-bold">{item.cant}</span>
                      <button onClick={() => setCarrito(c => c.map(x => x.id === item.id ? {...x, cant: x.cant+1} : x))} className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center"><Plus size={12}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-gray-50 pb-safe">
              <div className="flex justify-between font-bold text-lg mb-4"><span>Total:</span><span>${carrito.reduce((a,b)=>a+b.precio*b.cant,0).toFixed(2)}</span></div>
              <button onClick={enviarPedido} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                <MessageCircle size={20} /> Pedir por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-900 text-gray-500 py-8 text-center text-xs pb-24 md:pb-8">
        <p>&copy; {new Date().getFullYear()} LV PARTS.</p>
      </footer>
    </div>
  );
}