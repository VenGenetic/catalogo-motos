import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Search, X, Heart, Home, 
  MessageCircle, Plus, Minus, Facebook, Instagram, ChevronLeft, Bike 
} from 'lucide-react';

import './App.css';
import dataOrigen from './data.json'; 
import { detectarSeccion } from './utils/categories';

const CONFIG = {
  WHATSAPP: "593993279707", 
  ITEMS_PAGINA: 30,
  KEY_FAVS: 'loveDaytonaFavs'
};

const ORDEN_SECCIONES = [
  'Motor e Internos', 'Transmisión', 'Sistema Eléctrico', 'Sistema de Frenos', 
  'Chasis y Suspensión', 'Carrocería y Plásticos', 'Ruedas y Ejes', 
  'Cables y Mandos', 'Filtros y Mantenimiento', 'Otros Repuestos'
];

const MODELOS = [
  "Tekken", "Crucero", "Spitfire", "Shark", "Adventure", "GP1", "Delta", 
  "Wing Evo", "Montana", "Scorpion", "Workforce", "Scrambler", "Wolf", "GTR", 
  "Panther", "Cafe Racer", "Eagle", "Speed", "Bull", "Hunter", "Everest", 
  "Crossfire", "Feroce", "Maverick", "Predator", "S1", "Evo 2", "Elvissa", 
  "Dynamic", "Agility", "Viper", "CX7", "Comander"
];

// USAMOS FIT=COVER PARA QUE EL RECORTE CSS FUNCIONE BIEN
const optimizarImg = (url: string) => {
  if (!url || url === 'No imagen') return '';
  if (url.includes('wsrv.nl')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&h=800&fit=cover&a=top&q=85&output=webp`;
};

// --- TARJETA DE PRODUCTO ---
const ProductCard = React.memo(({ p, onAdd, onOpen, isFav, toggleFav }: any) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="card" onClick={() => onOpen(p)}>
      <div className="card-top">
        <span className="badge-cat">{p.categoria}</span>
        <button className={`btn-fav ${isFav ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }}>
          <Heart size={18} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="img-container">
        {!loaded && <div className="skeleton"></div>}
        <img src={optimizarImg(p.imagen)} alt={p.nombre} className={loaded ? 'visible' : ''} onLoad={() => setLoaded(true)} loading="lazy"/>
      </div>
      <div className="card-info">
        <h3>{p.nombre}</h3>
        <div className="card-action">
          <span className="price">${Number(p.precio).toFixed(2)}</span>
          <button className="btn-add" onClick={(e) => { e.stopPropagation(); onAdd(p); }}><Plus size={20} /></button>
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
  const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);
  const [menuFiltro, setMenuFiltro] = useState(false);
  const [toast, setToast] = useState<{id: number, msg: string}[]>([]);
  const [verFavs, setVerFavs] = useState(false);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(CONFIG.KEY_FAVS) || '[]'); } catch { return []; }
  });

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
      let idxA = ORDEN_SECCIONES.indexOf(a.seccion);
      let idxB = ORDEN_SECCIONES.indexOf(b.seccion);
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;
      return idxA - idxB;
    });
    return res;
  }, [productos, busqueda, filtroModelo, verFavs, favs]);

  const visibles = productosFiltrados.slice(0, pagina * CONFIG.ITEMS_PAGINA);

  useEffect(() => {
    const onScroll = () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        if (visibles.length < productosFiltrados.length) setPagina(p => p + 1);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [visibles, productosFiltrados]);

  useEffect(() => {
    if (productoSeleccionado) {
      window.history.pushState(null, "", window.location.pathname);
      const handlePop = () => setProductoSeleccionado(null);
      window.addEventListener("popstate", handlePop);
      return () => window.removeEventListener("popstate", handlePop);
    }
  }, [productoSeleccionado]);

  // FUNCIONES
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

  // --- MENSAJE DE PEDIDO CON PRECIOS ---
  const enviarPedido = () => {
    let msg = "Hola Love Daytona, mi pedido:\n\n";
    // Aquí agregamos el precio unitario a cada línea
    carrito.forEach(i => msg += `▪ ${i.cant}x ${i.nombre} ($${Number(i.precio).toFixed(2)})\n`);
    msg += `\nTotal: $${carrito.reduce((a, b) => a + b.precio * b.cant, 0).toFixed(2)}`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- CONSULTA INDIVIDUAL CON PRECIO ---
  const cotizarProducto = (p: any) => {
     window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=Hola, me interesa este repuesto: ${p.nombre} - Valor: $${Number(p.precio).toFixed(2)}`, '_blank');
  };

  const cotizarGeneral = () => {
    window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=Hola Love Daytona, quisiera cotizar un repuesto.`, '_blank');
  };

  const irASeccion = (seccion: string) => {
    const id = `sec-${seccion.replace(/\s+/g, '-')}`;
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); setVerFavs(false); }
  };

  const totalItems = carrito.reduce((a, b) => a + b.cant, 0);

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="brand" onClick={() => window.location.reload()}>LOVE <span>DAYTONA</span></div>
        <div className="search-box">
          <Search size={18} className="icon" />
          <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); window.scrollTo(0,0); }}/>
          {busqueda && <button onClick={() => setBusqueda('')}><X size={16}/></button>}
        </div>
      </header>

      {/* --- BARRA DE SELECCIÓN DE MOTO (INTUITIVA) --- */}
      <div className="model-selector-container">
        {!filtroModelo ? (
          <button className="btn-select-model" onClick={() => setMenuFiltro(true)}>
            <div className="icon-circle"><Bike size={24} /></div>
            <div className="text-col">
              <span className="label">FILTRAR POR MOTO</span>
              <span className="sub">Toca aquí para elegir tu modelo</span>
            </div>
            <ChevronLeft size={20} style={{transform: 'rotate(-90deg)', opacity: 0.5}}/>
          </button>
        ) : (
          <div className="active-model-bar">
            <div className="active-info">
              <span>Viendo repuestos de:</span>
              <strong>{filtroModelo}</strong>
            </div>
            <button onClick={() => setMenuFiltro(true)}>Cambiar</button>
            <button className="btn-clear" onClick={() => setFiltroModelo('')}><X size={18}/></button>
          </div>
        )}
      </div>

      {/* BARRA DE ATAJOS (CATEGORÍAS) */}
      {!verFavs && !busqueda && (
        <div className="shortcuts-bar">
          {ORDEN_SECCIONES.map(cat => <button key={cat} className="shortcut-chip" onClick={() => irASeccion(cat)}>{cat}</button>)}
        </div>
      )}

      {/* CONTENIDO */}
      <main className="content">
        {verFavs && <h2 className="titulo-seccion">❤️ Tus Favoritos</h2>}

        <div className="grid">
          {visibles.map((p: any, i: number) => {
            const mostrarTitulo = !verFavs && !busqueda && (i === 0 || p.seccion !== visibles[i-1]?.seccion);
            const seccionId = `sec-${(p.seccion || '').replace(/\s+/g, '-')}`;
            return (
              <React.Fragment key={p.id + i}>
                {mostrarTitulo && <div id={seccionId} className="header-seccion">{p.seccion}</div>}
                <ProductCard p={p} onAdd={addCarrito} onOpen={setProductoSeleccionado} isFav={favs.includes(p.id)} toggleFav={toggleFav}/>
              </React.Fragment>
            );
          })}
        </div>
        
        {visibles.length === 0 && (
          <div className="vacio">
            <Search size={40} /><p>No encontramos repuestos con ese criterio.</p>
            <button onClick={() => {setBusqueda(''); setFiltroModelo(''); setVerFavs(false)}}>Ver todo el catálogo</button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="main-footer">
        <div className="footer-content">
          <h3>¿No encuentras tu repuesto?</h3>
          <p>Escríbenos directamente, tenemos más stock en bodega.</p>
          <button className="btn-cotizar-footer" onClick={cotizarGeneral}><MessageCircle size={20}/> Cotizar por WhatsApp</button>
          <div className="social-icons"><button><Facebook size={24}/></button><button><Instagram size={24}/></button></div>
          <p className="copyright">© 2024 Love Daytona Ecuador</p>
        </div>
      </footer>

      {/* DETALLE DE PRODUCTO */}
      {productoSeleccionado && (
        <div className="detail-page-overlay">
          <div className="detail-page">
            
            <div className="detail-header-floating">
              <button className="btn-round-blur" onClick={() => setProductoSeleccionado(null)}>
                <ChevronLeft size={28} />
              </button>
              <button className="btn-round-blur" onClick={() => toggleFav(productoSeleccionado.id)}>
                <Heart size={24} fill={favs.includes(productoSeleccionado.id) ? "#FF6600" : "none"} color={favs.includes(productoSeleccionado.id) ? "#FF6600" : "#333"} />
              </button>
            </div>
            
            <div className="detail-scroll">
              <div className="detail-img-box" onClick={() => setZoomImg(productoSeleccionado.imagen)}>
                 <img src={optimizarImg(productoSeleccionado.imagen)} alt={productoSeleccionado.nombre} />
              </div>
              
              <div className="detail-info-sheet">
                 <div className="sheet-handle"></div>
                 <div className="detail-badges">
                    <span className="badge-pedido-clean">BAJO PEDIDO</span>
                    <span className="badge-section-clean">{productoSeleccionado.seccion}</span>
                 </div>
                 <h1>{productoSeleccionado.nombre}</h1>
                 <div className="detail-price-row">
                    <span className="detail-price">${Number(productoSeleccionado.precio).toFixed(2)}</span>
                    <span className="detail-iva">Precio inc. IVA</span>
                 </div>
                 <div className="detail-actions">
                    <button className="btn-detail-add" onClick={() => { addCarrito(productoSeleccionado); setProductoSeleccionado(null); }}>
                      <Plus size={20}/> Agregar al Pedido
                    </button>
                    <button className="btn-detail-ws" onClick={() => cotizarProducto(productoSeleccionado)}>
                      <MessageCircle size={24}/>
                    </button>
                 </div>
                 <div className="detail-desc">
                    <p>Repuesto original garantizado para tu motocicleta Daytona. Verifica el modelo antes de comprar.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {zoomImg && (
        <div className="lightbox" onClick={() => setZoomImg(null)}>
          <img src={optimizarImg(zoomImg)} onClick={e => e.stopPropagation()} alt="Zoom" />
          <button className="close-zoom"><X size={30}/></button>
        </div>
      )}

      {/* MODAL DE SELECCIÓN DE MOTO */}
      {menuFiltro && (
        <div className="modal-bg" onClick={() => setMenuFiltro(false)}>
          <div className="drawer drawer-large">
            <div className="drawer-head">
              <h3>Selecciona tu Moto</h3>
              <button onClick={() => setMenuFiltro(false)}><X/></button>
            </div>
            <div className="drawer-body">
              <button className="btn-model-all" onClick={() => {setFiltroModelo(''); setMenuFiltro(false)}}>
                VER TODAS LAS MOTOS
              </button>
              <div className="model-grid">
                {MODELOS.map(m => (
                  <button 
                    key={m} 
                    className={`btn-model-card ${filtroModelo===m ? 'active':''}`} 
                    onClick={() => {setFiltroModelo(m); setMenuFiltro(false)}}
                  >
                    <Bike size={28} className="model-icon"/>
                    <span>{m}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARRITO */}
      {carritoAbierto && (
        <div className="modal-bg" onClick={() => setCarritoAbierto(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-head"><h3>Mi Pedido ({totalItems})</h3><button onClick={() => setCarritoAbierto(false)}><X/></button></div>
            <div className="drawer-body">
              {carrito.map(i => (
                <div key={i.id} className="item-cart">
                  <div className="cart-img-frame">
                    <img src={optimizarImg(i.imagen)} alt="" />
                  </div>
                  <div className="info"><h4>{i.nombre}</h4><p>${(i.precio * i.cant).toFixed(2)}</p></div>
                  <div className="qty">
                    <button onClick={() => setCarrito(c => c.map(x => x.id === i.id ? {...x, cant: x.cant-1} : x).filter(x => x.cant > 0))}><Minus size={14}/></button>
                    <span>{i.cant}</span>
                    <button onClick={() => setCarrito(c => c.map(x => x.id === i.id ? {...x, cant: x.cant+1} : x))}><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <div className="total"><span>Total:</span><span>${carrito.reduce((a,b)=>a+b.precio*b.cant, 0).toFixed(2)}</span></div>
              <button className="btn-ws" onClick={enviarPedido}><MessageCircle size={18}/> Pedir por WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      <div className="toasts">{toast.map(t => <div key={t.id} className="toast">{t.msg}</div>)}</div>

      <nav className="bottom-nav">
        <button className={!verFavs ? 'active' : ''} onClick={() => {setVerFavs(false); window.scrollTo(0,0)}}><Home size={24} /> Inicio</button>
        <button className={verFavs ? 'active' : ''} onClick={() => setVerFavs(true)}><Heart size={24} /> Favoritos</button>
        <button onClick={() => setCarritoAbierto(true)}><div className="badge-wrap"><ShoppingCart size={24} />{totalItems > 0 && <span>{totalItems}</span>}</div> Pedido</button>
      </nav>
    </div>
  );
}