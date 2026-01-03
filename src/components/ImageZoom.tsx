import { useState, useRef } from 'react';

export const ImageZoom = ({ src, alt }: { src: string, alt: string }) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!imgRef.current || !isActive) return;
    const touch = e.touches[0];
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((touch.clientX - left) / width) * 100;
    const y = ((touch.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div 
      ref={imgRef}
      className="w-full h-full overflow-hidden relative cursor-zoom-in touch-manipulation bg-white flex items-center justify-center animate-fade-in"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={() => setIsActive(!isActive)}
    >
      <img 
        src={src} 
        alt={alt}
        style={{ 
          // APLICANDO EL RECORTE SOLICITADO
          clipPath: 'inset(0 0 25% 0)',
          transformOrigin: `${position.x}% ${position.y}%`
        }}
        // CORRECCIÓN: Usamos object-cover y object-top para llenar el espacio y cortar abajo
        className={`w-full h-full object-cover object-top transition-transform duration-200 ease-out p-1 md:p-0 ${isActive ? 'scale-[2.5]' : 'scale-100'}`}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
};