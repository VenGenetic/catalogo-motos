// src/components/ImageZoom.tsx
import { useState, useRef } from 'react';

export const ImageZoom = ({ src, alt }: { src: string, alt: string }) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);

  // Manejo para Mouse (PC)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  // Manejo para Táctil (Móvil)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!imgRef.current || !isActive) return;
    const touch = e.touches[0]; // Primer dedo
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((touch.clientX - left) / width) * 100;
    const y = ((touch.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div 
      ref={imgRef}
      className="w-full h-full overflow-hidden relative cursor-zoom-in touch-manipulation bg-white"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove} // IMPORTANTE: Agregado para móvil
      onClick={() => setIsActive(!isActive)}
    >
      <img 
        src={src} 
        alt={alt}
        style={{ 
          transformOrigin: `${position.x}% ${position.y}%`
        }}
        className={`w-full h-full object-contain md:object-cover md:object-top transition-transform duration-200 ease-out ${isActive ? 'scale-[2.5]' : 'scale-100'}`}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
};