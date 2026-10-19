import { ArrowUpDown, CircleDot, Cog, Disc, HardHat, LayoutGrid, Link, Package, Shield, SlidersHorizontal, Wind, Zap, type LucideIcon } from 'lucide-react';

/** Un ícono por sistema del despiece (utils/sistemas.ts). */
const ICONOS: Record<string, LucideIcon> = {
  Todos: LayoutGrid,
  Motor: Cog,
  'Transmisión': Link,
  'Sistema eléctrico': Zap,
  Frenos: Disc,
  'Suspensión y dirección': ArrowUpDown,
  Ruedas: CircleDot,
  'Chasis y carrocería': Shield,
  Escape: Wind,
  'Manubrio y mandos': SlidersHorizontal,
  Accesorios: HardHat,
  Otros: Package,
};

export const IconoSistema = ({ sistema, size = 18, className }: { sistema: string; size?: number; className?: string }) => {
  const Icono = ICONOS[sistema] ?? Package;
  return <Icono size={size} className={className} aria-hidden="true" />;
};
