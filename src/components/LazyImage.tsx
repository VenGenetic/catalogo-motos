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
        decoding="async" // Ayuda al navegador a decodificar fuera del hilo principal
        onLoad={() => setIsLoaded(true)}
        onError={() => { setHasError(true); setIsLoaded(true); }}
        // CAMBIO: transition-opacity en lugar de transition-all para mejor rendimiento
        className={`w-full h-full ${fitClass} ${cropClasses} object-center transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};