import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Search, X, Heart, Filter, Home, 
  MessageCircle, Plus, Minus 
} from 'lucide-react';

// --- IMPORTACIONES ---
import './App.css';
import dataOrigen from './data.json'; 
import { detectarSeccion } from './utils/categories';

// --- CONFIGURACIÓN ---
const CONFIG = {
  WHATSAPP: "593993279707", // ¡Asegúrate de que este número es correcto!
  ITEMS_PAGINA: 30,
  KEY_FAVS: 'loveDaytonaFavs'
};

const ORDEN_SECCIONES = [
  'Motor e Internos', 'Transmisión', 'Sistema Eléctrico', 'Sistema de Frenos', 
  'Chasis y Suspensión', 'Carrocería y Plásticos', 'Ruedas y Ejes', 
  'Cables y Mandos', 'Filtros y Mantenimiento', 'Otros Repuestos'
];

const MODELOS = ["Tekken", "Crucero", "Spitfire", "Shark", "Adventure", "GP1R", "Delta", "Wing Evo", "Montana", "Scorpion", "Workforce"];

// --- UTILIDADES ---
const optimizarImg = (url: string) => {
  if (!url || url === 'No imagen') return '';
  if (url.includes('wsrv.nl')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=cover&a=top&q=75&output=webp`;
};

// --- COMPONENTE TARJETA (Integrado aquí mismo) ---
const ProductCard = React.memo(({ p, onAdd, onZoom, isFav, toggleFav }: any) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="card">
      <div className="card-top">
        <span className="badge-cat">{p.categoria}</span>
        <button 
          className={`btn-fav ${isFav ? 'active' : ''}`} 
          onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }}
        >
          <Heart size={18} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      
      <div className="img-container" onClick={() => onZoom(p.imagen)}>
        {!loaded && <div className="skeleton"></div>}
        <img 
          src={optimizarImg(p.imagen)} 
          alt={p.nombre}
          className={loaded ? 'visible' : ''}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      </div>

      <div className="card-info">
        <h3>{p.nombre}</h3>
        <div className="card-action">
          <span className="price">${Number(p.precio).toFixed(2)}</span>
          <button 
            className="btn-add" 
            onClick={(e) => { e.stopPropagation(); onAdd(p); }}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
});

// --- APP PRINCIPAL ---
export default function App() {
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [filtroModelo, setFiltroModelo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [menuFiltro, setMenuFiltro] = useState(false);
  const [toast, setToast] = useState<{id: number, msg: string}[]>([]);
  const [verFavs, setVerFavs] = useState(false);
  
  // Cargar Favoritos
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(CONFIG.KEY_FAVS) || '[]'); } catch { return []; }
  });

  // Procesar Datos
  const productos = useMemo(() => {
    const raw = (dataOrigen as any).RAW_SCRAPED_DATA || (dataOrigen as any).products || [];
    const lista = Array.isArray(raw) ? raw : [];
    return lista.map((p: any) => ({ ...p, seccion: detectarSeccion(p) }));
  }, []);

  const productosFiltrados = useMemo(() => {
    let res = productos.filter((p: any) => {
      if (!p.precio) return false;
      if (verFavs && !favs.includes(p.id)) return false;
      const matchTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchModelo = !filtroModelo || p.nombre.toLowerCase().includes(filtroModelo.toLowerCase());
      return matchTexto && matchModelo;
    });

    res.sort((a: any, b: any) => {
      const idxA = ORDEN_SECCIONES.indexOf(a.seccion || 'Otros');
      const idxB = ORDEN_SECCIONES.indexOf(b.seccion || 'Otros');
      return idxA - idxB;
    });

    return res;
  }, [productos, busqueda, filtroModelo, verFavs, favs]);

  const visibles = productosFiltrados.slice(0, pagina * CONFIG.ITEMS_PAGINA);

  // Scroll Infinito
  useEffect(() => {
    const onScroll = () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        if (visibles.length < productosFiltrados.length) setPagina(p => p + 1);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [visibles, productosFiltrados]);

  // Acciones
  const addToast = (msg: string) => {
    const id = Date.now();
    setToast(prev => [...prev, { id, msg }]);
    setTimeout(() => setToast(prev => prev.filter(t => t.id !== id)), 2000);
  };

  const toggleFav = (id: string) => {
    setFavs(prev => {
      const nuevos = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
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
    addToast('Agregado al carrito');
  };

  const enviarPedido = () => {
    let msg = "Hola Love Daytona, mi pedido:\n\n";
    carrito.forEach(i => msg += `▪ ${i.cant}x ${i.nombre}\n`);
    msg += `\nTotal: $${carrito.reduce((a, b) => a + b.precio * b.cant, 0).toFixed(2)}`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const totalItems = carrito.reduce((a, b) => a + b.cant, 0);

  return (
    <div className="app">
      {/* HEADER FIJO */}
      <header className="header">
        <div className="brand" onClick={() => window.location.reload()}>
          LOVE <span>DAYTONA</span>
        </div>
        <div className="search-box">
          <Search size={18} className="icon" />
          <input 
            type="text" 
            placeholder="Buscar repuesto..." 
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1); window.scrollTo(0,0); }}
          />
          {busqueda && <button onClick={() => setBusqueda('')}><X size={16}/></button>}
        </div>
        <button className="filter-btn" onClick={() => setMenuFiltro(true)}>
          <Filter size={20} />
        </button>
      </header>

      {/* CONTENIDO */}
      <main className="content">
        {filtroModelo && (
          <div className="chip-filtro" onClick={() => setFiltroModelo('')}>
            Modelo: {filtroModelo} <X size={14} />
          </div>
        )}

        {verFavs && <h2 className="titulo-seccion">❤️ Tus Favoritos</h2>}

        <div className="grid">
          {visibles.map((p: any, i: number) => {
            const mostrarTitulo = !verFavs && !busqueda && (i === 0 || p.seccion !== visibles[i-1]?.seccion);
            
            return (
              <React.Fragment key={p.id + i}>
                {mostrarTitulo && (
                  <div className="header-seccion">
                    {p.seccion}
                  </div>
                )}
                <ProductCard 
                  p={p} 
                  onAdd={addCarrito} 
                  onZoom={setZoomImg} 
                  isFav={favs.includes(p.id)} 
                  toggleFav={toggleFav}
                />
              </React.Fragment>
            );
          })}
        </div>
        
        {visibles.length === 0 && (
          <div className="vacio">
            <Search size={40} />
            <p>No se encontraron resultados</p>
            <button onClick={() => {setBusqueda(''); setFiltroModelo(''); setVerFavs(false)}}>Ver todo</button>
          </div>
        )}
      </main>

      {/* MODALES Y MENÚS */}
      {carritoAbierto && (
        <div className="modal-bg" onClick={() => setCarritoAbierto(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <h3>Mi Pedido ({totalItems})</h3>
              <button onClick={() => setCarritoAbierto(false)}><X/></button>
            </div>
            <div className="drawer-body">
              {carrito.map(i => (
                <div key={i.id} className="item-cart">
                  <img src={optimizarImg(i.imagen)} alt="" />
                  <div className="info">
                    <h4>{i.nombre}</h4>
                    <p>${(i.precio * i.cant).toFixed(2)}</p>
                  </div>
                  <div className="qty">
                    <button onClick={() => setCarrito(c => c.map(x => x.id === i.id ? {...x, cant: x.cant-1} : x).filter(x => x.cant > 0))}><Minus size={14}/></button>
                    <span>{i.cant}</span>
                    <button onClick={() => setCarrito(c => c.map(x => x.id === i.id ? {...x, cant: x.cant+1} : x))}><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <div className="total">
                <span>Total:</span>
                <span>${carrito.reduce((a,b)=>a+b.precio*b.cant, 0).toFixed(2)}</span>
              </div>
              <button className="btn-ws" onClick={enviarPedido}>
                <MessageCircle size={18}/> Pedir por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {menuFiltro && (
        <div className="modal-bg" onClick={() => setMenuFiltro(false)}>
          <div className="drawer">
            <div className="drawer-head"><h3>Modelos</h3></div>
            <div className="drawer-body">
              <button className="opt-filtro" onClick={() => {setFiltroModelo(''); setMenuFiltro(false)}}>Todos</button>
              {MODELOS.map(m => (
                <button key={m} className={`opt-filtro ${filtroModelo===m ? 'active':''}`} onClick={() => {setFiltroModelo(m); setMenuFiltro(false)}}>{m}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {zoomImg && (
        <div className="lightbox" onClick={() => setZoomImg(null)}>
          <img src={optimizarImg(zoomImg)} onClick={e => e.stopPropagation()} alt="Zoom" />
          <button className="close-zoom"><X size={30}/></button>
        </div>
      )}

      {/* TOASTS */}
      <div className="toasts">
        {toast.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
      </div>

      {/* NAVEGACIÓN INFERIOR (ESTILO APP) */}
      <nav className="bottom-nav">
        <button className={!verFavs ? 'active' : ''} onClick={() => {setVerFavs(false); window.scrollTo(0,0)}}>
          <Home size={24} /> Inicio
        </button>
        <button className={verFavs ? 'active' : ''} onClick={() => setVerFavs(true)}>
          <Heart size={24} /> Favoritos
        </button>
        <button onClick={() => setCarritoAbierto(true)}>
          <div className="badge-wrap">
            <ShoppingCart size={24} />
            {totalItems > 0 && <span>{totalItems}</span>}
          </div>
          Pedido
        </button>
      </nav>
    </div>
  );
}