/**
 * api/catalogo.js sin red: lee la función catalogo_publico() del ERP (o la
 * vista, sólo si la función no existe) página por página por id hasta una
 * página vacía, se niega con una clave de servicio y no deja que el CDN guarde
 * un error.
 *
 *   npm run check:catalogo-json
 */
import assert from 'node:assert/strict';
import atender, { CACHE, leerCatalogo, rolDeClave } from '../api/catalogo.js';

const jwt = rol => ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({ role: rol })).toString('base64url'), 'firma'].join('.');
const ANON = jwt('anon');
const BASE = 'https://ejemplo.supabase.co';
const entorno = { VITE_SUPABASE_URL: `${BASE}/`, VITE_SUPABASE_ANON_KEY: ANON };

assert.equal(rolDeClave(ANON), 'anon');
assert.equal(rolDeClave(jwt('service_role')), 'service_role');
assert.equal(rolDeClave('sb_publishable_abc'), 'anon');
assert.equal(rolDeClave('sb_secret_abc'), 'service_role');
assert.equal(rolDeClave('cualquier-cosa'), null);

const respuesta = (status, cuerpo) => ({ ok: status < 300, status, json: async () => cuerpo, text: async () => JSON.stringify(cuerpo) });

/**
 * Un PostgREST de mentira con `n` repuestos (ids 1..n) que entrega hasta
 * `porPagina` filas por pedido. `sinFuncion`: la función todavía no existe
 * (el 404 PGRST202 de PostgREST); `fallaFuncion`: la función responde ese estado.
 */
const postgrest = (n, { porPagina = 1000, sinFuncion = false, fallaFuncion = null } = {}) => {
  const pedidos = [];
  const pedir = async (url, { headers }) => {
    pedidos.push({ url, headers });
    const u = new URL(url);
    const esFuncion = u.pathname.endsWith('/rpc/catalogo_publico');
    if (esFuncion && sinFuncion) return respuesta(404, { code: 'PGRST202', message: 'Could not find the function public.catalogo_publico' });
    if (esFuncion && fallaFuncion) return respuesta(fallaFuncion, { code: 'XX000', message: 'falla' });
    const desde = Number(esFuncion ? u.searchParams.get('p_desde_id') : u.searchParams.get('id').replace('gt.', ''));
    const limite = Number(u.searchParams.get(esFuncion ? 'p_limite' : 'limit'));
    const cuantas = Math.max(0, Math.min(limite, porPagina, n - desde));
    return respuesta(200, Array.from({ length: cuantas }, (_, i) => ({ id: desde + i + 1, sku: `S${desde + i + 1}` })));
  };
  return { pedir, pedidos };
};
/** Qué pidió, en corto: 'rpc/catalogo_publico:0', 'catalogo_publico:gt.1000'… */
const pedidosDe = falso => falso.pedidos.map(p => {
  const u = new URL(p.url);
  return `${u.pathname.split('/rest/v1/')[1]}:${u.searchParams.get('p_desde_id') ?? u.searchParams.get('id')}`;
});

// 2.345 repuestos por la función: tres páginas y una vacía que cierra.
let falso = postgrest(2345);
let r = await leerCatalogo({ entorno, pedir: falso.pedir });
assert.equal(r.fuente, 'funcion');
assert.equal(r.total, 2345);
assert.deepEqual(r.productos.map(p => p.id), Array.from({ length: 2345 }, (_, i) => i + 1));
assert.deepEqual(pedidosDe(falso), ['rpc/catalogo_publico:0', 'rpc/catalogo_publico:1000', 'rpc/catalogo_publico:2000', 'rpc/catalogo_publico:2345']);
assert.equal(falso.pedidos[0].headers.Authorization, `Bearer ${ANON}`);
assert.ok(falso.pedidos[0].url.startsWith(`${BASE}/rest/v1/rpc/catalogo_publico?`), 'sin doble barra');
assert.ok(!Number.isNaN(Date.parse(r.generado)));

// Si PostgREST entrega menos filas por página, igual llega a todas.
assert.equal((await leerCatalogo({ entorno, pedir: postgrest(2345, { porPagina: 300 }).pedir })).total, 2345);

// Mientras la función no exista, la vista.
falso = postgrest(1500, { sinFuncion: true });
r = await leerCatalogo({ entorno, pedir: falso.pedir });
assert.equal(r.fuente, 'vista');
assert.equal(r.total, 1500);
assert.deepEqual(pedidosDe(falso), ['rpc/catalogo_publico:0', 'catalogo_publico:gt.0', 'catalogo_publico:gt.1000', 'catalogo_publico:gt.1500']);

// Si la función falla por otra cosa, no se tapa con la vista.
falso = postgrest(10, { fallaFuncion: 500 });
await assert.rejects(leerCatalogo({ entorno, pedir: falso.pedir }), /respondió 500/);
assert.deepEqual(pedidosDe(falso), ['rpc/catalogo_publico:0']);

// Un catálogo vacío no se publica.
await assert.rejects(leerCatalogo({ entorno, pedir: postgrest(0).pedir }), /no devolvió repuestos/);

// La publicable no es un JWT: no va como Bearer.
falso = postgrest(10);
await leerCatalogo({ entorno: { ...entorno, VITE_SUPABASE_ANON_KEY: 'sb_publishable_x' }, pedir: falso.pedir });
assert.equal(falso.pedidos[0].headers.Authorization, undefined);
assert.equal(falso.pedidos[0].headers.apikey, 'sb_publishable_x');

// Con una clave de servicio (o una que no se reconoce) no pide nada.
for (const clave of [jwt('service_role'), 'sb_secret_x', 'basura']) {
  falso = postgrest(10);
  await assert.rejects(leerCatalogo({ entorno: { ...entorno, VITE_SUPABASE_ANON_KEY: clave }, pedir: falso.pedir }), /no es la clave anon/);
  assert.equal(falso.pedidos.length, 0);
}

// La función de Vercel: un error no queda guardado en el CDN; lo que sale bien, sí.
const respuestaHttp = () => ({
  cabeceras: {},
  statusCode: 0,
  cuerpo: undefined,
  setHeader(k, v) { this.cabeceras[k] = v; },
  end(c) { this.cuerpo = c; },
});
process.env.VITE_SUPABASE_URL = BASE;
process.env.VITE_SUPABASE_ANON_KEY = jwt('service_role');
let res = respuestaHttp();
await atender({ method: 'GET' }, res);
assert.equal(res.statusCode, 503);
assert.equal(res.cabeceras['Cache-Control'], 'no-store');
assert.match(JSON.parse(res.cuerpo).error, /no es la clave anon/);

res = respuestaHttp();
await atender({ method: 'POST' }, res);
assert.equal(res.statusCode, 405);

process.env.VITE_SUPABASE_ANON_KEY = ANON;
const fetchReal = globalThis.fetch;
globalThis.fetch = postgrest(5).pedir;
res = respuestaHttp();
try {
  await atender({ method: 'GET' }, res);
} finally {
  globalThis.fetch = fetchReal;
}
assert.equal(res.statusCode, 200);
assert.equal(res.cabeceras['Cache-Control'], CACHE);
assert.equal(res.cabeceras['Content-Type'], 'application/json; charset=utf-8');
assert.equal(JSON.parse(res.cuerpo).total, 5);

console.log('check-catalogo-json: ok');
