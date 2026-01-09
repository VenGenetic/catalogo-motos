import { MessageCircle } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { useState, useEffect } from 'react';

export const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeño retardo para no estorbar la carga inicial
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    window.open(`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      // CAMBIOS CLAVE AQUÍ:
      // 1. 'bottom-24' en móvil (para subirlo arriba del menú) y 'md:bottom-6' en PC.
      // 2. 'z-[70]' para asegurarnos que esté ENCIMA de todo (modales, menús, etc).
      className={`fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[70] flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-full shadow-xl hover:shadow-green-500/30 transition-all duration-500 transform group ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-current animate-bounce-slow" />
      
      {/* Texto visible solo al pasar el mouse en PC */}
      <span className="font-bold text-sm pr-1 hidden group-hover:inline-block md:inline-block">
        ¿Necesitas ayuda?
      </span>
      
      {/* Punto de notificación rojo */}
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
    </button>
  );
};