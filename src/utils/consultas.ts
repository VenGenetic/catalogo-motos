import { APP_CONFIG } from '../config/constants';
import { Producto } from '../types';
import { buildWhatsAppUrl } from './attribution';
import { trackContact, trackLead } from './tracking';

/**
 * El enlace corto de un repuesto: `lvparts.ec/p/<id>`. Abre su ficha en el catálogo y,
 * pegado en WhatsApp, se ve como una tarjeta con su foto, precio y stock (lo arma
 * `api/repuesto.ts`). `<id>` es `products.id`, el mismo de `/catalogo?prod=<id>`.
 */
export function enlaceDelRepuesto(product: Producto): string {
  return /^\d+$/.test(product.id)
    ? `${APP_CONFIG.SITE_URL}/p/${product.id}`
    : `${APP_CONFIG.SITE_URL}/catalogo?prod=${encodeURIComponent(product.id)}`;
}

/** El stock con las mismas palabras que la tarjeta (EstadoStock, en ProductCard). */
const textoDeStock = (product: Producto) =>
  !product.stock ? 'Agotado' : product.origenes?.includes('bajo pedido') ? 'Bajo pedido' : 'En stock';

/**
 * Pregunta por un repuesto por WhatsApp (disponibilidad, si le sirve a la moto…).
 *
 * El mensaje lleva el nombre, el precio, el stock y el enlace del repuesto, en vez del
 * código: el vendedor ve la foto en la vista previa del enlace sin buscar nada. El bot
 * (repo `agente`, `catalogoWeb.ts`) reconoce el mensaje por "vi este repuesto en la web"
 * y el repuesto por el `/p/<id>` del enlace; si cambias el formato, cámbialo allá.
 */
export function preguntarPorRepuesto(product: Producto, moto?: string) {
  trackLead(product);
  const paraMoto = moto ? ` para mi ${moto}` : '';
  const precio = product.precio ? `$${Number(product.precio).toFixed(2)}` : 'Precio por confirmar';
  const mensaje = [
    'Hola LV PARTS, vi este repuesto en la web:',
    `*${product.nombre}*`,
    `${precio} · ${textoDeStock(product)}`,
    enlaceDelRepuesto(product),
    `¿Me ayudan con más info${paraMoto}?`,
  ].join('\n');
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
