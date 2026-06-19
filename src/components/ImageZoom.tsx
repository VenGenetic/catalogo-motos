import { useState, useEffect, useRef } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageZoom = ({ src, alt, className }: ImageZoomProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Zoom and Pan states (Mobile Touch focused)
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  // Gesture tracking refs
  const touchStartRef = useRef({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    dist: 0,
    scale: 1,
    posX: 0,
    posY: 0,
    center: { x: 0, y: 0 },
    isDragging: false,
    isPinching: false,
  });

  const lastTouchTimeRef = useRef(0);

  // Reiniciar estado de error si la imagen origen cambia (ej. al deslizar productos)
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Reset zoom state on modal close or image source change
  useEffect(() => {
    if (!isModalOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsAnimating(false);
    }
  }, [isModalOpen, src]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Manejar el botón de retroceso del navegador
  useEffect(() => {
    if (isModalOpen) {
      // Push state para manejar el back button
      window.history.pushState({ imageZoom: true }, '');
      
      const handlePopState = (e: PopStateEvent) => {
        if (e.state && e.state.imageZoom) {
          closeModal();
          // Prevenir el comportamiento por defecto del back
          e.preventDefault();
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    } else {
      // Si el modal se cierra, quitar el state si existe
      if (window.history.state && window.history.state.imageZoom) {
        window.history.back();
      }
    }
  }, [isModalOpen]);

  // Mobile gesture touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    e.stopPropagation(); // Evitar propagación para no activar swipe navigation de fondo
    
    const now = Date.now();
    const timeDiff = now - lastTouchTimeRef.current;
    const touches = e.touches;
    
    // Doble toque (Double tap) para zoom rápido
    if (touches.length === 1 && timeDiff < 300) {
      e.preventDefault();
      setIsAnimating(true);
      if (scale > 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else {
        setScale(2.5);
        // Centrar zoom cerca del toque
        const touch = touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        const touchX = touch.clientX - rect.left - rect.width / 2;
        const touchY = touch.clientY - rect.top - rect.height / 2;
        setPosition({
          x: -touchX * 1.5,
          y: -touchY * 1.5
        });
      }
      lastTouchTimeRef.current = 0;
      return;
    }
    
    if (touches.length === 1) {
      lastTouchTimeRef.current = now;
      const touch = touches[0];
      setIsAnimating(false);
      touchStartRef.current = {
        x1: touch.clientX,
        y1: touch.clientY,
        x2: 0,
        y2: 0,
        dist: 0,
        scale: scale,
        posX: position.x,
        posY: position.y,
        center: { x: 0, y: 0 },
        isDragging: scale > 1, // Solo arrastrar si ya tiene zoom
        isPinching: false,
      };
    } else if (touches.length === 2) {
      const t1 = touches[0];
      const t2 = touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const centerX = (t1.clientX + t2.clientX) / 2;
      const centerY = (t1.clientY + t2.clientY) / 2;
      
      setIsAnimating(false);
      touchStartRef.current = {
        x1: t1.clientX,
        y1: t1.clientY,
        x2: t2.clientX,
        y2: t2.clientY,
        dist,
        scale: scale,
        posX: position.x,
        posY: position.y,
        center: { x: centerX, y: centerY },
        isDragging: false,
        isPinching: true,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLImageElement>) => {
    e.stopPropagation(); // Bloquear propagación para evitar gestos de cambio de producto
    
    const touches = e.touches;
    const start = touchStartRef.current;
    
    if (touches.length === 1 && start.isDragging) {
      const touch = touches[0];
      const deltaX = touch.clientX - start.x1;
      const deltaY = touch.clientY - start.y1;
      
      const newX = start.posX + deltaX;
      const newY = start.posY + deltaY;
      
      // Limitar el arrastre para que la imagen no se pierda de la pantalla
      const maxOffsetWidth = ((scale - 1) * window.innerWidth) / 2;
      const maxOffsetHeight = ((scale - 1) * window.innerHeight) / 2;
      
      const limitX = Math.max(-maxOffsetWidth, Math.min(maxOffsetWidth, newX));
      const limitY = Math.max(-maxOffsetHeight, Math.min(maxOffsetHeight, newY));
      
      setPosition({ x: limitX, y: limitY });
    } else if (touches.length === 2 && start.isPinching) {
      const t1 = touches[0];
      const t2 = touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      
      const factor = dist / start.dist;
      const newScale = Math.max(1, Math.min(start.scale * factor, 4));
      setScale(newScale);
      
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      } else {
        const currentCenterX = (t1.clientX + t2.clientX) / 2;
        const currentCenterY = (t1.clientY + t2.clientY) / 2;
        const dx = currentCenterX - start.center.x;
        const dy = currentCenterY - start.center.y;
        
        // Limitar la posición del zoom
        const maxOffsetWidth = ((newScale - 1) * window.innerWidth) / 2;
        const maxOffsetHeight = ((newScale - 1) * window.innerHeight) / 2;
        
        const limitX = Math.max(-maxOffsetWidth, Math.min(maxOffsetWidth, start.posX + dx));
        const limitY = Math.max(-maxOffsetHeight, Math.min(maxOffsetHeight, start.posY + dy));
        
        setPosition({ x: limitX, y: limitY });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLImageElement>) => {
    e.stopPropagation();
    
    // Si la escala está muy cerca a 1, resetear por completo
    if (scale < 1.1) {
      setIsAnimating(true);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
    
    touchStartRef.current.isDragging = false;
    touchStartRef.current.isPinching = false;
  };

  return (
    <>
      {/* IMAGEN ORIGINAL - Clickable para abrir modal */}
      <div
        className={`w-full h-full overflow-hidden relative cursor-pointer bg-white flex items-center justify-center animate-fade-in group ${className || ''}`}
        onClick={openModal}
      >
        <img
          src={hasError ? '/sin_imagen.webp' : src}
          alt={hasError ? 'Sin imagen' : alt}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          draggable={false}
          onError={() => setHasError(true)}
        />

        {/* Overlay con icono de zoom */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <ZoomIn size={20} className="text-gray-700" />
          </div>
        </div>
      </div>

      {/* MODAL DE IMAGEN EN PANTALLA COMPLETA */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={closeModal}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200"
          >
            <X size={24} />
          </button>

          {/* Imagen en pantalla completa - Optimizada para el aspecto ratio 1024x535 */}
          <div 
            className="w-full h-full max-w-6xl max-h-[95vh] p-2 md:p-4 flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={hasError ? '/sin_imagen.webp' : src}
              alt={hasError ? 'Sin imagen' : alt}
              className="w-full h-full object-contain select-none"
              draggable={false}
              onError={() => setHasError(true)}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isAnimating ? 'transform 0.2s ease-out' : 'none',
                touchAction: 'none',
                maxHeight: '100%',
                maxWidth: '100%',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          {/* Indicador de cómo cerrar / Zoom */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full flex flex-col items-center gap-1">
            <span className="flex items-center gap-2">
              <X size={14} />
              Toca fuera para cerrar
            </span>
            <span className="text-[10px] text-gray-300">
              Pellizca con dos dedos para ampliar
            </span>
          </div>
        </div>
      )}
    </>
  );
};