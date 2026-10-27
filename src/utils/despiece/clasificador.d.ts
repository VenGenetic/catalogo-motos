// GENERADO por scripts/sincronizar-despiece.mjs desde Sistema_ERP/scripts/meta/clasificador.d.ts (2de5290, huella ba1e272780c5821d). No editar a mano: npm run sincronizar-despiece.
/*
  Tipos de `clasificador.js`. El script es JavaScript puro porque lo corren los
  generadores de feed con Node; el ERP lo importa también (Centro de
  publicidad) y sin esto TypeScript deduce mal lo que devuelven las funciones.
*/
export function tipoPieza(nombre: string): string;
export function modelos(nombre: string): string[];
export function cilindraje(nombre: string): number | null;
export function rangoTicket(precio: number): 'bajo' | 'medio' | 'alto' | 'premium';
export function rangoMargen(precio: number, costo: number | null | undefined): 'margen_desconocido' | 'margen_bajo' | 'margen_medio' | 'margen_alto';
export const TIPOS: Array<[string, RegExp[]]>;
export const MODELOS: Array<[RegExp, string]>;
