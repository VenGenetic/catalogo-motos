/**
 * La lista de repuestos sin foto, para tomarlas o subirlas al Storage.
 *
 *   npm run fotos:sin-foto     escribe informes/repuestos-sin-foto.csv
 *
 * Reemplaza a las listas hechas a mano (productos_sin_foto.txt, de marzo).
 * Mira cada repuesto de catalogo_publico como lo ve el cliente en la página
 * (vite/datosCatalogo.ts): no tiene foto, apunta al aviso gris de "sin
 * imagen", apunta a un archivo que ya no está en el Storage, o su foto está
 * sólo en public/imagenes_repuestos y falta subirla. Primero lo que está en
 * bodega y, dentro de eso, lo más caro.
 *
 * Corre cada mañana en GitHub Actions (.github/workflows/repuestos-sin-foto.yml):
 * la lista queda en la pestaña Actions del repo, como archivo y en el resumen.
 * Necesita Node 22.18 o más nuevo (lee vite/datosCatalogo.ts sin compilarlo).
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { estadoDeFotos, leerCatalogoPublico } from '../vite/datosCatalogo.ts';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const salida = path.join(raiz, 'informes', 'repuestos-sin-foto.csv');

const MOTIVOS = {
  sin_foto: 'Sin foto',
  aviso_gris: 'Muestra el aviso gris de "sin imagen"',
  no_existe: 'Su foto ya no está en el Storage',
  solo_local: 'Su foto está sólo en public/imagenes_repuestos: subirla al Storage',
};
const ORDEN = { en_stock: 0, bajo_pedido: 1, agotado: 2 };
const DISPONIBILIDAD = { en_stock: 'En bodega', bajo_pedido: 'Bajo pedido', agotado: 'Agotado' };

const env = { ...leerEnv('.env.production'), ...leerEnv('.env'), ...process.env };
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  console.error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (.env, .env.production o el entorno).');
  process.exit(1);
}

const repuestos = await leerCatalogoPublico(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const estados = await estadoDeFotos(repuestos, raiz);
const faltan = repuestos
  .map(r => ({ ...r, estado: estados.get(r.id).estado }))
  .filter(r => r.estado !== 'storage')
  .sort((a, b) => ORDEN[a.disponibilidad] - ORDEN[b.disponibilidad] || b.precio - a.precio || a.sku.localeCompare(b.sku));

const csv = v => (/[",\n;]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const lineas = [['disponibilidad', 'sku', 'nombre', 'precio', 'motivo', 'enlace'].join(',')];
for (const r of faltan) {
  lineas.push([DISPONIBILIDAD[r.disponibilidad], r.sku, r.nombre, r.precio, MOTIVOS[r.estado], `https://www.lvparts.ec/catalogo?prod=${r.id}`].map(csv).join(','));
}
mkdirSync(path.dirname(salida), { recursive: true });
// Con BOM: Excel abre bien las tildes.
writeFileSync(salida, `﻿${lineas.join('\n')}\n`);

// Resumen: cuántos por motivo y disponibilidad.
const cuenta = (estado, disp) => faltan.filter(r => r.estado === estado && (!disp || r.disponibilidad === disp)).length;
const filas = Object.keys(MOTIVOS).map(e => [MOTIVOS[e], cuenta(e, 'en_stock'), cuenta(e, 'bajo_pedido'), cuenta(e, 'agotado'), cuenta(e)]);
const total = ['Total', ...['en_stock', 'bajo_pedido', 'agotado'].map(d => faltan.filter(r => r.disponibilidad === d).length), faltan.length];

console.log(`${faltan.length} de ${repuestos.length} repuestos sin foto real -> ${path.relative(raiz, salida)}`);
console.table(Object.fromEntries([...filas, total].map(([m, ...n]) => [m, { 'En bodega': n[0], 'Bajo pedido': n[1], Agotado: n[2], Total: n[3] }])));

if (env.GITHUB_STEP_SUMMARY) {
  const enBodega = faltan.filter(r => r.disponibilidad === 'en_stock');
  const md = [
    `## Repuestos sin foto (${new Date().toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' })})`,
    '',
    `${faltan.length} de ${repuestos.length} repuestos no muestran una foto real. La lista completa está en el archivo **repuestos-sin-foto** de esta ejecución.`,
    '',
    '| Motivo | En bodega | Bajo pedido | Agotado | Total |',
    '|---|---:|---:|---:|---:|',
    ...[...filas, total].map(f => `| ${f.join(' | ')} |`),
    '',
    `### En bodega (${enBodega.length}), del más caro al más barato`,
    '',
    '| SKU | Repuesto | Precio | Motivo |',
    '|---|---|---:|---|',
    ...enBodega.slice(0, 150).map(r => `| ${r.sku} | ${r.nombre.replace(/\|/g, '/')} | $${r.precio} | ${MOTIVOS[r.estado]} |`),
    '',
  ];
  appendFileSync(env.GITHUB_STEP_SUMMARY, md.join('\n'));
}

function leerEnv(archivo) {
  const ruta = path.join(raiz, archivo);
  if (!existsSync(ruta)) return {};
  return Object.fromEntries(readFileSync(ruta, 'utf8').split(/\r?\n/)
    .filter(l => /^[A-Z_]+=/.test(l))
    .map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));
}
