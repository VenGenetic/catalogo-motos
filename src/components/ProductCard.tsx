import React, { useState } from 'react';
import { Heart, Maximize2, ImageOff, Plus } from 'lucide-react';
import { Producto } from '../types';
import { optimizarImagenThumbnail, optimizarImagenZoom } from '../utils';

interface ProductCardProps {
  p: Producto;
  onAdd: (p: Producto) => void;
  onZoom: (url: string) => void;
  modeloActivo: string;
  isFav: boolean;
  toggleFav: (id: string) => void;
}

const ProductCard = React.memo(({ p, onAdd, onZoom, modeloActivo, isFav, toggleFav }: ProductCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const baseUrl = p.imagen && p.imagen !== 'No imagen' && p.imagen.startsWith('http') ? p.imagen : null;
  const thumbUrl = baseUrl ? optimizarImagenThumbnail(baseUrl) : null;
  const zoomUrl = baseUrl ? optimizarImagenZoom(baseUrl) : null;

  return (
    <div className="card">
      <button 
        className={`fav-btn ${isFav ? 'active' : ''}`} 
        onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }}
        aria-label="Agregar a favoritos"
      >
        <Heart size={18} fill={isFav ? "currentColor" : "none"} strokeWidth={2} color={isFav ? "#ef4444" : "#9ca3af"}/>
      </button>

      <div className="card-img-box" onClick={() => zoomUrl && onZoom(zoomUrl)}>
        {!imgLoaded && thumbUrl && <div className="skeleton-loader"></div>}
        {thumbUrl ? (
          <>
            <img 
              src={thumbUrl} 
              alt={p.nombre} 
              loading="lazy"
              className={imgLoaded ? 'loaded' : ''}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
            />
            <div className="zoom-hint"><Maximize2 size={14}/></div>
          </>
        ) : (
          <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#e5e7eb'}}>
             <ImageOff size={30} />
          </div>
        )}
      </div>
      
      <div className="card-details">
        <span className="tag">{modeloActivo ? modeloActivo : (p.categoria === 'General' ? 'Repuesto' : p.categoria)}</span>
        <h3 className="product-name">{p.nombre}</h3>
        <div className="price-row">
          <span className="price">${Number(p.precio).toFixed(2)}</span>
          <button className="btn-add" onClick={(e) => { e.stopPropagation(); onAdd(p); }}>
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;