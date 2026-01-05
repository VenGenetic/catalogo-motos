import { Truck, CreditCard, Phone } from 'lucide-react';

export const TopBanner = () => {
  return (
    <div className="bg-red-600 text-white text-[10px] md:text-xs font-bold py-2 px-4 relative z-[60]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Mensaje Móvil (Cambia automáticamente o muestra el más importante) */}
        <div className="md:hidden w-full text-center flex items-center justify-center gap-2">
           <Truck size={12} className="fill-current" />
           <span>Envíos seguros a todo el Ecuador 🇪🇨</span>
        </div>

        {/* Mensajes Desktop (Se ven los 3) */}
        <div className="hidden md:flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <Truck size={14} />
            <span>Envíos Nacionales</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={14} />
            <span>Pagos vía Transferencia / Depósito</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Phone size={14} />
          <span>Soporte: +593 99 327 9707</span>
        </div>
      </div>
    </div>
  );
};