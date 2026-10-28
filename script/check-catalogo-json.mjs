/**
 * api/catalogo.js sin red: pagina por id hasta una página vacía, compara con
 * el conteo, se niega con una clave de servicio y no deja que el CDN guarde
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

/** Un PostgREST de mentira con `n` repuestos (ids 1..n) que entrega hasta `porPagina` por pedido. */
const postgrest = (n, { porPagina = 1000, conteo = n } = {}) => {
  const pedidos = [];
  const pedir = async (url, { headers }) => {
    pedidos.push({ url, headers });
    const q = new URL(url).searchParams;
    const desde = Number(q.get('id').replace('gt.', ''));
    const cuantas = Math.max(0, Math.min(Number(q.get('limit')), porPagina, n - desde));
    const filas = Array.from({ length: cuantas }, (_, i) => ({ id: desde + i + 1, sku: `S${desde + i + 1}` }));
    return {
      ok: true,
      status: 200,
      headers: { get: h => (h === 'content-range' && headers.Prefer ? `0-${filas.length - 1}/${conteo}` : null) },
      json: async () => filas,
      text: async () => '',
    };
  };
  return { pedir, pedidos };
};
const idsPedidos = falso => falso.pedidos.map(p => new URL(p.url).searchParams.get('id'));

// 2.345 repuestos: tres páginas y una vacía que cierra.
let falso = postgrest(2345);
let r = await leerCatalogo({ entorno, pedir: falso.pedir });
assert.equal(r.total, 2345);
assert.deepEqual(r.productos.map(p => p.id), Array.from({ length: 2345 }, (_, i) => i + 1));
assert.deepEqual(idsPedidos(falso), ['gt.0', 'gt.1000', 'gt.2000', 'gt.2345']);
assert.equal(falso.pedidos[0].headers.Prefer, 'count=exact', 'el conteo va sólo en el primer pedido');
assert.equal(falso.pedidos[1].headers.Prefer, undefined);
assert.equal(falso.pedidos[0].headers.Authorization, `Bearer ${ANON}`);
assert.ok(falso.pedidos[0].url.startsWith(`${BASE}/rest/v1/catalogo_publico?`), 'sin doble barra');
assert.ok(!Number.isNaN(Date.parse(r.generado)));

// Si PostgREST entrega menos filas por página, igual llega a todas.
falso = postgrest(2345, { porPagina: 300 });
assert.equal((await leerCatalogo({ entorno, pedir: falso.pedir })).total, 2345);

// La publicable no es un JWT: no va como Bearer.
falso = postgrest(10);
await leerCatalogo({ entorno: { ...entorno, VITE_SUPABASE_ANON_KEY: 'sb_publishable_x' }, pedir: falso.pedir });
assert.equal(falso.pedidos[0].headers.Authorization, undefined);
assert.equal(falso.pedidos[0].headers.apikey, 'sb_publishable_x');

// Faltan repuestos frente al conteo: no se publica un catálogo a medias.
await assert.rejects(leerCatalogo({ entorno, pedir: postgrest(900, { conteo: 1000 }).pedir }), /Se leyeron 900 de 1000/);

// Con una clave de servicio (o una que no se reconoce) no pide nada.
for (const clave of [jwt('service_role'), 'sb_secret_x', 'basura']) {
  falso = postgrest(10);
  await assert.rejects(leerCatalogo({ entorno: { ...entorno, VITE_SUPABASE_ANON_KEY: clave }, pedir: falso.pedir }), /no es la clave anon/);
  assert.equal(falso.pedidos.length, 0);
}

// La función: un error no queda guardado en el CDN; lo que sale bien, sí.
const respuesta = () => ({
  cabeceras: {},
  statusCode: 0,
  cuerpo: undefined,
  setHeader(k, v) { this.cabeceras[k] = v; },
  end(c) { this.cuerpo = c; },
});
process.env.VITE_SUPABASE_URL = BASE;
process.env.VITE_SUPABASE_ANON_KEY = jwt('service_role');
let res = respuesta();
await atender({ method: 'GET' }, res);
assert.equal(res.statusCode, 503);
assert.equal(res.cabeceras['Cache-Control'], 'no-store');
assert.match(JSON.parse(res.cuerpo).error, /no es la clave anon/);

res = respuesta();
await atender({ method: 'POST' }, res);
assert.equal(res.statusCode, 405);

process.env.VITE_SUPABASE_ANON_KEY = ANON;
const fetchReal = globalThis.fetch;
globalThis.fetch = postgrest(5).pedir;
res = respuesta();
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
