import { BadgeCheck, Truck, Phone } from 'lucide-react';

export const TopBanner = () => {
  return (
    <div className="relative z-floating bg-brand-orange-action px-4 py-1.5 font-geist text-[10px] font-extrabold uppercase tracking-wide text-white md:text-[11px]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between">
        
        {/* Mensaje Móvil (Cambia automáticamente o muestra el más importante) */}
        <div className="md:hidden w-full text-center flex items-center justify-center gap-2">
           <Truck size={12} className="fill-current" />
           <span>Envíos a todo Ecuador</span>
        </div>

        {/* Mensajes Desktop (Se ven los 3) */}
        <div className="hidden md:flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <BadgeCheck size={14} />
            <span>Repuestos originales Daytona</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={14} />
            <span>Despachos nacionales</span>
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
