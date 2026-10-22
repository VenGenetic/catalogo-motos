// src/utils/solicitudes.ts
//
// Deja registrado cada pedido o proforma que arma el cliente.
//
// EL PROBLEMA
// -----------
// El pedido vivía sólo en este navegador: "Pedir" abría WhatsApp con el texto
// escrito y "Copiar" copiaba la proforma. Si el cliente no mandaba el mensaje,
// el negocio nunca se enteraba, y no había un listado de lo que se pidió.
//
// LA SOLUCIÓN
// -----------
// Al tocar "Pedir" o "Copiar proforma" se inserta una fila en
// `solicitudes_web` (migración 20261022120000 del ERP), que el equipo ve en
// Ventas → Pedidos de la web. El código corto va escrito en el mensaje y en la
// proforma para relacionar la fila con el chat.
//
// Igual que `initAttribution`: sin await. El cliente no espera a la base de
// datos, y si el insert falla (sin red, migración sin aplicar) WhatsApp y la
// proforma siguen igual; se pierde el registro, no el pedido.

import { supabase } from '../config/supabase';
import { getAttributionToken } from './attribution';
import type { ItemCarrito } from '../types';

export type OrigenSolicitud = 'whatsapp' | 'proforma';

export interface DatosSolicitud {
  nombre: string;
  ciudad: string;
  metodoPago: string;
}

type Registro = { codigo: string; estado: 'enviando' | 'guardado' | 'fallo' };

/*
  Un mismo pedido (mismos repuestos, cantidades, precios, datos y envío) usa
  siempre el mismo código y se guarda una sola vez: tocar "Pedir" dos veces, o
  copiar la proforma y después pedir, no llena el ERP de filas repetidas. Si
  el insert falló, el siguiente toque lo reintenta con el mismo código, que es
  el que ya viajó en el mensaje.
*/
const registros = new Map<string, Registro>();

/** Mismo alfabeto que el token de atribución: sin 0/O ni 1/I/L. */
function generarCodigo(): string {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let c = '';
  const buf = new Uint8Array(6);
  crypto.getRandomValues(buf);
  for (const b of buf) c += alfabeto[b % alfabeto.length];
  return c;
}

const cantidadDe = (item: ItemCarrito) => item.cantidad || item.cant || 0;
const precioDe = (item: ItemCarrito) => (Number(item.precio) > 0 ? Number(item.precio) : 0);

/** Los límites son los de la tabla: lo que no cabe se recorta, no se rechaza. */
const recortar = (texto: string, max: number) => texto.trim().slice(0, max);

/**
 * Registra el pedido y devuelve su código, para escribirlo en el mensaje.
 * El código sale al instante: el insert queda corriendo por detrás.
 */
export const registrarSolicitud = (
  origen: OrigenSolicitud,
  cart: ItemCarrito[],
  datos: DatosSolicitud,
  envio = 0,
): string => {
  const items = cart
    .filter(item => cantidadDe(item) > 0)
    .slice(0, 60)
    .map(item => ({
      product_id: /^\d+$/.test(String(item.id)) ? Number(item.id) : null,
      sku: item.codigo_referencia ? recortar(item.codigo_referencia, 80) : null,
      nombre: recortar(item.nombre || 'Repuesto', 300) || 'Repuesto',
      cantidad: Math.min(999, Math.max(1, Math.round(cantidadDe(item)))),
      precio: Math.min(100000, precioDe(item)),
    }));

  const fila = {
    items,
    envio: Math.min(10000, Math.max(0, Math.round((Number(envio) || 0) * 100) / 100)),
    cliente_nombre: recortar(datos.nombre, 120) || null,
    cliente_ciudad: recortar(datos.ciudad, 200) || null,
    metodo_pago: recortar(datos.metodoPago, 60) || null,
  };

  const huella = JSON.stringify(fila);
  const previo = registros.get(huella);
  if (previo && previo.estado !== 'fallo') return previo.codigo;

  const registro: Registro = { codigo: previo?.codigo ?? generarCodigo(), estado: 'enviando' };
  registros.set(huella, registro);
  if (items.length === 0) return registro.codigo;

  // Sin `.select()`: el navegador sólo puede insertar, no leer lo insertado.
  void supabase
    .from('solicitudes_web')
    .insert({ ...fila, codigo: registro.codigo, origen, atribucion_token: getAttributionToken() })
    .then(({ error }) => {
      registro.estado = error ? 'fallo' : 'guardado';
      if (error) console.warn('[pedido] no se pudo registrar la solicitud:', error.message);
    }, (err: unknown) => {
      registro.estado = 'fallo';
      console.warn('[pedido] no se pudo registrar la solicitud:', err);
    });

  return registro.codigo;
};
