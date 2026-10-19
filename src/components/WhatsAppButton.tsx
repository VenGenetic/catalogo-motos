import { MessageCircle } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { trackContact } from '../utils/tracking';
import { useState, useEffect } from 'react';
import { buildWhatsAppUrl } from '../utils/attribution';

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
    window.open(buildWhatsAppUrl(APP_CONFIG.WHATSAPP_NUMBER), '_blank');
  };

  // Ocultar si se especifica y el modal está abierto
  if (hideWhenModalOpen) return null;

  return (
    <button
      onClick={handleClick}
      // Solo en PC ('hidden md:flex'): en móvil el contacto va por la barra inferior.
      // 'z-floating' para que quede encima del contenido.
      className={`group fixed bottom-6 right-6 z-floating hidden h-[52px] items-center justify-center gap-2 rounded-full bg-wa px-4 text-brand-bg shadow-xl transition-all duration-500 hover:bg-wa-hover hover:shadow-wa/25 md:flex ${
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
