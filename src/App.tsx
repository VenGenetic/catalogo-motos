import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Search, X, Check, Heart, Share2, Trash2, Filter, Home, 
  Zap, MessageCircle, AlertTriangle, LogOut, ArrowUp, Plus, Minus, ChevronLeft, ChevronRight 
} from 'lucide-react';

// --- IMPORTACIONES ---
import dataOrigen from './data.json'; 
import ProductCard from './components/ProductCard';
import { Producto, ItemCarrito, ToastMessage } from './types/index';
import { APP_CONFIG, ORDEN_SECCIONES, MODELOS_FIJOS } from './config/constants';
import { optimizarImagenThumbnail } from './utils/images';
import { detectarSeccion } from './utils/categories';

// --- COMPONENTE PRINCIPAL (APP) ---
export default function App() {
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroModeloActivo, setFiltroModeloActivo] = useState('');
  const [mostrarBotonSubir, setMostrarBotonSubir] = useState(false);
  const [imagenZoom, setImagenZoom] = useState<string | null>(null);
  const [intentandoSalir, setIntentandoSalir] = useState(false);
  const [confirmandoLimpiar, setConfirmandoLimpiar] = useState(false);
  const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isExiting = useRef(false);

  const [favoritos, setFavoritos] = useState<string[]>(() => {
    const guardados = localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS);
    return guardados ? JSON.parse(guardados) : [];
  });
  const [verFavoritos, setVerFavoritos] = useState(false);

  // Efectos (Scroll, Historial, etc.)
  useEffect(() => {
    window.history.pushState(null, "", window.location.pathname);
    const handlePopState = (event: any) => { 
        if (isExiting.current) return;
        event.preventDefault(); 
        setIntentandoSalir(true); 
        window.history.pushState(null, "", window.location.pathname); 
    };
    window.addEventListener("popstate", handlePopState);
    const handleBeforeUnload = (e: any) => { if (carrito.length > 0) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener("beforeunload", handleBeforeUnload);
    const handleScroll = () => setMostrarBotonSubir(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    
    if (carritoAbierto || menuFiltrosAbierto) { document.body.classList.add('no-scroll'); } 
    else { document.body.classList.remove('no-scroll'); }

    return () => { 
      window.removeEventListener("popstate", handlePopState); 
      window.removeEventListener("beforeunload", handleBeforeUnload); 
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('no-scroll');
    };
  }, [carrito, carritoAbierto, menuFiltrosAbierto]);

  // Procesamiento de Datos (CORREGIDO PARA EVITAR ERRORES)
  const productos: Producto[] = useMemo(() => {
    // 1. Intentamos obtener el array, manejando posibles estructuras diferentes del JSON
    const raw = (dataOrigen as any).RAW_SCRAPED_DATA || (dataOrigen as any).products || [];
    const lista = Array.isArray(raw) ? raw : []; // Seguridad extra: si no es array, usamos vacío
    
    // 2. Mapeamos para agregar la sección
    return lista.map((p: any) => ({ ...p, seccion: detectarSeccion(p) }));
  }, []);

  const productosFiltrados = useMemo(() => {
    if (!productos || productos.length === 0) return []; // Seguridad si no hay productos

    let filtrados = productos.filter(p => {
      if (!p.precio || p.precio <= 0) return false;
      if (verFavoritos && !favoritos.includes(p.id)) return false;
      const nombreNorm = (p.nombre || '').toLowerCase();
      const matchBusqueda = nombreNorm.includes(busqueda.toLowerCase());
      const matchModelo = filtroModeloActivo === '' || nombreNorm.includes(filtroModeloActivo.toLowerCase());
      return matchBusqueda && matchModelo;
    });

    filtrados.sort((a, b) => {
      const idxA = ORDEN_SECCIONES.indexOf(a.seccion || 'Otros Repuestos');
      const idxB = ORDEN_SECCIONES.indexOf(b.seccion || 'Otros Repuestos');
      return idxA - idxB;
    });

    return filtrados;
  }, [productos, busqueda, filtroModeloActivo, verFavoritos, favoritos]);

  const productosVisibles = useMemo(() => {
    const ultimo = paginaActual * APP_CONFIG.ITEMS_PER_PAGE;
    const primero = ultimo - APP_CONFIG.ITEMS_PER_PAGE;
    return productosFiltrados.slice(primero, ultimo);
  }, [paginaActual, productosFiltrados]);

  const totalPaginas = Math.ceil(productosFiltrados.length / APP_CONFIG.ITEMS_PER_PAGE);

  useEffect(() => { setPaginaActual(1); window.scrollTo(0,0); }, [busqueda, filtroModeloActivo, verFavoritos]);

  // Funciones de Acción
  const addToast = (msg: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const toggleFavorito = (id: string) => {
    setFavoritos(prev => {
      const nuevos = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS, JSON.stringify(nuevos));
      if (!prev.includes(id)) addToast("Agregado a favoritos ❤️");
      return nuevos;
    });
  };

  const agregarCarrito = (p: Producto) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setCarrito(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex ? prev.map(i => i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i) : [...prev, { ...p, cantidad: 1 }];
    });
    addToast("Agregado al carrito 🛒");
  };

  const compartirTienda = () => {
    if (navigator.share) { navigator.share({ title: 'Love Daytona', text: 'Mira los mejores repuestos para tu moto.', url: window.location.href }); } 
    else { navigator.clipboard.writeText(window.location.href); addToast("Enlace copiado al portapapeles 📋"); }
  };

  const modificarCantidad = (id: string, d: number) => {
    setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(0, i.cantidad + d) } : i).filter(i => i.cantidad > 0));
  };

  const limpiarCarrito = () => { setCarrito([]); setConfirmandoLimpiar(false); addToast("Carrito vaciado 🗑️"); };

  const totalCarrito = carrito.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
  const cantidadTotal = carrito.reduce((sum, i) => sum + i.cantidad, 0);

  const enviarWhatsApp = () => {
    let msg = "Hola Love Daytona 🏍️\nQuisiera realizar este pedido web:\n\n";
    carrito.forEach(i => { msg += `▪️ ${i.cantidad} x ${i.nombre} ($${(i.precio * i.cantidad).toFixed(2)})\n`; });
    msg += `\n💰 *Total Productos:* $${totalCarrito.toFixed(2)}`;
    msg += `\n🚚 *Costo Envío:* $5.00 - $10.00 (Aprox)`;
    msg += `\n\nQuedo pendiente de los datos para el pago y confirmar el envío.`;
    window.location.href = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const cotizarWhatsApp = () => { window.location.href = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=Hola Love Daytona, quisiera cotizar un repuesto.`; };
  
  const confirmarSalida = () => {
    isExiting.current = true; 
    window.history.go(-2);
    setTimeout(() => { window.close(); window.location.href = "https://google.com"; }, 200);
  };

  const irABuscador = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => searchInputRef.current?.focus(), 500);
  };

  // --- RENDERIZADO ---
  return (
    <>
    <div className="toast-container">{toasts.map(t => (<div key={t.id} className="toast"><Check size={18}/> {t.message}</div>))}</div>

    <nav className="top-navbar">
      <div className="main-container nav-content">
        <div className="logo-container" onClick={() => window.location.reload()}>
          <div className="logo-icon-bg"><Zap size={16} fill="white" strokeWidth={0} style={{transform: 'skew(10deg)'}} /></div>
          <div className="logo-text-group"><span className="logo-main">LOVE <span>DAYTONA</span></span></div>
        </div>
        <div className="nav-actions">
           <button className={`nav-btn-icon-only ${verFavoritos ? 'active' : ''}`} onClick={() => { setVerFavoritos(!verFavoritos); setBusqueda(''); setFiltroModeloActivo(''); }} aria-label="Ver Favoritos"><Heart size={20} fill={verFavoritos ? "white" : "none"} /></button>
           <button className="nav-btn-icon-only" onClick={compartirTienda} aria-label="Compartir"><Share2 size={20} /></button>
          <button className="nav-btn-icon-only" onClick={()=>setCarritoAbierto(true)} aria-label="Ver Carrito"><ShoppingCart size={20} />{cantidadTotal > 0 && <span className="cart-badge">{cantidadTotal}</span>}</button>
        </div>
      </div>
    </nav>

    {!verFavoritos && <section className="hero-section"><div className="main-container"><h1 className="hero-title">REPUESTOS <span>DAYTONA</span></h1><p className="hero-subtitle">Calidad y precisión para tu motocicleta.</p></div></section>}

    <main className="catalog-section">
      <div className="main-container">
        <div className="toolbar-sticky">
          <div className="search-bar-wrapper">
             <Search size={20} className="search-icon" />
             <input 
                ref={searchInputRef}
                type="text" 
                className="search-input" 
                placeholder="Buscar repuestos..." 
                value={busqueda} 
                onChange={(e)=>{setBusqueda(e.target.value); setFiltroModeloActivo(''); setVerFavoritos(false);}} 
             />
             {busqueda && <button className="search-clear-btn" onClick={()=>setBusqueda('')}><X size={16} /></button>}
          </div>
          
          {!verFavoritos && (
            <button className="filter-trigger-btn" onClick={() => setMenuFiltrosAbierto(true)}>
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <Filter size={18} />
                <span>Filtrar por Modelo</span>
              </div>
              {filtroModeloActivo ? <span className="filter-active-tag">{filtroModeloActivo}</span> : <ChevronRight size={18} color="#9ca3af"/>}
            </button>
          )}

          {verFavoritos && <div style={{textAlign:'center', fontWeight:'bold', marginTop:'10px'}}>❤️ Tus Favoritos ({productosFiltrados.length})</div>}
        </div>

        <div className="product-grid">
          {productosVisibles.map((p, i) => {
            const showHeader = i === 0 || p.seccion !== productosVisibles[i - 1].seccion;
            return (
              <React.Fragment key={`${p.id}-${i}`}>
                {showHeader && (
                  <div className="section-header">
                    <h2>{p.seccion}</h2>
                    <div className="section-line"></div>
                  </div>
                )}
                <ProductCard 
                  p={p} 
                  onAdd={agregarCarrito} 
                  onZoom={setImagenZoom} 
                  modeloActivo={filtroModeloActivo} 
                  isFav={favoritos.includes(p.id)} 
                  toggleFav={toggleFavorito} 
                />
              </React.Fragment>
            );
          })}
        </div>

        {productosVisibles.length === 0 && (
          <div style={{textAlign:'center', padding:'60px 20px', color:'#9ca3af'}}>
            {verFavoritos ? <Heart size={48} style={{opacity:0.3, marginBottom:'15px'}} /> : <Search size={48} style={{opacity:0.3, marginBottom:'15px'}} />}
            <h2 style={{fontSize:'1.3rem', margin:'0 0 10px', color:'var(--text-dark)'}}>{verFavoritos ? 'Sin favoritos aún' : 'Sin resultados'}</h2>
            <button onClick={()=>{setBusqueda(''); setFiltroModeloActivo(''); setVerFavoritos(false);}} style={{marginTop:'20px', background:'var(--primary)', color:'white', border:'none', padding:'10px 25px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Ver todo el catálogo</button>
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={paginaActual===1} onClick={()=>setPaginaActual(p=>p-1)}><ChevronLeft size={20}/></button>
            <span className="page-info">Página {paginaActual} de {totalPaginas}</span>
            <button className="page-btn" disabled={paginaActual===totalPaginas} onClick={()=>setPaginaActual(p=>p+1)}><ChevronRight size={20}/></button>
          </div>
        )}
      </div>
    </main>

    {menuFiltrosAbierto && (
      <div className="filter-overlay" onClick={() => setMenuFiltrosAbierto(false)}>
        <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="filter-drawer-header">
            <span className="filter-drawer-title"><Filter size={20} /> Modelos</span>
            <button onClick={() => setMenuFiltrosAbierto(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24} color="#6b7280"/></button>
          </div>
          <div className="filter-list">
            <button className={`filter-item ${filtroModeloActivo === '' ? 'active' : ''}`} onClick={() => { setFiltroModeloActivo(''); setBusqueda(''); setMenuFiltrosAbierto(false); }}>
              Todos los modelos {filtroModeloActivo === '' && <Check size={18}/>}
            </button>
            {MODELOS_FIJOS.map(modelo => (
              <button key={modelo} className={`filter-item ${filtroModeloActivo === modelo ? 'active' : ''}`} onClick={() => { setFiltroModeloActivo(modelo); setBusqueda(''); setMenuFiltrosAbierto(false); }}>
                {modelo} {filtroModeloActivo === modelo && <Check size={18}/>}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}

    <footer className="app-footer">
      <div className="main-container footer-content">
        <div className="logo-container"><span className="logo-main" style={{color:'#6b7280'}}>LOVE DAYTONA</span></div>
        <p style={{fontSize:'0.9rem', margin:0}}>Repuestos para tu moto en Ecuador.</p>
        <div className="social-links">
        </div>
      </div>
    </footer>

    <div className="floating-buttons-container">
        <button className="float-btn cart-float-btn" onClick={()=>setCarritoAbierto(true)}><ShoppingCart size={24} />{cantidadTotal > 0 && <span className="floating-badge">{cantidadTotal}</span>}</button>
        <button className="float-btn whatsapp-float-btn" onClick={cotizarWhatsApp}><MessageCircle size={24} /></button>
        {mostrarBotonSubir && <button className="float-btn scroll-top-btn" onClick={()=>window.scrollTo({top:0, behavior:'smooth'})}><ArrowUp size={24} /></button>}
    </div>

    {imagenZoom && (
      <div className="lightbox-overlay" onClick={() => setImagenZoom(null)}>
        <button className="lightbox-close"><X size={24}/></button>
        <img src={imagenZoom} className="lightbox-img" onClick={(e) => e.stopPropagation()} alt="Zoom Producto" />
      </div>
    )}

    {carritoAbierto && (
      <div className="cart-overlay" onClick={(e) => { if(e.target === e.currentTarget) setCarritoAbierto(false); }}>
        <div className="cart-sheet">
          <div className="cart-header">
            <h2 style={{margin:0, fontSize:'1.3rem', color:'var(--text-dark)', fontWeight:800}}>Tu Pedido</h2>
            <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                {carrito.length > 0 && <button onClick={()=>setConfirmandoLimpiar(true)} style={{border:'none', background:'transparent', cursor:'pointer', padding:'5px', color:'#ef4444'}}><Trash2 size={20}/></button>}
                <button onClick={()=>setCarritoAbierto(false)} style={{border:'none', background:'transparent', cursor:'pointer', padding:'5px'}}><X size={24} color="#9ca3af"/></button>
            </div>
          </div>
          <div className="cart-list">
            {carrito.length===0 ? (
              <div style={{textAlign:'center', color:'#9ca3af', marginTop:'60px'}}>
                <ShoppingCart size={50} style={{opacity:0.2, marginBottom:20}}/>
                <p>¡Tu carrito está vacío!</p>
                <button onClick={()=>setCarritoAbierto(false)} style={{marginTop:'20px', background:'var(--primary)', color:'white', border:'none', padding:'10px 20px', borderRadius:'10px', fontWeight:'bold', cursor:'pointer'}}>Comenzar a comprar</button>
              </div>
            ) : carrito.map(i => (
              <div key={i.id} style={{display:'flex', gap:'15px', marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid #f3f4f6'}}>
                <div style={{width:'70px', height:'70px', borderRadius:'12px', overflow:'hidden', border:'1px solid #f3f4f6', flexShrink:0, background:'white'}}>
                  <img src={optimizarImagenThumbnail(i.imagen)} className="cart-img-crop" onError={(e)=>e.currentTarget.style.display='none'} alt={i.nombre}/>
                </div>
                <div style={{flex:1}}>
                  <h4 style={{margin:'0 0 5px', fontSize:'0.9rem', color:'var(--text-dark)', fontWeight:600}}>{i.nombre}</h4>
                  <div style={{color:'var(--primary)', fontWeight:800, fontSize:'1rem'}}>${(i.precio * i.cantidad).toFixed(2)}</div>
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between'}}>
                   <button onClick={()=>modificarCantidad(i.id, 1)} style={{width:'28px', height:'28px', borderRadius:'8px', border:'1px solid #e5e7eb', background:'white'}}><Plus size={14}/></button>
                   <span style={{fontSize:'0.9rem', fontWeight:'700'}}>{i.cantidad}</span>
                   <button onClick={()=>modificarCantidad(i.id, -1)} style={{width:'28px', height:'28px', borderRadius:'8px', border:'1px solid #e5e7eb', background:'white'}}><Minus size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-footer">
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'1.1rem', fontWeight:'800', marginBottom:'5px', color:'var(--text-dark)'}}><span>Subtotal:</span><span>${totalCarrito.toFixed(2)}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', color:'#6b7280', marginBottom:'15px'}}><span>🚚 Envío estimado:</span><span>$5.00 - $10.00</span></div>
            <button onClick={enviarWhatsApp} style={{width:'100%', background:'#25D366', color:'white', padding:'16px', border:'none', borderRadius:'12px', fontSize:'1rem', fontWeight:'700', cursor:'pointer', display:'flex', justifyContent:'center', gap:'10px', boxShadow:'0 4px 10px rgba(37, 211, 102, 0.2)'}}><MessageCircle size={20}/> Pedir por WhatsApp</button>
          </div>
        </div>
      </div>
    )}

    {(intentandoSalir || confirmandoLimpiar) && (
      <div className="alert-overlay">
        <div style={{background:'white', borderRadius:'20px', padding:'30px', width:'100%', maxWidth:'320px', textAlign:'center', animation:'scaleUp 0.3s'}}>
          <div style={{width:'60px', height:'60px', background:'#fee2e2', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 15px', color:'#ef4444'}}>{confirmandoLimpiar ? <Trash2 size={30}/> : <AlertTriangle size={30} />}</div>
          <h3 style={{margin:'0 0 10px', fontSize:'1.2rem', fontWeight:800, color:'var(--text-dark)'}}>{confirmandoLimpiar ? '¿Vaciar carrito?' : '¿Salir de la tienda?'}</h3>
          <p style={{margin:'0 0 25px', color:'#6b7280', lineHeight:1.5, fontSize:'0.95rem'}}>{confirmandoLimpiar ? 'Se eliminarán todos los productos seleccionados.' : 'Si sales ahora, perderás los productos de tu pedido.'}</p>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {confirmandoLimpiar ? (
                <>
                    <button onClick={limpiarCarrito} style={{background:'#ef4444', color:'white', border:'none', padding:'14px', borderRadius:'12px', fontSize:'1rem', fontWeight:'600', cursor:'pointer'}}>Sí, vaciar todo</button>
                    <button onClick={() => setConfirmandoLimpiar(false)} style={{background:'transparent', color:'#6b7280', border:'none', padding:'10px', fontWeight:'600', cursor:'pointer'}}>Cancelar</button>
                </>
            ) : (
                <>
                    <button onClick={() => setIntentandoSalir(false)} style={{background:'var(--primary)', color:'white', border:'none', padding:'14px', borderRadius:'12px', fontSize:'1rem', fontWeight:'600', cursor:'pointer'}}>No, seguir comprando</button>
                    <button onClick={confirmarSalida} style={{background:'transparent', color:'#6b7280', border:'none', padding:'10px', fontWeight:'600', cursor:'pointer', marginTop:'5px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                      <LogOut size={18}/> Salir de la tienda
                    </button>
                </>
            )}
          </div>
        </div>
      </div>
    )}

    <div className="bottom-nav">
      <button className="nav-item active" onClick={() => { setVerFavoritos(false); window.scrollTo({top:0, behavior:'smooth'}); }}>
        <Home size={24} />
        <span>Inicio</span>
      </button>
      
      <button className="nav-item" onClick={irABuscador}>
        <Search size={24} />
        <span>Buscar</span>
      </button>
      
      <button className="nav-item" onClick={() => setCarritoAbierto(true)}>
        <div style={{position:'relative'}}>
          <ShoppingCart size={24} />
          {cantidadTotal > 0 && <span className="nav-badge">{cantidadTotal}</span>}
        </div>
        <span>Mi Pedido</span>
      </button>
    </div>
    </>
  );
}