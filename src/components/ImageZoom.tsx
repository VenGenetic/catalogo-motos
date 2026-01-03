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

  return (
    <div 
      ref={imgRef}
      className="w-full h-full overflow-hidden relative cursor-zoom-in touch-manipulation"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onMouseMove={handleMouseMove}
      onClick={() => setIsActive(!isActive)}
    >
      <img 
        src={src} 
        alt={alt}
        style={{ 
          clipPath: 'inset(0 0 25% 0)',
          transformOrigin: `${position.x}% ${position.y}%`
        }}
        className={`w-full h-full object-cover object-top transition-transform duration-200 ease-out ${isActive ? 'scale-[2.5]' : 'scale-100'}`}
        loading="lazy"
      />
    </div>
  );
};