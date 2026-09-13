// src/utils/attribution.ts
//
// Lleva el identificador del clic del anuncio a través del salto a WhatsApp.
//
// EL PROBLEMA
// -----------
// Google Ads manda a lvparts.ec con `?gclid=...`. La persona navega el catálogo
// y toca "cotizar por WhatsApp", que abre wa.me. Ese salto es cross-domain: el
// gclid se queda acá y la conversación de WhatsApp nace huérfana. Google nunca
// se entera de que esa persona compró; lo único que puede contar es el clic en
// el botón. Por eso la campaña reporta conversiones que no son ventas.
//
// LA SOLUCIÓN
// -----------
// Se capturan los identificadores en el PRIMER hit (antes de que el cliente
// navegue y la query se pierda), se guardan en Supabase, y del otro lado sólo
// viaja un token corto pegado al mensaje que WhatsApp rellena. El agente lee ese
// token del primer mensaje y recupera el gclid completo.
//
// El token va en el texto que el cliente ve, así que es corto y silencioso. Un
// gclid crudo son ~90 caracteres de ruido que la gente borra antes de enviar.

import { supabase } from '../config/supabase';

const CLAVE_SESION = 'lvparts_attr';

/** Los parámetros de clic de cada plataforma, tal como los nombra cada una. */
const PARAMS_DE_CLIC = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid', 'msclkid'] as const;
const PARAMS_UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

type Atribucion = {
  token: string;
  guardado: boolean;
};

let enMemoria: Atribucion | null = null;

/** Token corto, legible y sin caracteres que se confundan (0/O, 1/I/l). */
function generarToken(): string {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let t = '';
  const buf = new Uint8Array(6);
  crypto.getRandomValues(buf);
  for (const b of buf) t += alfabeto[b % alfabeto.length];
  return t;
}

function leerSesion(): Atribucion | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE_SESION);
    return crudo ? (JSON.parse(crudo) as Atribucion) : null;
  } catch {
    return null; // navegación privada o almacenamiento bloqueado
  }
}

function escribirSesion(a: Atribucion) {
  try {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(a));
  } catch {
    /* sin almacenamiento seguimos con `enMemoria`: alcanza para esta pestaña */
  }
}

/**
 * Se llama una vez al arrancar la app, antes de que el cliente navegue.
 *
 * Si la URL no trae ningún identificador de clic ni UTM, no hace nada: la
 * mayoría de las visitas son directas y no tiene sentido escribir una fila ni
 * ensuciar el mensaje de WhatsApp con un token que no atribuye nada.
 */
export const initAttribution = (): void => {
  if (typeof window === 'undefined') return;
  if (enMemoria || leerSesion()) {
    enMemoria = enMemoria ?? leerSesion();
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const fila: Record<string, string | null> = {};
  let hayAlgo = false;

  for (const p of PARAMS_DE_CLIC) {
    const v = params.get(p);
    if (v) { fila[p] = v; hayAlgo = true; }
  }
  for (const p of PARAMS_UTM) {
    const v = params.get(p);
    if (v) { fila[p] = v; hayAlgo = true; }
  }
  if (!hayAlgo) return;

  const token = generarToken();
  enMemoria = { token, guardado: false };
  escribirSesion(enMemoria);

  fila.token = token;
  fila.landing_url = window.location.href.slice(0, 2000);
  fila.referrer = document.referrer ? document.referrer.slice(0, 2000) : null;

  // Sin await: el cliente no debe esperar a que esto termine para ver el
  // catálogo. Si falla (sin red, RLS mal aplicada), el token igual viaja en el
  // mensaje y queda sin resolver del otro lado -- se pierde esa atribución, no
  // la visita.
  void supabase
    .from('web_ad_clicks')
    .insert(fila)
    .then(({ error }) => {
      if (error) {
        console.warn('[attr] no se pudo guardar el clic:', error.message);
        return;
      }
      enMemoria = { token, guardado: true };
      escribirSesion(enMemoria);
    });
};

/** El token de esta visita, si llegó desde un anuncio. */
export const getAttributionToken = (): string | null =>
  (enMemoria ?? leerSesion())?.token ?? null;

/**
 * Arma el enlace de WhatsApp agregando el token al final del mensaje.
 *
 * Todos los botones de WhatsApp del sitio pasan por acá. Antes cada uno
 * construía su propia URL con `https://wa.me/...`, y agregar la atribución
 * habría sido repetir lo mismo en siete lugares -- con la garantía de que el
 * octavo botón que alguien agregue se olvide.
 */
export const buildWhatsAppUrl = (numero: string, mensaje?: string): string => {
  const token = getAttributionToken();
  const partes: string[] = [];
  if (mensaje) partes.push(mensaje);
  if (token) partes.push(`[ref ${token}]`);
  const texto = partes.join(' ');
  const base = `https://wa.me/${numero}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
};

// Qué pieza estaba mirando al saltar no se guarda acá: la política de RLS sólo
// deja INSERT desde el navegador, y con razón -- un UPDATE abierto dejaría
// editar filas ajenas. No hace falta: el mensaje que se manda ya lleva el SKU
// escrito ("Ref: CB250GP1-023"), y el agente lo lee de ahí.
