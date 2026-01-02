import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Search, X, Heart, Home, 
  MessageCircle, Plus, Minus, Facebook, Instagram, ChevronLeft, Bike, ArrowUp 
} from 'lucide-react';

import './App.css';
import dataOrigen from './data.json'; 
import { detectarSeccion } from './utils/categories';

const CONFIG = {
  WHATSAPP: "593993279707",
  FACEBOOK: "https://www.facebook.com/profile.php?id=61583611217559",
  INSTAGRAM: "https://www.instagram.com/love_daytona_oficial/",
  ITEMS_PAGINA: 30,
  KEY_FAVS: 'loveDaytonaFavs'
};

const ORDEN_SECCIONES = [
  'Motor e Internos', 'Transmisión', 'Sistema Eléctrico', 'Sistema de Frenos', 
  'Chasis y Suspensión', 'Carrocería y Plásticos', 'Ruedas y Ejes', 
  'Cables y Mandos', 'Filtros y Mantenimiento', 'Otros Repuestos'
];

const MODELOS = [
  // --- MODELOS PRINCIPALES ---
  "Tekken", "Tekken Evo", "Axxo Tracker", "DK Nativa",
  "Scrambler", "Scrambler Clasica", "Scrambler Revolution", "Axxo Scrambler",
  "Scorpion", "Axxo TRX", "TH Mig25", "DK250-D Sport",
  "Bull",
  "Shark", "Shark II", "Shark III",
  "Maverick",
  "Wolf",
  "Adventure", "Adventure R 250", "Adventure 200",
  "Hunter",
  "GP1", "Tundra Veloce", "Thunder Veloce",
  "Crossfire", "Xtreem", "Thunder F16", "DK Hornet", "IGM Wind", "Z1 V8200", "Tundra Ghost",
  "Axxo Asfalt", "Axxo F51",
  "Ranger CFZ", "Honda CB190", "Honda CB1",
  "Force", "DK XTZ",
  "Axxo TR1", "DK200B", "SHM Armi150",
  "Axxo Viper", "Ranger 150BWSM", "Bultaco Storm", "Z1 Super", "Sukida Joy",
  "Agility", "Agility X",
  "Boneville", "Axxo Milano", "Bultaco Freedom",
  "Tanq",
  "Dynamic", "Dynamic Pro", "SHM Jedi",
  "Feroce", "Predator", "Elvissa", "Viper", "CX7", "Comander",
  "Crucero", "Spitfire", "Delta", "Montana", "Workforce", "GTR", "Panther", 
  "Cafe Racer", "Eagle", "Speed", "Everest",

  // --- MODELOS CON LÓGICA ESPECIAL ---
  "Wing Evo", "Wing Evo 200", "Wing Evo 2", 
  "Scooter Evo 2 180",
  "S1", "S1 Adv", "S1 Crossover 180"
];

// --- UTILIDAD DE BÚSQUEDA PODEROSA ---
const limpiarTexto = (texto: string) => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

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
        {p.codigo_referencia && (
          <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>
            CÓD: {p.codigo_referencia}
          </span>
        )}
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
  const [busquedaModelo, setBusquedaModelo] = useState(''); // <--- NUEVO ESTADO PARA BUSCAR MODELO
  const [pagina, setPagina] = useState(1);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);
  const [menuFiltro, setMenuFiltro] = useState(false);
  const [toast, setToast] = useState<{id: number, msg: string}[]>([]);
  const [verFavs, setVerFavs] = useState(false);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(CONFIG.KEY_FAVS) || '[]'); } catch { return []; }
  });

  // Limpiar buscador de modelos al cerrar el modal
  useEffect(() => {
    if (!menuFiltro) setBusquedaModelo('');
  }, [menuFiltro]);

  const productos = useMemo(() => {
    const raw = (dataOrigen as any).RAW_SCRAPED_DATA || (dataOrigen as any).products || [];
    const lista = Array.isArray(raw) ? raw : [];
    return lista.map((p: any) => {
      const seccion = detectarSeccion(p); 
      const textoBusqueda = limpiarTexto(`${p.nombre} ${p.codigo_referencia || ''} ${p.categoria || ''} ${seccion}`);
      return { ...p, seccion, textoBusqueda };
    });
  }, []);

  const productosFiltrados = useMemo(() => {
    const terminosBusqueda = limpiarTexto(busqueda).split(' ').filter(t => t.length > 0);

    let res = productos.filter((p: any) => {
      if (!p.precio) return false;
      if (verFavs && !favs.includes(p.id)) return false;

      // 1. FILTRO DE BÚSQUEDA
      const matchTexto = terminosBusqueda.every(termino => p.textoBusqueda.includes(termino));
      
      // 2. FILTRO DE MODELO (LÓGICA BLINDADA MULTI-MODELO)
      let matchModelo = true;
      if (filtroModelo) {
        const nombreLower = p.nombre.toLowerCase();
        
        // --- LÓGICA WING EVO ---
        const esWingEvo2 = nombreLower.includes('wing evo 2') || 
                           nombreLower.includes('wing evo2') || 
                           nombreLower.includes('wing evo ii');

        if (filtroModelo === 'Wing Evo') {
           const esEvo = nombreLower.includes('wing evo');
           const es200 = nombreLower.includes('200');
           matchModelo = esEvo && !es200 && !esWingEvo2;
        }
        else if (filtroModelo === 'Wing Evo 200') {
           const esEvo = nombreLower.includes('wing evo');
           const es200 = nombreLower.includes('200');
           matchModelo = esEvo && es200 && !esWingEvo2;
        }
        else if (filtroModelo === 'Wing Evo 2') {
           matchModelo = esWingEvo2;
        }
        // --- LÓGICA SCOOTER ---
        else if (filtroModelo === 'Scooter Evo 2 180') {
           const tiene180 = nombreLower.includes('180');
           const tieneEvo2 = nombreLower.includes('evo 2') || nombreLower.includes('evo2');
           const noEsWing = !nombreLower.includes('wing'); // Bloqueamos Wing
           matchModelo = tiene180 && tieneEvo2 && noEsWing;
        }
        // --- LÓGICA S1 (TRIÁNGULO S1 / ADV / CROSSOVER) ---
        else if (filtroModelo === 'S1') {
           // S1 estándar: Busca "S1" pero QUE NO SEA "Adv", "Adventure" ni "Crossover"
           const tieneS1 = nombreLower.includes('s1');
           const esAdv = nombreLower.includes('adv') || nombreLower.includes('adventure');
           const esCross = nombreLower.includes('crossover');
           matchModelo = tieneS1 && !esAdv && !esCross;
        }
        else if (filtroModelo === 'S1 Adv') {
           // S1 Adv: Busca "S1" Y ("Adv" o "Adventure") pero QUE NO SEA "Crossover"
           const tieneS1 = nombreLower.includes('s1');
           const esAdv = nombreLower.includes('adv') || nombreLower.includes('adventure');
           const esCross = nombreLower.includes('crossover');
           matchModelo = tieneS1 && esAdv && !esCross;
        }
        else if (filtroModelo === 'S1 Crossover 180') {
           // S1 Crossover: Busca "Crossover" (es la palabra clave única)
           matchModelo = nombreLower.includes('crossover');
        }
        // --- RESTO DE MODELOS ---
        else {
           matchModelo = nombreLower.includes(filtroModelo.toLowerCase());
        }
      }
      
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

  const seccionesVisibles = useMemo(() => {
    if (!filtroModelo) return [];
    const categoriasConProductos = new Set(productosFiltrados.map((p: any) => p.seccion));
    return ORDEN_SECCIONES.filter(cat => categoriasConProductos.has(cat));
  }, [filtroModelo, productosFiltrados]);

  const visibles = productosFiltrados.slice(0, pagina * CONFIG.ITEMS_PAGINA);

  useEffect(() => {
    const onScroll = () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        if (visibles.length < productosFiltrados.length) setPagina(p => p + 1);
      }
      setShowScrollTop(window.scrollY > 400);
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
    carrito.forEach(i => msg += `▪ [${i.codigo_referencia || 'S/C'}] ${i.cant}x ${i.nombre} ($${Number(i.precio).toFixed(2)})\n`);
    msg += `\nTotal: $${carrito.reduce((a, b) => a + b.precio * b.cant, 0).toFixed(2)}`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const cotizarProducto = (p: any) => {
     const ref = p.codigo_referencia ? `(Ref: ${p.codigo_referencia})` : '';
     window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=Hola, me interesa este repuesto ${ref}: ${p.nombre} - Valor: $${Number(p.precio).toFixed(2)}`, '_blank');
  };

  const cotizarGeneral = () => {
    window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=Hola Love Daytona, quisiera cotizar un repuesto.`, '_blank');
  };

  const irASeccion = (seccion: string) => {
    const id = `sec-${seccion.replace(/\s+/g, '-')}`;
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); setVerFavs(false); }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalItems = carrito.reduce((a, b) => a + b.cant, 0);

  return (
    <div className="app">
      <header className="header">
        <div className="brand" onClick={() => window.location.reload()}>LOVE <span>DAYTONA</span></div>
        <div className="search-box">
          <Search size={18} className="icon" />
          <input 
            type="text" 
            placeholder="Buscar repuesto, código..." 
            value={busqueda} 
            onChange={e => { setBusqueda(e.target.value); setPagina(1); window.scrollTo(0,0); }}
          />
          {busqueda && <button onClick={() => setBusqueda('')}><X size={16}/></button>}
        </div>
      </header>

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

      {!verFavs && !busqueda && seccionesVisibles.length > 0 && (
        <div className="shortcuts-bar">
          {seccionesVisibles.map(cat => (
            <button key={cat} className="shortcut-chip" onClick={() => irASeccion(cat)}>
              {cat}
            </button>
          ))}
        </div>
      )}

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
            <Search size={40} />
            <p>No encontramos repuestos con "{busqueda}".</p>
            {filtroModelo && <p style={{fontSize: '0.8rem', color: '#666'}}>Intenta quitar el filtro de "{filtroModelo}"</p>}
            <button onClick={() => {setBusqueda(''); setFiltroModelo(''); setVerFavs(false)}}>Ver todo el catálogo</button>
          </div>
        )}
      </main>

      <button 
        className={`btn-scroll-top ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
        aria-label="Volver arriba"
      >
        <ArrowUp size={24} />
      </button>

      <footer className="main-footer">
        <div className="footer-content">
          <h3>¿No encuentras tu repuesto?</h3>
          <p>Escríbenos directamente, tenemos más stock en bodega.</p>
          <button className="btn-cotizar-footer" onClick={cotizarGeneral}><MessageCircle size={20}/> Cotizar por WhatsApp</button>
          <div className="social-icons">
            <button onClick={() => window.open(CONFIG.FACEBOOK, '_blank')}><Facebook size={24}/></button>
            <button onClick={() => window.open(CONFIG.INSTAGRAM, '_blank')}><Instagram size={24}/></button>
          </div>
          <p className="copyright">© 2024 Love Daytona Ecuador</p>
        </div>
      </footer>

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
                 
                 {productoSeleccionado.codigo_referencia && (
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 600 }}>
                      REF: {productoSeleccionado.codigo_referencia}
                    </p>
                 )}

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

      {zoomImg && (
        <div className="lightbox" onClick={() => setZoomImg(null)}>
          <img src={optimizarImg(zoomImg)} onClick={e => e.stopPropagation()} alt="Zoom" />
          <button className="close-zoom"><X size={30}/></button>
        </div>
      )}

      {/* --- MODAL DE SELECCIÓN DE MOTO (CON BUSCADOR) --- */}
      {menuFiltro && (
        <div className="modal-bg" onClick={() => setMenuFiltro(false)}>
          <div className="drawer drawer-large">
            <div className="drawer-head">
              <h3>Selecciona tu Moto</h3>
              <button onClick={() => setMenuFiltro(false)}><X/></button>
            </div>
            
            {/* BUSCADOR DE MODELOS (NUEVO) */}
            <div style={{ padding: '0 15px 10px', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', background: '#f5f5f5', 
                borderRadius: '8px', padding: '8px 12px', border: '1px solid #eee' 
              }}>
                <Search size={18} color="#666" />
                <input 
                  type="text" 
                  placeholder="Buscar modelo (ej. Tekken, Shark)..." 
                  value={busquedaModelo}
                  onChange={e => setBusquedaModelo(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  style={{ 
                    border: 'none', background: 'transparent', outline: 'none', 
                    marginLeft: '10px', width: '100%', fontSize: '1rem', color: '#333' 
                  }}
                  autoFocus
                />
                {busquedaModelo && (
                  <button onClick={() => setBusquedaModelo('')} style={{border:'none', background:'transparent', padding:0, cursor:'pointer'}}>
                    <X size={16} color="#999"/>
                  </button>
                )}
              </div>
            </div>

            <div className="drawer-body">
              <button className="btn-model-all" onClick={() => {setFiltroModelo(''); setMenuFiltro(false)}}>
                VER TODAS LAS MOTOS
              </button>
              
              <div className="model-grid">
                {/* FILTRADO DE LA LISTA DE MODELOS */}
                {MODELOS
                  .filter(m => m.toLowerCase().includes(busquedaModelo.toLowerCase()))
                  .map(m => (
                    <button 
                      key={m} 
                      className={`btn-model-card ${filtroModelo===m ? 'active':''}`} 
                      onClick={() => {setFiltroModelo(m); setMenuFiltro(false)}}
                    >
                      <Bike size={28} className="model-icon"/>
                      <span>{m}</span>
                    </button>
                ))}
                
                {MODELOS.filter(m => m.toLowerCase().includes(busquedaModelo.toLowerCase())).length === 0 && (
                   <div style={{gridColumn: '1/-1', textAlign:'center', padding:'20px', color:'#999'}}>
                     No se encontraron modelos.
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <div className="info">
                     <h4>{i.nombre}</h4>
                     {i.codigo_referencia && <span style={{fontSize:'0.7rem', color:'#888'}}>Ref: {i.codigo_referencia}</span>}
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