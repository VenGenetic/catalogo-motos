import { Link } from 'react-router-dom';
import { Bike, ChevronDown, CircleHelp, Menu, MessageCircle, Moon, ShoppingCart, Sun } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useMoto } from '../context/MotoContext';
import { useDespiece } from '../utils/cargarDespiece';
import { APP_CONFIG, ORDEN_SECCIONES, nombreDeModelo } from '../config/constants';
import { trackContact } from '../utils/tracking';
import { buildWhatsAppUrl } from '../utils/attribution';
import { Producto } from '../types';
import { SearchBar } from './SearchBar';
import { nombreCorto } from './SirvePara';

/*
  Barra de arriba, fija. En el celular mide 56 px: logo, buscador y pedido; lo
  demás va en la barra de abajo. En la computadora suma la moto y una segunda
  fila con los sistemas.
*/

interface Props {
  busqueda: string;
  buscar: (texto: string) => void;
  productos: Producto[];
  /** La moto que se está viendo (para el texto del buscador). */
  filtroModelo: string;
}

export const Navbar = ({ busqueda, buscar, productos, filtroModelo }: Props) => {
  const { cartCount, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { abrirSelector, miMoto } = useMoto();
  const { despiece } = useDespiece();

  const moto = filtroModelo || miMoto;
  const placeholder = filtroModelo ? `Buscar en ${nombreCorto(nombreDeModelo(filtroModelo, despiece))}…` : 'Buscar repuesto o código…';

  const cotizar = () => {
    trackContact('navbar_cotizar');
    window.open(buildWhatsAppUrl(APP_CONFIG.WHATSAPP_NUMBER, 'Hola LV PARTS, quisiera cotizar unos repuestos.'), '_blank');
  };

  return (
    <header className="sticky top-0 z-nav bg-brand-bg text-white shadow-[0_2px_8px_rgba(0,0,0,.28)]">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-2 px-2 sm:gap-3 sm:px-5 lg:h-[72px] lg:gap-6 lg:px-8">
        <Link to="/" className="group flex shrink-0 items-center gap-2" aria-label="LV PARTS - Inicio">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 lg:h-12 lg:w-12">
            <img src="/logo.svg" alt="" className="h-full w-full object-contain" />
          </span>
          <span className="hidden font-anton text-[1.7rem] uppercase leading-none tracking-wide md:block lg:text-[2rem]">
            LV <span className="text-brand-orange">PARTS</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={abrirSelector}
          aria-haspopup="dialog"
          className="hidden min-h-12 max-w-[15rem] shrink-0 items-center gap-2 rounded-lg border border-white/15 px-3 text-left text-sm font-bold text-white transition-colors hover:border-brand-orange lg:flex"
        >
          <Bike size={20} className="shrink-0 text-brand-orange" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold leading-none text-white/60">Tu moto</span>
            <span className="block truncate leading-tight">{moto ? nombreCorto(nombreDeModelo(moto, despiece)) : 'Elegir moto'}</span>
          </span>
          <ChevronDown size={16} className="shrink-0 text-white/60" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <SearchBar busqueda={busqueda} setBusqueda={buscar} productos={productos} placeholder={placeholder} />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Link to="/contacto" className="hidden min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-bold text-white/90 hover:text-brand-orange xl:flex">
            <CircleHelp size={20} aria-hidden="true" /> Ayuda
          </Link>
          <button onClick={toggleTheme} className="hidden h-11 w-11 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-brand-orange md:flex" aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={openCart} className="relative flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 text-white hover:bg-white/10" aria-label={`Abrir pedido${cartCount ? ` (${cartCount})` : ''}`}>
            <ShoppingCart size={24} aria-hidden="true" />
            <span className="hidden text-sm font-bold lg:inline">Pedido</span>
            {cartCount > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-[11px] font-black text-white">{cartCount}</span>}
          </button>
        </div>
      </div>

      <nav className="hidden h-11 border-t border-white/10 bg-[#202020] lg:block" aria-label="Sistemas">
        <div className="mx-auto flex h-full max-w-[1440px] items-center px-8">
          <Link to="/catalogo?seccion=Todos" className="flex h-full shrink-0 items-center gap-2 border-r border-white/10 pr-5 text-xs font-extrabold uppercase tracking-wide text-white hover:text-brand-orange">
            <Menu size={17} aria-hidden="true" /> Todos los repuestos
          </Link>
          <div className="flex h-full min-w-0 flex-1 items-center overflow-hidden">
            {ORDEN_SECCIONES.filter(s => s !== 'Todos').slice(0, 8).map(s => (
              <Link key={s} to={`/catalogo${moto && filtroModelo ? `/${filtroModelo}` : ''}?seccion=${encodeURIComponent(s)}`} className="flex h-full shrink-0 items-center px-3.5 text-[13px] font-bold text-white/85 transition-colors hover:bg-white/5 hover:text-brand-orange xl:px-4">
                {s}
              </Link>
            ))}
          </div>
          <button onClick={cotizar} className="flex h-full shrink-0 items-center gap-2 border-l border-white/10 pl-5 text-xs font-extrabold uppercase tracking-wide text-[#5bea8d] hover:text-white">
            <MessageCircle size={17} aria-hidden="true" /> Cotizar por WhatsApp
          </button>
        </div>
      </nav>
    </header>
  );
};
