// src/utils/tracking.ts
// Píxel de Meta (Facebook/Instagram) para LV PARTS.
// El ID se define en .env como VITE_META_PIXEL_ID. Si no está definido,
// todas las funciones son no-op: el sitio funciona igual sin el píxel.

import { Producto, ItemCarrito } from '../types';

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const CURRENCY = 'USD';

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

let initialized = false;

/**
 * Inserta el snippet base del píxel y dispara el primer PageView.
 * Se llama una sola vez, desde main.tsx.
 */
export const initMetaPixel = () => {
  if (initialized || !PIXEL_ID || typeof window === 'undefined') return;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function (...args: unknown[]) {
      if (n.callMethod) {
        n.callMethod(...args);
      } else {
        n.queue.push(args);
      }
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable @typescript-eslint/no-explicit-any */

  window.fbq?.('init', PIXEL_ID);
  window.fbq?.('track', 'PageView');
  initialized = true;
};

const track = (event: string, params?: Record<string, unknown>) => {
  if (!PIXEL_ID || typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', event, params);
};

/** PageView en cambios de ruta del SPA (el primero lo dispara initMetaPixel). */
export const trackPageView = () => track('PageView');

/** Ficha de producto abierta. */
export const trackViewContent = (product: Producto) =>
  track('ViewContent', {
    content_ids: [product.codigo_referencia || product.id],
    content_name: product.nombre,
    content_category: product.categoria,
    content_type: 'product',
    value: Number(product.precio) || 0,
    currency: CURRENCY,
  });

/** Producto agregado al carrito. */
export const trackAddToCart = (product: Producto) =>
  track('AddToCart', {
    content_ids: [product.codigo_referencia || product.id],
    content_name: product.nombre,
    content_type: 'product',
    value: Number(product.precio) || 0,
    currency: CURRENCY,
  });

/**
 * Pedido enviado a WhatsApp desde el carrito.
 * Es la señal más fuerte de intención de compra del sitio: úsala como
 * evento de optimización en las campañas de Meta.
 */
export const trackInitiateCheckout = (cart: ItemCarrito[], total: number) =>
  track('InitiateCheckout', {
    content_ids: cart.map((i) => i.codigo_referencia || i.id),
    content_type: 'product',
    num_items: cart.reduce((acc, i) => acc + (i.cantidad || i.cant || 0), 0),
    value: Number(total) || 0,
    currency: CURRENCY,
  });

/** Cotización por WhatsApp de un producto concreto. */
export const trackLead = (product: Producto) =>
  track('Lead', {
    content_ids: [product.codigo_referencia || product.id],
    content_name: product.nombre,
    content_category: product.categoria,
    value: Number(product.precio) || 0,
    currency: CURRENCY,
  });

/**
 * Clic genérico a WhatsApp (navbar, hero, botón flotante, página de contacto).
 * `source` permite distinguir de dónde salió en el Administrador de eventos.
 */
export const trackContact = (source: string) => track('Contact', { source });
