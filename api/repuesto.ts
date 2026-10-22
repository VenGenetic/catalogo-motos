import type { IncomingMessage, ServerResponse } from 'node:http';

/*
  El enlace corto de un repuesto: lvparts.ec/p/<id> (vercel.json lo trae aquí).

  Para qué: cuando un cliente pregunta por un repuesto desde el catálogo, el mensaje
  de WhatsApp lleva este enlace (src/utils/consultas.ts). WhatsApp lee las etiquetas
  Open Graph de la página y muestra una tarjeta con la foto, el nombre con el precio
  y el stock. El catálogo es una app de una sola página: su HTML es el mismo para
  todas las direcciones, así que sólo esta función puede dar la tarjeta de CADA
  repuesto.

  A una persona la manda a la ficha (/catalogo?prod=<id>) con JavaScript. Los
  lectores de vista previa no corren JavaScript, así que se quedan con las etiquetas
  y la respuesta es la misma para todos (se puede guardar en la CDN).

  La foto pasa por wsrv.nl para llegar en JPG de 1200 × 630 con fondo blanco: las
  fotos del catálogo son WebP y WhatsApp no siempre muestra WebP en la vista previa.

  Lee la vista `catalogo_publico` y, mientras no exista en la base (migración
  20261019150000 del ERP), la tabla `products` con la misma regla de stock que hoy usa
  el catálogo (src/hooks/useProducts.ts). Si el repuesto no se encuentra o la base no
  responde, la persona igual llega al catálogo.
*/

const SITIO = 'https://www.lvparts.ec';
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
const CLAVE = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

type Stock = 'en_stock' | 'bajo_pedido' | 'agotado';

interface Repuesto {
  id: string;
  nombre: string;
  sku: string;
  precio: number;
  imagen: string;
  stock: Stock;
}

type Fila = Record<string, unknown>;

/** Una fila por id, o `null` si no está; `undefined` si la tabla/vista no existe. */
async function consultar(tabla: string, columnas: string, id: string): Promise<Fila | null | undefined> {
  const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/${tabla}?select=${columnas}&id=eq.${id}&limit=1`, {
    headers: { apikey: CLAVE, Authorization: `Bearer ${CLAVE}` },
    signal: AbortSignal.timeout(4000),
  });
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { code?: string } | null;
    // PGRST205: la vista todavía no existe en esta base.
    if (cuerpo?.code === 'PGRST205') return undefined;
    throw new Error(`Supabase respondió ${respuesta.status} al leer ${tabla}`);
  }
  const filas = (await respuesta.json()) as Fila[];
  return filas[0] ?? null;
}

const texto = (valor: unknown) => (typeof valor === 'string' ? valor.trim() : '');
/** El catálogo redondea el precio hacia arriba (limpiarPrecio en useProducts). */
const precio = (valor: unknown) => Math.ceil(Number(valor) || 0);

async function buscarRepuesto(id: string): Promise<Repuesto | null> {
  const base = (fila: Fila, stock: Stock): Repuesto => {
    const sku = texto(fila.sku);
    return {
      id,
      nombre: texto(fila.name) || 'Repuesto',
      sku,
      precio: precio(fila.price),
      imagen: texto(fila.image_url) || (sku ? `${SITIO}/imagenes_repuestos/${encodeURIComponent(sku)}.webp` : `${SITIO}/sin_imagen.webp`),
      stock,
    };
  };

  const deLaVista = await consultar('catalogo_publico', 'id,sku,name,price,image_url,disponibilidad', id);
  if (deLaVista) {
    const d = deLaVista.disponibilidad;
    return base(deLaVista, d === 'en_stock' || d === 'bajo_pedido' ? d : 'agotado');
  }
  if (deLaVista === null) return null;

  const deLaTabla = await consultar('products', 'id,sku,name,price,image_url,local_stock,importer_stock,is_active', id);
  if (!deLaTabla || deLaTabla.is_active === false) return null;
  const stock: Stock = (parseInt(String(deLaTabla.local_stock)) || 0) > 0 ? 'en_stock'
    : (parseInt(String(deLaTabla.importer_stock)) || 0) > 0 ? 'bajo_pedido'
    : 'agotado';
  return base(deLaTabla, stock);
}

const STOCK_TEXTO: Record<Stock, string> = {
  en_stock: '✅ En stock en Guayaquil · Envíos a todo Ecuador',
  bajo_pedido: '📦 Bajo pedido · Te confirmamos cuándo llega',
  agotado: 'Agotado por ahora · Pregúntanos por alternativas',
};

const escapar = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function pagina(r: Repuesto): string {
  const ficha = `/catalogo?prod=${r.id}`;
  const titulo = `${r.nombre} — ${r.precio ? `$${r.precio.toFixed(2)}` : 'Precio por confirmar'}`;
  const descripcion = `${STOCK_TEXTO[r.stock]} · LV PARTS, repuestos originales Daytona`;
  const imagen = `https://wsrv.nl/?url=${encodeURIComponent(r.imagen)}&w=1200&h=630&fit=contain&cbg=white&output=jpg&q=82`;
  const e = escapar;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(titulo)} | LV PARTS</title>
<meta name="description" content="${e(descripcion)}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${SITIO}${ficha}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="LV PARTS">
<meta property="og:locale" content="es_EC">
<meta property="og:url" content="${SITIO}/p/${r.id}">
<meta property="og:title" content="${e(titulo)}">
<meta property="og:description" content="${e(descripcion)}">
<meta property="og:image" content="${e(imagen)}">
<meta property="og:image:secure_url" content="${e(imagen)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${e(r.nombre)}">
<meta name="twitter:card" content="summary_large_image">
</head>
<body style="font-family:sans-serif;padding:24px">
<p><a href="${ficha}">Ver ${e(r.nombre)} en el catálogo de LV PARTS</a></p>
<script>location.replace(${JSON.stringify(ficha)})</script>
</body>
</html>`;
}

function redirigir(res: ServerResponse, destino: string) {
  res.statusCode = 302;
  res.setHeader('Location', destino);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '/', SITIO);
  const id = url.searchParams.get('id') || url.pathname.match(/\/p\/(\d+)/)?.[1] || '';
  if (!/^\d{1,12}$/.test(id)) return redirigir(res, '/catalogo');
  if (!SUPABASE_URL || !CLAVE) return redirigir(res, `/catalogo?prod=${id}`);

  let repuesto: Repuesto | null;
  try {
    repuesto = await buscarRepuesto(id);
  } catch {
    // Sin vista previa, pero la persona igual llega a la ficha.
    return redirigir(res, `/catalogo?prod=${id}`);
  }
  if (!repuesto) return redirigir(res, '/catalogo');

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // 10 minutos en la CDN: las vistas previas repetidas no vuelven a consultar la base.
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');
  res.end(pagina(repuesto));
}
