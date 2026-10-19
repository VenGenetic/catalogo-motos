import { Link, useLocation } from 'react-router-dom';
import { Bike, Home, LayoutGrid, MessageCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMoto } from '../context/MotoContext';

/*
  Barra de abajo del celular: lo que se usa con el pulgar. "Mi moto" abre el
  despiece de la moto recordada, o el selector si todavía no eligió una.
*/

const base = 'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors active:scale-95';

export const BottomNav = () => {
  const { cartCount, openCart } = useCart();
  const { miMoto, elegirMoto, abrirSelector } = useMoto();
  const { pathname } = useLocation();

  const enCatalogo = pathname.startsWith('/catalogo');
  const enMiMoto = Boolean(miMoto && pathname === `/catalogo/${miMoto}`);
  const color = (activo: boolean) => activo ? 'text-brand-orange' : 'text-white/70';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-nav flex border-t border-white/10 bg-brand-bg px-1 pb-[env(safe-area-inset-bottom)] font-geist shadow-[0_-4px_24px_rgba(0,0,0,0.18)] md:hidden" aria-label="Navegación principal">
      <Link to="/" className={`${base} ${color(pathname === '/')}`} aria-current={pathname === '/' ? 'page' : undefined}>
        <Home className="h-[22px] w-[22px]" aria-hidden="true" />
        Inicio
      </Link>
      <Link to="/catalogo" className={`${base} ${color(enCatalogo && !enMiMoto)}`} aria-current={enCatalogo && !enMiMoto ? 'page' : undefined}>
        <LayoutGrid className="h-[22px] w-[22px]" aria-hidden="true" />
        Catálogo
      </Link>
      <button type="button" onClick={() => (miMoto ? elegirMoto(miMoto) : abrirSelector())} className={`${base} ${color(enMiMoto)}`}>
        <Bike className="h-[22px] w-[22px]" aria-hidden="true" />
        Mi moto
      </button>
      <button type="button" onClick={openCart} className={`${base} ${color(false)}`} aria-label={`Pedido${cartCount ? ` (${cartCount})` : ''}`}>
        <span className="relative">
          <ShoppingCart className="h-[22px] w-[22px]" aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-black text-white">
              {cartCount}
            </span>
          )}
        </span>
        Pedido
      </button>
      <Link to="/contacto" className={`${base} ${color(pathname === '/contacto')}`} aria-current={pathname === '/contacto' ? 'page' : undefined}>
        <MessageCircle className="h-[22px] w-[22px]" aria-hidden="true" />
        Ayuda
      </Link>
    </nav>
  );
};
