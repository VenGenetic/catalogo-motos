import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  // Propiedad para activar el recorte inteligente (zoom)
  cropBottom?: boolean; 
  imageFit?: 'cover' | 'contain';
}

export const LazyImage = ({ src, alt, className, style, onClick, cropBottom = false, imageFit = 'cover' }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Si cropBottom es true, aplicamos la escala y el origen
  const cropClasses = cropBottom ? 'scale-[1.35] origin-top' : '';
  const fitClass = imageFit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div 
      className={`relative overflow-hidden bg-white ${className || ''}`} 
      style={style} 
      onClick={onClick}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse z-10 flex items-center justify-center">
        </div>
      )}
      
      <img
        src={hasError ? 'https://via.placeholder.com/400x300?text=Sin+Imagen' : src}
        alt={alt || 'Producto'}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        // APLICAMOS LAS CLASES DE RECORTE AQUÍ
        className={`w-full h-full ${fitClass} ${cropClasses} object-top transition-all duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};