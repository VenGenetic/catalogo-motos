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
      className={`fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 z-floating flex h-12 w-12 items-center justify-center rounded-2xl border border-ui-border bg-ui-surface/92 text-ui-ink shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-brand-orange/25 hover:bg-brand-orange hover:text-brand-bg md:bottom-8 md:left-8 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
      aria-label="Volver arriba"
    >
      <ArrowUp size={20} />
    </button>
  );
};
