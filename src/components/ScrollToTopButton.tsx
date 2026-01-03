import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button 
      onClick={scrollToTop}
      className="fixed z-40 bg-slate-900 text-white p-3 rounded-full shadow-xl hover:bg-red-600 transition-all duration-300 animate-bounce bottom-20 right-4 md:bottom-8 md:right-8"
      aria-label="Volver arriba"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
};