import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const LazyImage = ({ src, alt, className, style, onClick }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className={`relative overflow-hidden bg-gray-100 ${className || ''}`} 
      style={style} 
      onClick={onClick}
    >
      {/* Skeleton (Cargando...) - Solo se muestra si no ha cargado Y no hay error */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10 flex items-center justify-center">
           <span className="text-gray-400 text-xs">Cargando...</span>
        </div>
      )}
      
      <img
        // Si hay error, ponemos placeholder. Si no, la imagen real.
        src={hasError ? 'https://via.placeholder.com/400x300?text=Sin+Imagen' : src}
        alt={alt || 'Producto'}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true); // Marcamos como cargado para quitar el skeleton
        }}
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
      />
    </div>
  );
};