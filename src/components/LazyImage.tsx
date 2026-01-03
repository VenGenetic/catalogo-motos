import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  // Nueva propiedad opcional: define cómo se ajusta la imagen
  imageFit?: 'cover' | 'contain'; 
}

export const LazyImage = ({ src, alt, className, style, onClick, imageFit = 'cover' }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Mapeamos la prop a la clase de Tailwind correspondiente
  const fitClass = imageFit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div 
      className={`relative overflow-hidden bg-white ${className || ''}`} 
      style={style} 
      onClick={onClick}
    >
      {/* Skeleton (Cargando...) */}
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
        // AQUI ESTA EL CAMBIO CLAVE: Usamos la variable fitClass y añadimos padding si es 'contain'
        className={`w-full h-full ${fitClass} ${imageFit === 'contain' ? 'p-2' : ''} transition-all duration-500 ease-out ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
      />
    </div>
  );
};