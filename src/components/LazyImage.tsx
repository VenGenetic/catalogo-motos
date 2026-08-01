import { useState, useEffect, useRef } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  cropBottom?: boolean; 
  imageFit?: 'cover' | 'contain';
  fallbackSrc?: string; // Nuevo prop para fallback
}

export const LazyImage = ({ src, alt, className, style, onClick, cropBottom = false, imageFit = 'cover', fallbackSrc }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [triedFallback, setTriedFallback] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setTriedFallback(false);
    setIsLoaded(false);
  }, [src]);

  const cropClasses = cropBottom ? '' : '';
  const fitClass = imageFit === 'contain' ? 'object-contain' : 'object-cover';

  // Detectar si es conexión lenta (para móviles)
  const isSlowConnection = typeof navigator !== 'undefined' &&
    'connection' in navigator &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((navigator as any).connection?.effectiveType === 'slow-2g' ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).connection?.effectiveType === '2g');

  const isPlaceholder = hasError || currentSrc.includes('sin_imagen');

  const handleError = () => {
    // Si el fallback es la misma URL que ya falló (ej. ambas rutas se arman
    // con el mismo SKU), reintentarla no cambia nada y se queda pegado: en
    // ese caso pasamos directo al placeholder de "sin imagen".
    if (!triedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
      setTriedFallback(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  // Si el navegador ya tiene la imagen en caché (o el error ya ocurrió,
  // ej. un 404), el evento "load"/"error" puede dispararse antes de que
  // React alcance a enlazar los listeners, dejando el spinner pegado para
  // siempre. Lo verificamos a mano en cuanto cambia la imagen a mostrar.
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !el.complete) return;
    if (el.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      handleError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSrc]);

  return (
    <div
      className={`relative overflow-hidden bg-white dark:bg-brand-surface-2 ${className || ''}`}
      style={style}
      onClick={onClick}
    >
      {!isLoaded && !isPlaceholder && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-brand-surface-3 animate-pulse z-10 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-brand-border border-t-gray-600 dark:border-t-slate-400 rounded-full animate-spin"></div>
        </div>
      )}

      {isPlaceholder ? (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-brand-surface-1/50 p-3 text-center industrial-grid ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
           <div className="flex items-center gap-0.5 font-black text-2xl tracking-tighter opacity-30 mb-2 select-none">
             <span className="text-slate-900 dark:text-white">LV</span>
             <span className="text-brand-orange italic">PARTS</span>
           </div>
           <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 line-clamp-3 leading-snug px-2">
             {alt || 'Fotografía en proceso'}
           </span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt || 'Producto'}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={`w-full h-full ${fitClass} ${cropClasses} object-center transition-opacity duration-200 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          // Optimizar para móviles
          style={{
            imageRendering: isSlowConnection ? 'pixelated' : 'auto'
          }}
        />
      )}
    </div>
  );
};