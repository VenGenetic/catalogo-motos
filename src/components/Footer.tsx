import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, MessageCircle, Phone } from 'lucide-react';

export const Footer = () => (
  <footer className="w-full bg-brand-bg pb-28 font-sans text-white md:pb-0">
    <div className="border-b border-white/10 bg-brand-surface-1">
      <div className="mx-auto grid max-w-[1440px] divide-y divide-white/10 px-3 sm:px-5 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
        <div className="flex items-center gap-3 py-5 md:px-5"><MessageCircle className="text-brand-orange" /><div><p className="text-xs font-black uppercase tracking-wide">Asesoría por WhatsApp</p><p className="text-xs text-white/55">Confirma compatibilidad antes de comprar</p></div></div>
        <div className="flex items-center gap-3 py-5 md:px-5"><MapPin className="text-brand-orange" /><div><p className="text-xs font-black uppercase tracking-wide">Atención en Guayaquil</p><p className="text-xs text-white/55">Repuestos y soporte especializado</p></div></div>
        <div className="flex items-center gap-3 py-5 md:px-5"><Phone className="text-brand-orange" /><div><p className="text-xs font-black uppercase tracking-wide">+593 99 327 9707</p><p className="text-xs text-white/55">Lunes a sábado, 8:00 a 18:00</p></div></div>
      </div>
    </div>
    <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-10 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center bg-white p-1.5"><img src="/logo.svg" alt="" className="h-full w-full object-contain" /></span>
          <div className="font-anton text-3xl uppercase tracking-wide">LV <span className="text-brand-orange">PARTS</span></div>
        </div>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">Catálogo de repuestos originales para motos Daytona, con stock actualizado, asesoría y envíos a todo Ecuador.</p>
        <div className="mt-5 flex gap-2">
          <a href="https://www.facebook.com/profile.php?id=61583611217559" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center border border-white/20 text-white/70 hover:border-brand-orange hover:text-brand-orange"><Facebook size={18} /></a>
          <a href="https://www.instagram.com/love_daytona_oficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center border border-white/20 text-white/70 hover:border-brand-orange hover:text-brand-orange"><Instagram size={18} /></a>
        </div>
      </div>
      <div>
        <h2 className="border-b border-white/15 pb-3 text-xs font-black uppercase tracking-[.14em]">Comprar</h2>
        <nav className="mt-2 flex flex-col text-sm text-white/65"><Link to="/catalogo?seccion=Todos" className="flex min-h-[44px] items-center hover:text-brand-orange">Todos los repuestos</Link><Link to="/catalogo?seccion=Motor" className="flex min-h-[44px] items-center hover:text-brand-orange">Motor</Link><Link to="/catalogo?seccion=Frenos" className="flex min-h-[44px] items-center hover:text-brand-orange">Frenos</Link><Link to="/catalogo?seccion=Sistema%20el%C3%A9ctrico" className="flex min-h-[44px] items-center hover:text-brand-orange">Sistema eléctrico</Link></nav>
      </div>
      <div>
        <h2 className="border-b border-white/15 pb-3 text-xs font-black uppercase tracking-[.14em]">Ayuda</h2>
        <nav className="mt-2 flex flex-col text-sm text-white/65"><Link to="/contacto" className="flex min-h-[44px] items-center hover:text-brand-orange">Contacto</Link><Link to="/catalogo" className="flex min-h-[44px] items-center hover:text-brand-orange">Repuestos por moto</Link><a href="https://maps.app.goo.gl/xj8vjxQYTpfZ7XhRA" target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center hover:text-brand-orange">Cómo llegar</a></nav>
      </div>
    </div>
    <div className="border-t border-white/10 px-5 py-4 text-center font-geist text-[10px] uppercase tracking-[.12em] text-white/60">© {new Date().getFullYear()} LV PARTS · Repuestos originales Daytona</div>
  </footer>
);
