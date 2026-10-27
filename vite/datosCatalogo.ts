/*
  Los repuestos de la web, leídos al compilar para el sitemap y el feed de
  Google Merchant (ver vite/sitemapYFeed.ts).

  Son los mismos que ve el cliente: la vista `catalogo_publico` (migración
  20261019150000 del ERP), con la clave pública de la web, y juntados por
  SKU con la misma regla que src/hooks/useProducts.ts. Si se separan, el
  sitemap y el feed apuntan a un `?prod=` que la página no abre: si cambias
  esa regla allá, cámbiala aquí.
*/
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type Disponibilidad = 'en_stock' | 'bajo_pedido' | 'agotado';

export interface Repuesto {
  /** El id del ERP, como lo usa `?prod=`. */
  id: string;
  sku: string;
  nombre: string;
  /** El precio que muestra la página: el del ERP redondeado hacia arriba. */
  precio: number;
  disponibilidad: Disponibilidad;
  descontinuado: boolean;
  /** La foto que muestra la página, o null si no tiene. */
  imagen: string | null;
  /** Sólo cuando la vista la publique (todavía no). */
  marca: string | null;
}

interface Fila {
  id: number;
  sku: string | null;
  name: string | null;
  price: number | string | null;
  image_url: string | null;
  disponibilidad: Disponibilidad;
  descontinuado: boolean | null;
  marca?: string | null;
}

/** Toda la vista, de a mil filas y en el orden del id (sin orden, una página puede repetir filas). */
export async function leerCatalogoPublico(url: string, clave: string): Promise<Repuesto[]> {
  const base = `${url.replace(/\/$/, '')}/rest/v1/catalogo_publico`;
  const cabeceras = { apikey: clave, Authorization: `Bearer ${clave}` };
  // `marca` se pide sólo si la vista ya la tiene.
  const conMarca = (await fetch(`${base}?select=marca&limit=1`, { headers: cabeceras })).ok;
  const columnas = `id,sku,name,price,image_url,disponibilidad,descontinuado${conMarca ? ',marca' : ''}`;

  const filas: Fila[] = [];
  for (let desde = 0; ; desde += 1000) {
    const r = await fetch(`${base}?select=${columnas}&order=id&offset=${desde}&limit=1000`, { headers: cabeceras });
    if (!r.ok) throw new Error(`catalogo_publico respondió HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const pagina = (await r.json()) as Fila[];
    filas.push(...pagina);
    if (pagina.length < 1000) break;
  }
  return juntarPorSku(filas);
}

/*
  Igual que useProducts.ts: dos filas activas pueden tener el mismo SKU, y
  la página muestra una sola. Gana la de más puntaje (no descontinuada,
  disponible, con precio, con foto) y, si empatan, la de id más alto; la
  disponibilidad y la foto se completan con la otra.
*/
function juntarPorSku(filas: Fila[]): Repuesto[] {
  const porSku = new Map<string, Repuesto>();
  for (const f of filas) {
    const sku = (f.sku || '').trim();
    const nuevo: Repuesto = {
      id: String(f.id),
      sku,
      nombre: (f.name || '').trim(),
      precio: Math.ceil(Number(f.price) || 0),
      disponibilidad: f.disponibilidad,
      descontinuado: f.descontinuado === true,
      imagen: f.image_url || null,
      marca: f.marca ?? null,
    };
    const clave = (sku || nuevo.id).toUpperCase();
    const previo = porSku.get(clave);
    if (!previo) {
      porSku.set(clave, nuevo);
      continue;
    }
    const [ganador, perdedor] = puntaje(nuevo) !== puntaje(previo)
      ? (puntaje(nuevo) > puntaje(previo) ? [nuevo, previo] : [previo, nuevo])
      : (Number(nuevo.id) > Number(previo.id) ? [nuevo, previo] : [previo, nuevo]);
    const disponibles = [ganador.disponibilidad, perdedor.disponibilidad];
    porSku.set(clave, {
      ...ganador,
      disponibilidad: disponibles.includes('en_stock') ? 'en_stock' : disponibles.includes('bajo_pedido') ? 'bajo_pedido' : 'agotado',
      imagen: ganador.imagen ?? perdedor.imagen,
    });
  }
  return [...porSku.values()];
}

const puntaje = (r: Repuesto) =>
  (r.descontinuado ? 0 : 500) + (r.disponibilidad !== 'agotado' ? 250 : 0) + (r.precio > 0 ? 50 : 0) + (r.imagen ? 25 : 0);

/** El aviso gris de "sin imagen" en el Storage (2.044 bytes). */
const ETIQUETA_SIN_IMAGEN = '"50cf2a1d60097554164e5f48dc614486"';

/*
  ¿La foto es una foto del repuesto? En el Storage, 1.148 repuestos apuntan
  al mismo archivo gris de "sin imagen" y 276 a un archivo que ya no existe
  (medido el 27-oct-2026); la página los cambia por /sin_imagen.webp, pero a
  Google no se le puede mandar eso. Se pide sólo la cabecera de cada foto: es
  el aviso gris si es ese archivo o si se repite en muchos repuestos (ninguna
  foto real se repite en más de cuatro).
*/
export async function fotosReales(repuestos: Repuesto[], raiz: string): Promise<Map<string, string>> {
  const reales = new Map<string, string>();
  const enStorage = repuestos.filter(r => r.imagen);
  const etiquetas = new Map<string, string | null>();
  let siguiente = 0;
  const obrero = async () => {
    while (siguiente < enStorage.length) {
      const r = enStorage[siguiente++];
      try {
        const respuesta = await fetch(r.imagen!, { method: 'HEAD' });
        etiquetas.set(r.id, respuesta.ok ? respuesta.headers.get('etag') : null);
      } catch {
        etiquetas.set(r.id, null);
      }
    }
  };
  await Promise.all(Array.from({ length: 24 }, obrero));

  const repetidas = new Map<string, number>();
  for (const e of etiquetas.values()) if (e) repetidas.set(e, (repetidas.get(e) ?? 0) + 1);
  for (const r of enStorage) {
    const e = etiquetas.get(r.id);
    if (e && e !== ETIQUETA_SIN_IMAGEN && (repetidas.get(e) ?? 0) <= 20) reales.set(r.id, r.imagen!);
  }

  // La copia en public/imagenes_repuestos (la página la usa si la del Storage falla).
  const carpeta = path.join(raiz, 'public', 'imagenes_repuestos');
  if (existsSync(carpeta)) {
    const huellas = new Map<string, string>();
    const veces = new Map<string, number>();
    for (const archivo of readdirSync(carpeta, { withFileTypes: true })) {
      if (!archivo.isFile()) continue;
      const h = createHash('md5').update(readFileSync(path.join(carpeta, archivo.name))).digest('hex');
      huellas.set(archivo.name.toUpperCase(), h);
      veces.set(h, (veces.get(h) ?? 0) + 1);
    }
    for (const r of repuestos) {
      if (reales.has(r.id) || !r.sku) continue;
      const nombre = `${r.sku}.webp`;
      const h = huellas.get(nombre.toUpperCase());
      if (h && (veces.get(h) ?? 0) <= 20) reales.set(r.id, `/imagenes_repuestos/${encodeURIComponent(r.sku)}.webp`);
    }
  }
  return reales;
}
