/*
  Despiece por modelo: a qué motos sirve cada repuesto.

  Las reglas son las del ERP, copiadas tal cual en reglas.ts y
  clasificador.js por `npm run sincronizar-despiece`: no se editan aquí,
  se cambian en Sistema_ERP/apartamentos/bodega/despiece.ts y se vuelven a
  copiar (`npm run check:despiece` avisa si la copia quedó vieja o alguien la
  tocó). Este archivo sólo agrega lo que necesita la web: buscar una moto por
  su id y sacar las piezas de una sola moto.

  Las reglas usan lookbehind (`(?<!SUPER\s*)`), que Safari sólo entiende desde
  iOS 16.4. Por eso esta carpeta no se importa directo: se carga aparte con
  utils/cargarDespiece.ts y, si el navegador no puede, el catálogo sigue
  funcionando sin el filtro por moto.
*/

import {
  MODELOS_DESPIECE,
  leerCodigo,
  modelosCompatiblesDe as compatiblesSegunElErp,
  modelosDelMotor,
  nombra,
  nombreParaMotos,
  type CompatibilidadDespiece,
  type ProductoDespiece,
} from './reglas';

export type { CompatibilidadDespiece, ModeloDespiece } from './reglas';

/** Un repuesto de la web. Su id es el del ERP escrito como texto. */
export interface RepuestoDespiece {
  id: string | number;
  sku: string | null;
  name: string;
}

const comoEnElErp = (p: RepuestoDespiece): ProductoDespiece => ({ id: Number(p.id), sku: p.sku, name: p.name });

/** A qué motos sirve un repuesto, con la regla del ERP. */
export const modelosCompatiblesDe = (p: RepuestoDespiece): CompatibilidadDespiece[] => compatiblesSegunElErp(comoEnElErp(p));

export const modeloPorId = (id: string) => MODELOS_DESPIECE.find(m => m.id === id);

/** Una pieza en el despiece de una moto. */
export interface PiezaDeModelo {
  origen: 'propia' | 'compartida';
  /** Posición en la lista de la moto (el número del código). Sólo en las propias. */
  posicion: number | null;
}

/**
 * Las piezas de una sola moto (id del producto → propia o compartida y su
 * posición), con la misma regla que `modelosCompatiblesDe`. Sólo se analiza a
 * fondo lo que puede ser de ella, para no recorrer las 80 motos con cada uno
 * de los ~6.500 productos en el celular del cliente.
 */
export function piezasDeModelo(productos: RepuestoDespiece[], id: string): Map<string | number, PiezaDeModelo> {
  const modelo = modeloPorId(id);
  const out = new Map<string | number, PiezaDeModelo>();
  if (!modelo) return out;
  for (const p of productos) {
    const prefijo = leerCodigo(p.sku)?.prefijo;
    const n = nombreParaMotos(p.name || '');
    const candidato = (prefijo && modelo.prefijos.includes(prefijo)) || nombra(modelo, n, prefijo) || modelosDelMotor(n, prefijo).includes(modelo.id);
    if (!candidato) continue;
    const suya = modelosCompatiblesDe(p).find(c => c.modelo.id === modelo.id);
    if (suya) out.set(p.id, { origen: suya.origen, posicion: suya.posicion });
  }
  return out;
}
