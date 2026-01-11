import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  // Eliminamos cropBottom de la interfaz
  imageFit?: 'cover' | 'contain';
}

export const LazyImage = ({ src, alt, className, style, onClick, imageFit = 'contain' }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Eliminamos la lógica de cropClasses (scale, origin-top, etc.)
  const fitClass = imageFit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div 
      className={`relative overflow-hidden bg-white ${className || ''}`} 
      style={style} 
      onClick={onClick}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse z-10 flex items-center justify-center"></div>
      )}
      
      <img
        src={hasError ? 'https://via.placeholder.com/400x300?text=Sin+Imagen' : src}
        alt={alt || 'Producto'}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => { setHasError(true); setIsLoaded(true); }}
        // CAMBIOS: 
        // 1. Quitamos ${cropClasses}
        // 2. Cambiamos object-top por object-center para que se centre naturalmente
        className={`w-full h-full ${fitClass} object-center transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};