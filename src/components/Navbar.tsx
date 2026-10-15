import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, CircleHelp, Menu, MessageCircle, Moon, Search, ShoppingCart, Sun, Wrench } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { APP_CONFIG, ORDEN_SECCIONES } from '../config/constants';
import { trackContact } from '../utils/tracking';
import { buildWhatsAppUrl } from '../utils/attribution';

export const Navbar = () => {
  const { cartCount, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/catalogo?q=${encodeURIComponent(value)}` : '/catalogo');
  };

  const handleWhatsappClick = () => {
    trackContact('navbar_cotizar');
    window.open(buildWhatsAppUrl(APP_CONFIG.WHATSAPP_NUMBER, 'Hola LV PARTS, quisiera cotizar unos repuestos.'), '_blank');
  };

  return (
    <header className="sticky top-0 z-nav bg-brand-bg text-white shadow-[0_2px_8px_rgba(0,0,0,.28)]">
      <div className="mx-auto flex h-[74px] max-w-[1440px] items-center gap-3 px-3 sm:px-5 lg:h-[78px] lg:gap-7 lg:px-8">
        <Link to="/" className="group flex shrink-0 items-center gap-2" aria-label="LV PARTS - Inicio">
          <span className="flex h-11 w-11 items-center justify-center bg-white p-1.5 lg:h-12 lg:w-12">
            <img src="/logo.svg" alt="" className="h-full w-full object-contain transition-transform group-hover:scale-105" />
          </span>
          <span className="hidden font-anton text-[1.7rem] uppercase leading-none tracking-wide min-[390px]:block lg:text-[2rem]">
            LV <span className="text-brand-orange">PARTS</span>
          </span>
        </Link>

        <Link to="/catalogo" className="hidden min-h-11 shrink-0 items-center gap-2 border-l border-white/15 pl-5 text-sm font-bold text-white lg:flex">
          <Wrench size={18} className="text-brand-orange" />
          Mi moto
          <ChevronDown size={15} className="text-white/60" />
        </Link>

        <form onSubmit={search} className="relative min-w-0 flex-1">
          <label htmlFor="site-search" className="sr-only">Buscar repuestos</label>
          <input
            id="site-search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Buscar repuesto o código..."
            className="h-12 w-full border border-white/20 bg-white px-4 pr-14 text-base font-medium text-[#1c1c1c] outline-none placeholder:text-[#858585] focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/25"
          />
          <button type="submit" aria-label="Buscar" className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center bg-brand-orange text-white transition-colors hover:bg-brand-orange-action">
            <Search size={21} strokeWidth={2.4} />
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link to="/contacto" className="hidden min-h-11 items-center gap-2 px-2 text-xs font-bold text-white/90 hover:text-brand-orange xl:flex">
            <CircleHelp size={20} />
            <span>Ayuda</span>
          </Link>
          <button onClick={toggleTheme} className="hidden h-11 w-11 items-center justify-center text-white/80 hover:bg-white/10 hover:text-brand-orange sm:flex" aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={openCart} className="relative flex h-12 min-w-12 items-center justify-center gap-2 px-2 text-white hover:bg-white/10" aria-label="Abrir pedido">
            <ShoppingCart size={23} />
            <span className="hidden text-xs font-bold lg:inline">Pedido</span>
            {cartCount > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-black text-white">{cartCount}</span>}
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-white/10 bg-[#202020] lg:block" aria-label="Categorías principales">
        <div className="mx-auto flex h-11 max-w-[1440px] items-center px-8">
          <Link to="/catalogo?seccion=Todos" className="flex h-full items-center gap-2 border-r border-white/10 pr-5 text-xs font-extrabold uppercase tracking-wide text-white hover:text-brand-orange">
            <Menu size={17} /> Todos los repuestos
          </Link>
          <div className="flex h-full min-w-0 flex-1 items-center overflow-hidden">
            {ORDEN_SECCIONES.filter(section => section !== 'Todos').slice(0, 7).map(section => (
              <Link key={section} to={`/catalogo?seccion=${encodeURIComponent(section)}`} className="flex h-full shrink-0 items-center px-4 text-xs font-bold text-white/85 transition-colors hover:bg-white/5 hover:text-brand-orange">
                {section}
              </Link>
            ))}
          </div>
          <button onClick={handleWhatsappClick} className="flex h-full shrink-0 items-center gap-2 border-l border-white/10 pl-5 text-xs font-extrabold uppercase tracking-wide text-[#5bea8d] hover:text-white">
            <MessageCircle size={17} /> Cotizar por WhatsApp
          </button>
        </div>
      </nav>
    </header>
  );
};
