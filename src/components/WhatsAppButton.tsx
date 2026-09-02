import { MessageCircle } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { trackContact } from '../utils/tracking';
import { useState, useEffect } from 'react';

interface WhatsAppButtonProps {
  hideWhenModalOpen?: boolean;
}

export const WhatsAppButton = ({ hideWhenModalOpen = false }: WhatsAppButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeño retardo para no estorbar la carga inicial
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    trackContact('boton_flotante');
    window.open(`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}`, '_blank');
  };

  // Ocultar si se especifica y el modal está abierto
  if (hideWhenModalOpen) return null;

  return (
    <button
      onClick={handleClick}
      // CAMBIOS CLAVE AQUÍ:
      // 1. 'bottom-24' en móvil (para subirlo arriba del menú) y 'md:bottom-6' en PC.
      // 2. 'z-[70]' para asegurarnos que esté ENCIMA de todo (modales, menús, etc).
      className={`group fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-3 z-floating flex h-[52px] w-[52px] items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-brand-bg shadow-xl transition-all duration-500 hover:bg-[#20bd5a] hover:shadow-green-500/25 md:bottom-6 md:right-6 md:w-auto md:rounded-full md:px-4 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-6 w-6 fill-current" />
      
      {/* Texto: mostrar 'Whatsapp' en pantallas medianas+ y al hover en desktop */}
      <span className="hidden pr-1 text-sm font-bold md:inline-block">
        Whatsapp
      </span>
      
      {/* Punto de notificación */}
    </button>
  );
};
