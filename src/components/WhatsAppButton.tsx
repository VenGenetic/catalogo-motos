import { MessageCircle } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { useState, useEffect } from 'react';

export const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Efecto para que aparezca suavemente después de 2 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    window.open(`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-full shadow-lg hover:shadow-green-500/30 transition-all duration-500 transform group ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <MessageCircle className="w-6 h-6 fill-current animate-bounce-slow" />
      <span className="font-bold text-sm pr-1 hidden group-hover:inline-block md:inline-block">
        ¿Necesitas ayuda?
      </span>
      
      {/* Punto de notificación rojo para llamar la atención */}
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
    </button>
  );
};