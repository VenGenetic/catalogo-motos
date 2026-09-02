import { Phone, Users, Clock, MapPin } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { trackContact } from '../utils/tracking';

const ContactView = () => (
  <div className="min-h-screen bg-ui-canvas px-4 pb-28 pt-8 font-sans text-ui-ink transition-colors md:py-12">
    <div className="mx-auto max-w-xl space-y-6">

      {/* Tarjeta Principal */}
      <div className="surface-card rounded-[1.5rem] p-6 text-center md:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-orange/15 bg-brand-orange/10">
          <Phone className="w-8 h-8 text-brand-orange" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-ui-ink">Hablemos por WhatsApp</h2>
        <p className="mb-8 text-sm leading-relaxed text-ui-copy">
          Nuestros asesores técnicos están listos para confirmar stock y ayudarte con tu pedido.
        </p>

        <a
          href={`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContact('pagina_contacto')}
          className="mb-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 font-bold text-brand-bg shadow-lg shadow-green-500/15 transition-all hover:bg-[#20bd5a] active:scale-[0.98]"
        >
          <Phone className="w-5 h-5 fill-current" />
          Iniciar Chat con Asesor
        </a>

        <p className="text-xs text-ui-copy">
          Tiempo de respuesta promedio: menos de 5 min
        </p>
      </div>

      {/* Tarjeta de Información Adicional */}
      <div className="surface-card overflow-hidden rounded-[1.5rem]">
        <div className="flex items-center gap-4 border-b border-ui-border p-4">
          <div className="rounded-xl bg-brand-orange/10 p-2 text-brand-orange">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ui-ink">Atención Experta</h3>
            <p className="text-xs text-ui-copy">Te ayudamos a encontrar la pieza exacta</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-b border-ui-border p-4">
          <div className="rounded-xl bg-brand-orange/10 p-2 text-brand-orange">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ui-ink">Horario de Atención</h3>
            <p className="text-xs text-ui-copy">Lun - Sáb: 9:00 AM - 6:00 PM</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-b border-ui-border p-4">
          <div className="rounded-xl bg-[#25D366]/10 p-2 text-[#168b4c] dark:text-[#54e38b]">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ui-ink">Teléfono / WhatsApp</h3>
            <p className="font-mono text-xs font-bold text-ui-copy">+593 99 327 9707</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-b border-ui-border p-4">
          <div className="rounded-xl bg-brand-orange/10 p-2 text-brand-orange">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ui-ink">Envíos Nacionales</h3>
            <p className="text-xs text-ui-copy">Cobertura a todo el Ecuador</p>
          </div>
        </div>

        <a
          href="https://maps.app.goo.gl/xj8vjxQYTpfZ7XhRA"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[68px] items-center gap-4 p-4 transition-colors hover:bg-ui-muted"
        >
          <div className="bg-brand-orange/10 p-2 rounded-lg shrink-0">
            <MapPin className="w-5 h-5 text-brand-orange" />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-bold text-ui-ink">Nuestra Ubicación</h3>
            <p className="text-xs font-bold text-brand-orange hover:underline">Ver en Google Maps</p>
          </div>
        </a>
      </div>

    </div>
  </div>
);

// IMPORTANTE: Usamos export default para que funcione correctamente con lazy() en App.tsx
export default ContactView;
