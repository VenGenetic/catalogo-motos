import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  cropBottom?: boolean; 
  imageFit?: 'cover' | 'contain';
}

export const LazyImage = ({ src, alt, className, style, onClick, cropBottom = false, imageFit = 'cover' }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const cropClasses = cropBottom ? '' : '';
  const fitClass = imageFit === 'contain' ? 'object-contain' : 'object-cover';

  // Detectar si es conexión lenta (para móviles)
  const isSlowConnection = typeof navigator !== 'undefined' &&
    'connection' in navigator &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((navigator as any).connection?.effectiveType === 'slow-2g' ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).connection?.effectiveType === '2g');

  return (
    <div
      className={`relative overflow-hidden bg-white ${className || ''}`}
      style={style}
      onClick={onClick}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse z-10 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}

      <img
        src={hasError ? 'https://via.placeholder.com/400x300?text=Sin+Imagen' : src}
        alt={alt || 'Producto'}
        loading={isSlowConnection ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => { setHasError(true); setIsLoaded(true); }}
        className={`w-full h-full ${fitClass} ${cropClasses} object-center transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        // Optimizar para móviles
        style={{
          imageRendering: isSlowConnection ? 'pixelated' : 'auto'
        }}
      />
    </div>
  );
};