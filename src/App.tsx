import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, ShoppingBag, Phone, Menu, X, Search, ChevronRight, 
  Star, MapPin, Mail, Heart, Bike, Filter, ArrowUp, Plus, Minus, MessageCircle
} from 'lucide-react';

import './App.css';
import dataOrigen from './data.json'; 
import { detectarSeccion } from './utils/categories';

// --- CONFIGURACIÓN Y CONSTANTES (PRESERVADAS) ---
const CONFIG = {
  WHATSAPP: "593993279707",
  FACEBOOK: "https://www.facebook.com/profile.php?id=61583611217559",
  INSTAGRAM: "https://www.instagram.com/love_daytona_oficial/",
  ITEMS_PAGINA: 20, // Paginación eficiente
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

// --- UTILIDADES DE EFICIENCIA ---
const limpiarTexto = (texto: string) => {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const optimizarImg = (url: string) => {
  if (!url || url === 'No imagen') return 'https://via.placeholder.com/400x300?text=No+Image';
  if (url.includes('wsrv.nl')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=cover&a=top&q=80&output=webp`;
};

// --- COMPONENTES UI ---

const Navbar = ({ activeTab, setActiveTab, cartCount, openCart }: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'catalog', label: 'Catálogo', icon: ShoppingBag },
    { id: 'contact', label: 'Contacto', icon: Phone },
  ];

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-red-600 p-2 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-wider">MOTO<span className="text-red-500">PARTS</span></span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-red-600 text-white shadow-md transform scale-105' 
                    : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            {/* Cart Button */}
            <button onClick={openCart} className="relative p-2 bg-slate-800 rounded-full hover:bg-red-600 transition-colors">
              <ShoppingBag className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={openCart} className="relative p-2 text-gray-300">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium ${
                  activeTab === item.id ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
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
    <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 lg:py-40">
      <div className="lg:w-2/3">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Potencia tu Pasión <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            Repuestos de Calidad
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
          Encuentra las mejores piezas para mantener tu motocicleta en perfecto estado. 
          Calidad garantizada y envíos rápidos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setActiveTab('catalog')}
            className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg hover:shadow-red-600/30 transform hover:-translate-y-1"
          >
            Ver Catálogo <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- VISTA DE CATÁLOGO (POTENCIADA) ---
const CatalogView = ({ 
  productos, onAdd, isFav, toggleFav, 
  filtroModelo, setFiltroModelo, 
  busqueda, setBusqueda,
  filtroSeccion, setFiltroSeccion
}: any) => {
  const [pagina, setPagina] = useState(1);
  const [modalModelos, setModalModelos] = useState(false);
  const [busquedaModelo, setBusquedaModelo] = useState('');

  // Reiniciar paginación al filtrar
  useEffect(() => { setPagina(1); }, [busqueda, filtroModelo, filtroSeccion]);

  const visibles = useMemo(() => {
    return productos.slice(0, pagina * CONFIG.ITEMS_PAGINA);
  }, [productos, pagina]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado y Buscador */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Catálogo de Repuestos</h2>
            {filtroModelo && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">Filtrando por:</span>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <Bike className="w-4 h-4 mr-2"/> {filtroModelo}
                  <button onClick={() => setFiltroModelo('')} className="ml-2 hover:text-red-900"><X className="w-4 h-4"/></button>
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setModalModelos(true)}
              className="flex items-center justify-center px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
            >
              <Filter className="w-5 h-5 mr-2" />
              {filtroModelo ? 'Cambiar Moto' : 'Filtrar Moto'}
            </button>
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar repuesto, código..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Categorías (Pills) */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex space-x-2">
            {ORDEN_SECCIONES.map((category) => (
              <button
                key={category}
                onClick={() => setFiltroSeccion(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                  filtroSeccion === category
                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        {visibles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibles.map((product: any) => (
                <div key={product.id || Math.random()} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden border border-gray-100 flex flex-col h-full">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img 
                      src={optimizarImg(product.imagen)}
                      alt={product.nombre} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                    />
                    <button 
                      className={`absolute top-2 right-2 p-2 rounded-full shadow-md z-10 ${isFav(product.id) ? 'bg-red-100 text-red-600' : 'bg-white text-gray-400 hover:text-red-500'}`}
                      onClick={(e) => { e.stopPropagation(); toggleFav(product.id); }}
                    >
                      <Heart className={`w-5 h-5 ${isFav(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md uppercase tracking-wide truncate max-w-[70%]">
                        {product.seccion || "General"}
                      </span>
                      {product.codigo_referencia && <span className="text-[10px] text-gray-400 font-mono">{product.codigo_referencia}</span>}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2 flex-grow">{product.nombre}</h3>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <span className="text-xl font-extrabold text-slate-900">${Number(product.precio).toFixed(2)}</span>
                      <button 
                        onClick={() => onAdd(product)}
                        className="p-2 bg-slate-900 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg active:transform active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Botón Ver Más */}
            {visibles.length < productos.length && (
              <div className="mt-12 text-center">
                <button 
                  onClick={() => setPagina(p => p + 1)}
                  className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Cargar más repuestos ({productos.length - visibles.length} restantes)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No encontramos lo que buscas</h3>
            <p className="text-gray-500">Intenta con otro término o quita los filtros.</p>
            <button onClick={() => { setBusqueda(''); setFiltroModelo(''); setFiltroSeccion('Todos'); }} className="mt-4 text-red-600 font-bold hover:underline">Limpiar todo</button>
          </div>
        )}
      </div>

      {/* MODAL SELECCIONAR MODELO */}
      {modalModelos && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Bike/> Selecciona tu Moto</h3>
              <button onClick={() => setModalModelos(false)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-6 h-6 text-gray-500"/></button>
            </div>
            <div className="p-4 bg-white border-b border-gray-100">
              <input 
                type="text" 
                placeholder="Buscar modelo (ej. Tekken, Wolf...)" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                value={busquedaModelo}
                onChange={(e) => setBusquedaModelo(e.target.value)}
                autoFocus
              />
            </div>
            <div className="overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <button 
                onClick={() => { setFiltroModelo(''); setModalModelos(false); }}
                className="p-4 rounded-xl border border-dashed border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all text-center"
              >
                <span className="font-bold text-red-600">VER TODAS</span>
              </button>
              {MODELOS.filter(m => m.toLowerCase().includes(busquedaModelo.toLowerCase())).map(m => (
                <button
                  key={m}
                  onClick={() => { setFiltroModelo(m); setModalModelos(false); }}
                  className={`p-3 rounded-xl text-left transition-all ${
                    filtroModelo === m 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                  }`}
                >
                  <span className="font-medium text-sm block truncate">{m}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContactView = () => {
  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert("¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div className="bg-slate-900 text-white p-10 md:w-2/5 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-6">Contáctanos</h2>
              <p className="text-gray-300 mb-10 leading-relaxed">
                Estamos aquí para asesorarte sobre los mejores repuestos para tu motocicleta.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-red-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">WhatsApp</h3>
                    <p className="text-gray-400">+593 99 327 9707</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-red-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Redes Sociales</h3>
                    <p className="text-gray-400">@love_daytona_oficial</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-10 md:w-3/5 bg-white">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Envíanos un mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" required className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                <textarea required rows={4} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-all shadow-lg">Enviar Mensaje</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(CONFIG.KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  // Estado para el catálogo
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // --- LÓGICA DE DATOS (Preservada y Optimizada) ---
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
    let msg = "Hola Love Daytona, mi pedido:\n\n";
    carrito.forEach(i => msg += `▪ [${i.codigo_referencia || 'S/C'}] ${i.cant}x ${i.nombre} ($${Number(i.precio).toFixed(2)})\n`);
    msg += `\nTotal: $${carrito.reduce((a, b) => a + b.precio * b.cant, 0).toFixed(2)}`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const productosProcesados = useMemo(() => {
    const raw = (dataOrigen as any).RAW_SCRAPED_DATA || (dataOrigen as any).products || [];
    const lista = Array.isArray(raw) ? raw : [];
    return lista.map((p: any) => ({
      ...p,
      seccion: detectarSeccion(p),
      textoBusqueda: limpiarTexto(`${p.nombre} ${p.codigo_referencia || ''} ${p.categoria || ''} ${detectarSeccion(p)}`)
    }));
  }, []);

  const productosFiltrados = useMemo(() => {
    const terminos = limpiarTexto(busqueda).split(' ').filter(t => t.length > 0);
    return productosProcesados.filter((p: any) => {
      if (!p.precio) return false;
      // Filtro Texto
      if (terminos.length > 0 && !terminos.every(t => p.textoBusqueda.includes(t))) return false;
      // Filtro Sección
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      // Filtro Modelo (Simplificado pero efectivo)
      if (filtroModelo) {
        const nombreLower = p.nombre.toLowerCase();
        // Lógica específica para modelos complejos
        if (filtroModelo === 'Wing Evo') return nombreLower.includes('wing evo') && !nombreLower.includes('200') && !nombreLower.includes('evo 2');
        // ... (puedes agregar aquí más lógica específica si es necesaria)
        return nombreLower.includes(filtroModelo.toLowerCase());
      }
      return true;
    });
  }, [productosProcesados, busqueda, filtroSeccion, filtroModelo]);

  const totalItems = carrito.reduce((a, b) => a + b.cant, 0);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={totalItems} 
        openCart={() => setCarritoAbierto(true)}
      />
      
      <main className="fade-in">
        {activeTab === 'home' && (
          <div>
            <HeroSection setActiveTab={setActiveTab} />
            <div className="max-w-7xl mx-auto px-4 py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Destacados</h2>
                <p className="text-gray-600">Una selección de nuestros mejores repuestos.</p>
              </div>
              {/* Mostramos un pequeño catálogo destacado (primeros 4 items) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {productosProcesados.slice(0, 4).map((p:any) => (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden group">
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img src={optimizarImg(p.imagen)} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 truncate">{p.nombre}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-red-600 font-bold">${Number(p.precio).toFixed(2)}</span>
                        <button onClick={() => {setActiveTab('catalog'); setBusqueda(p.nombre)}} className="text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-slate-900">Ver</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'catalog' && (
          <CatalogView 
            productos={productosFiltrados}
            onAdd={addCarrito}
            isFav={(id: string) => favs.includes(id)}
            toggleFav={toggleFav}
            filtroModelo={filtroModelo}
            setFiltroModelo={setFiltroModelo}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtroSeccion={filtroSeccion}
            setFiltroSeccion={setFiltroSeccion}
          />
        )}
        
        {activeTab === 'contact' && <ContactView />}
      </main>

      {/* DRAWER DEL CARRITO (LADO DERECHO) */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCarritoAbierto(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ShoppingBag/> Mi Pedido</h2>
              <button onClick={() => setCarritoAbierto(false)} className="p-2 hover:bg-gray-200 rounded-full"><X/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {carrito.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                carrito.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <img src={optimizarImg(item.imagen)} className="w-16 h-16 object-cover rounded-lg bg-white" alt="" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{item.nombre}</h4>
                      <p className="text-red-600 font-bold text-sm">${(item.precio * item.cant).toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => setCarrito(c => c.map(x => x.id === item.id ? {...x, cant: x.cant-1} : x).filter(x => x.cant > 0))} className="w-6 h-6 bg-white border rounded flex items-center justify-center hover:bg-gray-100"><Minus size={12}/></button>
                        <span className="text-sm font-bold">{item.cant}</span>
                        <button onClick={() => setCarrito(c => c.map(x => x.id === item.id ? {...x, cant: x.cant+1} : x))} className="w-6 h-6 bg-white border rounded flex items-center justify-center hover:bg-gray-100"><Plus size={12}/></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t bg-slate-50">
              <div className="flex justify-between items-center mb-4 text-lg font-bold text-slate-900">
                <span>Total Estimado:</span>
                <span>${carrito.reduce((a,b)=>a+b.precio*b.cant, 0).toFixed(2)}</span>
              </div>
              <button 
                onClick={enviarPedido}
                disabled={carrito.length === 0}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-600/30"
              >
                <MessageCircle size={20} /> Completar Pedido por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-900 text-gray-400 py-8 border-t border-gray-800 text-center">
        <p>&copy; {new Date().getFullYear()} MotoParts Love Daytona. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}