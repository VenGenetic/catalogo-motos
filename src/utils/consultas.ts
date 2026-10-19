import { APP_CONFIG } from '../config/constants';
import { Producto } from '../types';
import { buildWhatsAppUrl } from './attribution';
import { trackContact, trackLead } from './tracking';

/** Pregunta por un repuesto por WhatsApp (disponibilidad, si le sirve a la moto…). */
export function preguntarPorRepuesto(product: Producto, moto?: string) {
  trackLead(product);
  const ref = product.codigo_referencia ? ` (Ref: ${product.codigo_referencia})` : '';
  const paraMoto = moto ? ` para mi ${moto}` : '';
  const mensaje = `Hola LV PARTS, vi este repuesto en la web: ${product.nombre}${ref}. ¿Me ayudan con más info${paraMoto}?`;
  window.open(buildWhatsAppUrl(APP_CONFIG.WHATSAPP_NUMBER, mensaje), '_blank');
}

/** "No encuentro mi repuesto": el cliente manda una foto o el nombre por WhatsApp. */
export function pedirAyuda(origen: string, moto?: string) {
  trackContact(origen);
  const mensaje = moto
    ? `Hola LV PARTS, busco un repuesto para mi ${moto} y no lo encuentro en la web.`
    : 'Hola LV PARTS, busco un repuesto y no lo encuentro en la web.';
  window.open(buildWhatsAppUrl(APP_CONFIG.WHATSAPP_NUMBER, mensaje), '_blank');
}
