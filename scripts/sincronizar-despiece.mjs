/**
 * Trae al catálogo las reglas del despiece por modelo del ERP.
 *
 *   npm run sincronizar-despiece   copia las reglas
 *   npm run check:despiece         falla si la copia quedó vieja o se editó a mano
 *
 * Qué moto lleva cada repuesto lo decide `Sistema_ERP/apartamentos/bodega/
 * despiece.ts`, revisado pieza por pieza contra el catálogo. La web (filtro
 * por moto y "Sirve para"), el ERP y el bot usan esas MISMAS reglas: si cada
 * uno tuviera las suyas, la web le diría al cliente que una pieza le sirve y
 * el vendedor le diría que no. El agente tiene su propio
 * `npm run sincronizar-despiece`; los dos se lanzan juntos desde el ERP con
 * `npm run despiece:copiar`.
 *
 * Igual que en el agente, se copia el último COMMIT del ERP, no la copia de
 * trabajo: ahí puede haber una regla a medio escribir. `ERP_DIR` cambia la
 * carpeta (por defecto `../../Sistema_ERP`) y `ERP_REF` el commit (`HEAD`).
 *
 * Sin la carpeta del ERP (GitHub Actions, otra PC), `--verificar` revisa que
 * nadie haya editado la copia: la cabecera guarda la huella del contenido.
 *
 * `--verificar` también compara `sistemaDe` de src/utils/sistemas.ts con el
 * del ERP, repuesto por repuesto, con los nombres de `catalogo_publico`.
 * sistemas.ts es una copia a mano porque se carga con los productos, en el
 * archivo principal, y las reglas de motos tienen lookbehind (ver
 * utils/cargarDespiece.ts): si entraran ahí, un iPhone viejo vería la página
 * en blanco.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const erp = path.resolve(raiz, process.env.ERP_DIR ?? '../../Sistema_ERP');
const ref = process.env.ERP_REF ?? 'HEAD';
const destino = path.join(raiz, 'src', 'utils', 'despiece');
const verificar = process.argv.includes('--verificar');

/** Archivo del ERP -> archivo del catálogo, y cómo se reescriben sus importaciones. */
const ARCHIVOS = [
  {
    origen: 'apartamentos/bodega/despiece.ts',
    destino: 'reglas.ts',
    ajustar: (t) => t.replace(/from '\.\.\/\.\.\/scripts\/meta\/clasificador\.js'/, "from './clasificador.js'"),
  },
  { origen: 'scripts/meta/clasificador.js', destino: 'clasificador.js' },
  { origen: 'scripts/meta/clasificador.d.ts', destino: 'clasificador.d.ts' },
];

const MARCA = 'GENERADO por scripts/sincronizar-despiece.mjs';

/** El archivo sin la cabecera y con saltos de línea de Linux (Windows los cambia al sacar el archivo). */
const cuerpo = (texto) => texto.replace(/\r\n/g, '\n').split('\n').filter((l) => !l.includes(MARCA)).join('\n');
const huellaDe = (texto) => createHash('sha256').update(cuerpo(texto)).digest('hex').slice(0, 16);
const cabecera = (commit, origen, huella) =>
  `// ${MARCA} desde Sistema_ERP/${origen} (${commit}, huella ${huella}). No editar a mano: npm run sincronizar-despiece.\n`;

const hayErp = existsSync(path.join(erp, '.git')) && existsSync(path.join(erp, 'apartamentos'));
if (!hayErp && !verificar) {
  console.error(`No encuentro el ERP en ${erp}. Indica la carpeta con ERP_DIR.`);
  process.exit(1);
}

let fallas = 0;
const falla = (mensaje) => { fallas++; console.error(mensaje); };

if (hayErp) {
  const git = (...args) => execFileSync('git', ['-C', erp, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  const commit = git('rev-parse', '--short', ref).trim();

  for (const archivo of ARCHIVOS) {
    const original = git('show', `${ref}:${archivo.origen}`).replace(/\r\n/g, '\n');
    const ajustado = archivo.ajustar ? archivo.ajustar(original) : original;
    if (ajustado.includes('../../scripts/')) {
      throw new Error(`Sistema_ERP/${archivo.origen} cambió sus importaciones: ajusta ARCHIVOS en este script.`);
    }
    const contenido = cabecera(commit, archivo.origen, huellaDe(ajustado)) + ajustado;
    const ruta = path.join(destino, archivo.destino);
    const actual = existsSync(ruta) ? readFileSync(ruta, 'utf8') : null;

    if (verificar) {
      if (actual === null || cuerpo(actual) !== cuerpo(contenido)) {
        falla(`DESACTUALIZADO: src/utils/despiece/${archivo.destino} no es igual a Sistema_ERP/${archivo.origen} (${commit}).`);
      }
      continue;
    }
    writeFileSync(ruta, contenido);
    console.log(`src/utils/despiece/${archivo.destino} <- Sistema_ERP/${archivo.origen} (${commit})`);
  }
  if (verificar && fallas) console.error('Corre `npm run sincronizar-despiece` para traer las reglas del ERP.');
} else {
  // Sin el ERP: al menos, que la copia siga siendo la que se trajo.
  console.log(`No encuentro el ERP en ${erp}: reviso que la copia no se haya editado a mano.`);
  for (const archivo of ARCHIVOS) {
    const ruta = path.join(destino, archivo.destino);
    const actual = existsSync(ruta) ? readFileSync(ruta, 'utf8') : '';
    const anotada = actual.match(/huella ([0-9a-f]{16})\)/)?.[1];
    if (!anotada || anotada !== huellaDe(actual)) {
      falla(`EDITADO A MANO: src/utils/despiece/${archivo.destino}. Los cambios van en Sistema_ERP/${archivo.origen}; después, npm run sincronizar-despiece.`);
    }
  }
}

if (verificar && !fallas) await compararSistemas();

if (verificar) {
  if (fallas) process.exit(1);
  console.log(hayErp ? 'Despiece al día con el ERP.' : 'La copia del despiece no se tocó (sin el ERP no puedo ver si quedó vieja).');
}

/**
 * sistemas.ts (copia a mano) y el ERP ponen cada repuesto en el mismo sistema.
 * Necesita Node 22.18 o más nuevo, que lee TypeScript sin compilarlo.
 */
async function compararSistemas() {
  const nombres = await nombresDelCatalogo();
  if (!nombres) return;
  const aMano = await import(pathToFileURL(path.join(raiz, 'src', 'utils', 'sistemas.ts')).href);
  const delErp = await import(pathToFileURL(path.join(destino, 'reglas.ts')).href);

  const distintos = nombres.filter((n) => aMano.sistemaDe(n) !== delErp.sistemaDe(n));
  if (String(aMano.SISTEMAS) !== String(delErp.SISTEMAS)) {
    falla('SEPARADOS: SISTEMAS de src/utils/sistemas.ts no es la lista del ERP.');
  }
  if (distintos.length) {
    falla(`SEPARADOS: src/utils/sistemas.ts pone ${distintos.length} de ${nombres.length} repuestos en otro sistema que el ERP. Por ejemplo:`);
    for (const n of distintos.slice(0, 8)) console.error(`  ${n}: catálogo ${aMano.sistemaDe(n)}, ERP ${delErp.sistemaDe(n)}`);
    return;
  }
  console.log(`sistemas.ts pone los ${nombres.length} repuestos en el mismo sistema que el ERP.`);
}

/** Los nombres de catalogo_publico, con la clave pública de la web. null (y un aviso) si no se puede. */
async function nombresDelCatalogo() {
  const env = { ...leerEnv('.env.production'), ...leerEnv('.env'), ...process.env };
  const url = env.VITE_SUPABASE_URL?.replace(/\/$/, '');
  const clave = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !clave) {
    console.warn('Sin VITE_SUPABASE_URL ni VITE_SUPABASE_ANON_KEY: no comparo sistemas.ts con el ERP.');
    return null;
  }
  try {
    const nombres = [];
    for (let desde = 0; ; desde += 1000) {
      const r = await fetch(`${url}/rest/v1/catalogo_publico?select=name&order=id&offset=${desde}&limit=1000`, {
        headers: { apikey: clave, Authorization: `Bearer ${clave}` },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const pagina = await r.json();
      nombres.push(...pagina.map((p) => p.name || ''));
      if (pagina.length < 1000) return nombres;
    }
  } catch (error) {
    console.warn(`No pude leer catalogo_publico (${error.message}): no comparo sistemas.ts con el ERP.`);
    return null;
  }
}

function leerEnv(archivo) {
  const ruta = path.join(raiz, archivo);
  if (!existsSync(ruta)) return {};
  return Object.fromEntries(readFileSync(ruta, 'utf8').split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));
}
