/**
 * El catálogo entero en un solo JSON, servido por el CDN de Vercel.
 *
 * Sin esto, cada visitante sin caché le pedía a Supabase 7 páginas del
 * catálogo (~6.500 repuestos, ~2 MB), y Supabase anda justo de Disk IO. Ahora
 * las pide esta función y el CDN guarda la respuesta (`s-maxage`), y la sigue
 * sirviendo mientras la renueva en segundo plano (`stale-while-revalidate`):
 * la base se lee unas pocas veces por hora, no una vez por visitante. La web
 * (src/hooks/useProducts.ts) la pide primero y, si falla o llega vieja, lee la
 * base por su cuenta.
 *
 * Lee con la clave pública del sitio (VITE_SUPABASE_ANON_KEY, la misma del
 * build). Si esa variable trae una clave de servicio (service_role o
 * sb_secret_…) se niega: esa clave salta todos los permisos de la base y no
 * tiene nada que hacer en el sitio público.
 *
 * GET /api/catalogo → { generado, fuente, total, productos: [{ id, sku, name,
 *   category, price, image_url, gallery, disponibilidad, descontinuado }] }
 *
 * Una función de Vercel no puede responder más de 4,5 MB; hoy son ~2 MB. Si el
 * catálogo llega a duplicarse, Vercel responde con error y la web lee la base.
 * En `npm run dev` la sirve vite.config.ts.
 */

const COLUMNAS = 'id,sku,name,category,price,image_url,gallery,disponibilidad,descontinuado';
const PAGINA = 1000; // PostgREST corta en 1000 filas sin avisar
export const CACHE = 'public, max-age=0, s-maxage=600, stale-while-revalidate=21600';

/** El rol de una clave de Supabase, sin mostrarla: 'anon', 'service_role', … o null. */
export function rolDeClave(clave) {
  if (!clave) return null;
  if (clave.startsWith('sb_publishable_')) return 'anon';
  if (clave.startsWith('sb_secret_')) return 'service_role';
  try {
    return JSON.parse(Buffer.from(clave.split('.')[1], 'base64url').toString()).role ?? null;
  } catch {
    return null;
  }
}

/**
 * Lee todo el catálogo por la función `catalogo_publico()` (migración
 * 20261028200000 del ERP) o, mientras esa función no exista, por la vista del
 * mismo nombre. Pagina por id (`p_desde_id` en la función, `id=gt.` en la
 * vista): cada página es una búsqueda en la clave primaria y una fila que
 * cambia a mitad de camino no corre a las demás. Sigue hasta una página vacía,
 * así no depende de cuántas filas entregue PostgREST por página.
 */
export async function leerCatalogo({ entorno, pedir = fetch }) {
  const url = (entorno.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const clave = entorno.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !clave) throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.');
  if (rolDeClave(clave) !== 'anon') {
    throw new Error('VITE_SUPABASE_ANON_KEY no es la clave anon ni la publicable: el sitio público no usa claves de servicio.');
  }
  // La publicable no es un JWT: va sólo en `apikey` (igual que src/config/supabase.ts).
  const cabeceras = { apikey: clave, ...(clave.startsWith('eyJ') ? { Authorization: `Bearer ${clave}` } : {}) };
  const deLaFuncion = desde => `${url}/rest/v1/rpc/catalogo_publico?p_desde_id=${desde}&p_limite=${PAGINA}`;
  const deLaVista = desde => `${url}/rest/v1/catalogo_publico?select=${COLUMNAS}&order=id.asc&id=gt.${desde}&limit=${PAGINA}`;

  const leer = async direccion => {
    const productos = [];
    for (let ultimo = 0; ; ) {
      const r = await pedir(direccion(ultimo), { headers: cabeceras });
      if (!r.ok) {
        const cuerpo = await r.text();
        const error = new Error(`catalogo_publico respondió ${r.status}: ${cuerpo.slice(0, 200)}`);
        error.faltaLaFuncion = r.status === 404 && cuerpo.includes('PGRST202');
        throw error;
      }
      const pagina = await r.json();
      if (!pagina.length) return productos;
      productos.push(...pagina);
      ultimo = pagina[pagina.length - 1].id;
    }
  };

  let fuente = 'funcion';
  let productos;
  try {
    productos = await leer(deLaFuncion);
  } catch (error) {
    if (!error.faltaLaFuncion) throw error;
    fuente = 'vista';
    productos = await leer(deLaVista);
  }
  // Un catálogo vacío no se guarda en el CDN: algo anda mal en la base.
  if (!productos.length) throw new Error('catalogo_publico no devolvió repuestos.');
  return { generado: new Date().toISOString(), fuente, total: productos.length, productos };
}

export default async function atender(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end();
    return;
  }
  let estado = 200;
  let cuerpo;
  try {
    cuerpo = await leerCatalogo({ entorno: process.env });
  } catch (error) {
    estado = 503;
    cuerpo = { error: error instanceof Error ? error.message : String(error) };
  }
  res.statusCode = estado;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Un error no se guarda en el CDN: la visita siguiente vuelve a intentar.
  res.setHeader('Cache-Control', estado === 200 ? CACHE : 'no-store');
  res.end(req.method === 'HEAD' ? undefined : JSON.stringify(cuerpo));
}
