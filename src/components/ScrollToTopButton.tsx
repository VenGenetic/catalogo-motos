import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      // CAMBIOS DE POSICIÓN:
      // Móvil: 'bottom-24 left-4' (Izquierda, arriba del menú)
      // PC: 'md:bottom-8 md:left-8' (Izquierda, abajo) -> Lo pongo a la izquierda también en PC para no ensuciar el WhatsApp
      className={`fixed bottom-24 left-4 md:bottom-8 md:left-8 z-40 p-3 rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur-sm hover:bg-red-600 transition-all duration-300 transform border border-white/10 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
      aria-label="Volver arriba"
    >
      <ArrowUp size={20} />
    </button>
  );
};