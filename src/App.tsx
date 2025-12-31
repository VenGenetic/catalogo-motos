import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Search, X, ChevronLeft, ChevronRight, 
  Facebook, Instagram, MessageCircle, AlertTriangle, 
  Check, Heart, Trash2, Filter, Home
} from 'lucide-react';
import dataOrigen from './data.json'; 
import ProductCard from './components/ProductCard';
import { Producto, ItemCarrito, Toast } from './types';

// --- COMPONENTE PRINCIPAL APP ---
export default function App() {
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroModeloActivo, setFiltroModeloActivo] = useState('');
  // const [mostrarBotonSubir, setMostrarBotonSubir] = useState(false); // (Opcional si no se usa)
  const [imagenZoom, setImagenZoom] = useState<string | null>(null);
  const [confirmandoLimpiar, setConfirmandoLimpiar] = useState(false);
  const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [favoritos, setFavoritos] = useState<string[]>(() => {
    const guardados = localStorage.getItem('loveDaytonaFavs');
    return guardados ? JSON.parse(guardados) : [];
  });
  const [verFavoritos, setVerFavoritos] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const productosPorPagina = 24;
  const NUMERO_WHATSAPP = "593993279707"; 
  const MODELOS_FIJOS = ["Tekken", "Crucero", "Spitfire", "Shark", "Adventure", "GP1R", "Delta", "Wing Evo", "Montana", "Scorpion", "Workforce"];

  // Efecto Scroll al cambiar página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [paginaActual, verFavoritos]);

  // Manejo de Toasts
  const addToast = (msg: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2000);
  };

  // Filtrado
  const productosFiltrados = useMemo(() => {
    let filtrados = dataOrigen.RAW_SCRAPED_DATA as unknown as Producto[];
    if (verFavoritos) {
      filtrados = filtrados.filter(p => favoritos.includes(p.id));
    } else {
      if (filtroModeloActivo) {
        filtrados = filtrados.filter(p => 
          p.nombre.toUpperCase().includes(filtroModeloActivo.toUpperCase()) || 
          p.id.toUpperCase().includes(filtroModeloActivo.toUpperCase())
        );
      }
      if (busqueda) {
        const q = busqueda.toUpperCase();
        filtrados = filtrados.filter(p => p.nombre.toUpperCase().includes(q));
      }
    }
    return filtrados;
  }, [busqueda, filtroModeloActivo, verFavoritos, favoritos]);

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const productosVisibles = productosFiltrados.slice(
    (paginaActual - 1) * productosPorPagina, 
    paginaActual * productosPorPagina
  );

  // Carrito Lógica
  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const precioTotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const agregarCarrito = (p: Producto) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setCarrito(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex ? prev.map(i => i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i) : [...prev, { ...p, cantidad: 1 }];
    });
    addToast("Agregado al carrito 🛒");
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(prev => prev.filter(i => i.id !== id));
  };

  const toggleFavorito = (id: string) => {
    setFavoritos(prev => {
      const nuevos = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('loveDaytonaFavs', JSON.stringify(nuevos));
      if (!prev.includes(id)) addToast("Agregado a favoritos ❤️");
      return nuevos;
    });
  };

  const enviarPedido = () => {
    let mensaje = "Hola, me interesa comprar:\n\n";
    carrito.forEach(item => {
      mensaje += `▪️ ${item.cantidad} x ${item.nombre} ($${item.precio})\n`;
    });
    mensaje += `\n*TOTAL: $${precioTotal.toFixed(2)}*`;
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const irABuscador = () => {
    setVerFavoritos(false);
    setCarritoAbierto(false);
    searchInputRef.current?.focus();
  };

  return (
    <>
      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.message}</div>
        ))}
      </div>

      <nav className="navbar">
        <div className="main-container nav-content">
          <div className="nav-logo" onClick={() => { setVerFavoritos(false); setBusqueda(''); setFiltroModeloActivo(''); }}>
            LOVE DAYTONA <span className="logo-beta">BETA</span>
          </div>
          <div className="nav-actions">
            <button className="icon-btn relative" onClick={() => setVerFavoritos(!verFavoritos)}>
              <Heart size={24} fill={verFavoritos ? "currentColor" : "none"} color={verFavoritos ? "#ef4444" : "#374151"} />
            </button>
            <button className="icon-btn relative" onClick={() => setCarritoAbierto(true)}>
              <ShoppingCart size={24} />
              {cantidadTotal > 0 && <span className="cart-badge">{cantidadTotal}</span>}
            </button>
          </div>
        </div>
      </nav>

      {!verFavoritos && (
        <section className="hero-section">
          <div className="main-container">
            <h1 className="hero-title">REPUESTOS <span>DAYTONA</span></h1>
            <p className="hero-subtitle">Calidad y precisión para tu motocicleta.</p>
          </div>
        </section>
      )}

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
                onChange={(e)=>{setBusqueda(e.target.value); setFiltroModeloActivo(''); setVerFavoritos(false); setPaginaActual(1);}} 
              />
              {busqueda && <button className="search-clear-btn" onClick={()=>setBusqueda('')}><X size={16} /></button>}
            </div>
            
            {!verFavoritos && (
              <button className="filter-trigger-btn" onClick={() => setMenuFiltrosAbierto(true)}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <Filter size={18} /> <span>Filtrar por Modelo</span>
                </div>
                {filtroModeloActivo ? <span className="filter-active-tag">{filtroModeloActivo}</span> : <ChevronRight size={18} color="#9ca3af"/>}
              </button>
            )}
            {verFavoritos && <div style={{textAlign:'center', fontWeight:'bold', marginTop:'10px'}}>❤️ Tus Favoritos ({productosFiltrados.length})</div>}
          </div>

          <div className="product-grid">
            {productosVisibles.map((p) => (
              <ProductCard 
                key={p.id} 
                p={p} 
                onAdd={agregarCarrito} 
                onZoom={setImagenZoom} 
                modeloActivo={filtroModeloActivo} 
                isFav={favoritos.includes(p.id)} 
                toggleFav={toggleFavorito} 
              />
            ))}
          </div>

          {productosVisibles.length === 0 && (
            <div style={{textAlign:'center', padding:'60px 20px', color:'#9ca3af'}}>
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

      {/* MODALES Y MENÚS */}
      {menuFiltrosAbierto && (
        <div className="filter-overlay" onClick={() => setMenuFiltrosAbierto(false)}>
          <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="filter-drawer-header">
              <span className="filter-drawer-title"><Filter size={20} /> Modelos</span>
              <button onClick={() => setMenuFiltrosAbierto(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24} color="#6b7280"/></button>
            </div>
            <div className="filter-list">
              <button className={`filter-item ${filtroModeloActivo === '' ? 'active' : ''}`} onClick={() => { setFiltroModeloActivo(''); setBusqueda(''); setMenuFiltrosAbierto(false); }}> Todos los modelos {filtroModeloActivo === '' && <Check size={18}/>} </button>
              {MODELOS_FIJOS.map(modelo => (
                <button key={modelo} className={`filter-item ${filtroModeloActivo === modelo ? 'active' : ''}`} onClick={() => { setFiltroModeloActivo(modelo); setBusqueda(''); setMenuFiltrosAbierto(false); }}> {modelo} {filtroModeloActivo === modelo && <Check size={18}/>} </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {imagenZoom && (
        <div className="lightbox" onClick={() => setImagenZoom(null)}>
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
              {carrito.length === 0 ? (
                <div style={{textAlign:'center', color:'#9ca3af', marginTop:'50px'}}>Tu carrito está vacío 😢</div>
              ) : (
                carrito.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="cart-item">
                    <img src={item.imagen} alt={item.nombre} className="cart-item-img" />
                    <div className="cart-item-details">
                      <h4>{item.nombre}</h4>
                      <p>${item.precio.toFixed(2)}</p>
                      <div className="cart-controls">
                        <span style={{fontSize:'0.9rem'}}>Cant: {item.cantidad}</span>
                        <button onClick={()=>eliminarDelCarrito(item.id)} style={{color:'#ef4444', background:'none', border:'none', cursor:'pointer'}}>Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {carrito.length > 0 && (
              <div className="cart-footer">
                <div className="total-row"><span>Total:</span><span>${precioTotal.toFixed(2)}</span></div>
                <button className="checkout-btn" onClick={enviarPedido}> <MessageCircle size={20}/> Pedir por WhatsApp </button>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmandoLimpiar && (
        <div className="modal-confirm-overlay">
          <div className="modal-confirm">
            <AlertTriangle size={40} color="#ef4444" style={{marginBottom:'10px'}}/>
            <h3>¿Vaciar carrito?</h3>
            <p>Se eliminarán todos los productos.</p>
            <div className="modal-actions">
              <button onClick={()=>setConfirmandoLimpiar(false)} className="btn-cancel">Cancelar</button>
              <button onClick={()=>{setCarrito([]); setConfirmandoLimpiar(false);}} className="btn-confirm">Sí, vaciar</button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        <button className="nav-item active" onClick={() => { setVerFavoritos(false); window.scrollTo({top:0, behavior:'smooth'}); }}> <Home size={24} /> <span>Inicio</span> </button>
        <button className="nav-item" onClick={irABuscador}> <Search size={24} /> <span>Buscar</span> </button>
        <button className="nav-item" onClick={() => setCarritoAbierto(true)}> 
          <div style={{position:'relative'}}> <ShoppingCart size={24} /> {cantidadTotal > 0 && <span className="nav-badge">{cantidadTotal}</span>} </div> 
          <span>Mi Pedido</span> 
        </button>
      </div>
    </>
  );
}