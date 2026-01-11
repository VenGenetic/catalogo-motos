import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageZoom = ({ src, alt, className }: ImageZoomProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* IMAGEN ORIGINAL - Clickable para abrir modal */}
      <div
        className={`w-full h-full overflow-hidden relative cursor-pointer bg-white flex items-center justify-center animate-fade-in group ${className || ''}`}
        onClick={openModal}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          draggable={false}
        />

        {/* Overlay con icono de zoom */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <ZoomIn size={20} className="text-gray-700" />
          </div>
        </div>
      </div>

      {/* MODAL DE IMAGEN EN PANTALLA COMPLETA */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={closeModal}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200"
          >
            <X size={24} />
          </button>

          {/* Imagen en pantalla completa */}
          <div className="w-full h-full max-w-5xl max-h-[90vh] p-4 flex items-center justify-center">
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain animate-fade-in"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          </div>

          {/* Indicador de cómo cerrar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full flex items-center gap-2">
            <X size={16} />
            Toca fuera para cerrar
          </div>
        </div>
      )}
    </>
  );
};