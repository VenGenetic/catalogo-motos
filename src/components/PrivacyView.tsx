import { ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { buildWhatsAppUrl } from '../utils/attribution';

// Política de privacidad. Google la exige para publicar la app OAuth con la que
// se administran las campañas de Google Ads, y la muestra en su pantalla de
// consentimiento. Tiene que describir lo que el sitio y el agente de WhatsApp
// hacen de verdad: si cambia lo que se guarda, se actualiza esta página.

const Seccion = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-base font-bold text-ui-ink">{titulo}</h2>
    <div className="space-y-2 text-sm leading-relaxed text-ui-copy">{children}</div>
  </section>
);

const PrivacyView = () => (
  <div className="min-h-screen bg-ui-canvas px-4 pb-28 pt-8 font-sans text-ui-ink transition-colors md:py-12">
    <div className="mx-auto max-w-2xl space-y-6">

      <div className="surface-card rounded-[1.5rem] p-6 animate-rise md:p-8">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-orange/15 bg-brand-orange/10">
          <ShieldCheck className="h-7 w-7 text-brand-orange-action dark:text-brand-orange" />
        </div>
        <h1 className="mb-1 text-2xl font-bold text-ui-ink">Política de privacidad</h1>
        <p className="text-xs text-ui-copy">Última actualización: 21 de octubre de 2026</p>
      </div>

      <div className="stagger surface-card space-y-6 rounded-[1.5rem] p-6 animate-rise md:p-8" style={{ '--i': 2 } as React.CSSProperties}>
        <Seccion titulo="Quiénes somos">
          <p>
            LV PARTS (Love Daytona) vende repuestos originales de motos Daytona en Ecuador, a través de
            este sitio, de nuestra tienda y de WhatsApp (+593 99 327 9707).
            Esta página explica qué datos tuyos usamos y para qué.
          </p>
        </Seccion>

        <Seccion titulo="Qué datos recogemos">
          <p>
            <b className="text-ui-ink">En este sitio</b> no te pedimos nombre, correo ni teléfono. Si llegas desde un
            anuncio, guardamos el identificador de ese clic que agregan Google o Meta, los datos de la campaña y la
            página por la que entraste, junto con un código corto que viaja en el mensaje de WhatsApp que el sitio
            prepara por ti. Google Ads (y Meta, cuando está activo) usan sus propias cookies para medir los anuncios.
          </p>
          <p>
            <b className="text-ui-ink">Por WhatsApp</b> recibimos tu número, tu nombre de perfil, los mensajes, fotos y
            comprobantes de pago que nos envíes y, si pides un envío, los datos de entrega.
          </p>
        </Seccion>

        <Seccion titulo="Para qué los usamos">
          <p>
            Para responder tus consultas, confirmar stock y precios, preparar tu pedido, coordinar el envío y registrar
            tu pago. Parte de las respuestas por WhatsApp las da un asistente automático que lee tus mensajes para
            encontrar el repuesto que buscas, y que puede apoyarse en servicios de inteligencia artificial de
            terceros. Una persona del equipo revisa los casos que lo necesitan.
          </p>
          <p>
            También medimos qué anuncios nos traen clientes. Para eso le informamos a Google Ads o a Meta que un clic
            terminó en una conversación o en un pago, usando el identificador del clic. No les enviamos el contenido
            de tus mensajes.
          </p>
        </Seccion>

        <Seccion titulo="Con quién los compartimos">
          <p>
            Solo con los proveedores que hacen funcionar el servicio: alojamiento y base de datos, WhatsApp,
            Google y Meta (para medir anuncios) y la empresa de transporte cuando hay un envío. No vendemos tus datos.
          </p>
        </Seccion>

        <Seccion titulo="Cuánto tiempo los guardamos">
          <p>
            Mientras tengamos una relación comercial contigo y durante el tiempo que exijan las normas tributarias y
            contables del Ecuador.
          </p>
        </Seccion>

        <Seccion titulo="Tus derechos">
          <p>
            Según la Ley Orgánica de Protección de Datos Personales del Ecuador, puedes pedir ver, corregir o eliminar
            tus datos, u oponerte a que los usemos. Escríbenos por WhatsApp y lo atendemos.
          </p>
        </Seccion>

        <Seccion titulo="Herramientas de Google que usamos">
          <p>
            LV PARTS usa la API de Google Ads solo para administrar sus propias campañas de publicidad. Esa
            herramienta no accede a datos de las cuentas de Google de otras personas.
          </p>
        </Seccion>

        <a
          href={buildWhatsAppUrl(APP_CONFIG.WHATSAPP_NUMBER)}
          target="_blank"
          rel="noopener noreferrer"
          className="press flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-wa py-4 font-bold text-brand-bg shadow-lg shadow-wa/20 hover:bg-wa-hover"
        >
          Escribirnos por WhatsApp
        </a>
      </div>

    </div>
  </div>
);

export default PrivacyView;
