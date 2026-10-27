/*
  sitemap.xml y feeds/google-merchant.xml, armados en cada `vite build` con
  los repuestos de ese momento (vite/datosCatalogo.ts).

  · sitemap.xml: el inicio, el catálogo, contacto, privacidad, la página de
    cada moto del filtro (/catalogo/wolf-250) y la ficha de cada repuesto
    (/catalogo?prod=<id>, la misma dirección que comparte el agente).
  · feeds/google-merchant.xml: lo que Google Shopping puede mostrar ya: en
    bodega, con precio, con foto real y no descontinuado, el mismo criterio
    del feed de Meta del ERP (scripts/meta/generar-feed-v2.js). Sin lo que no
    puede ser público (costo, margen, cantidades): se publica en lvparts.ec.

  Si la base no responde, el build no se cae: el sitemap sale sin repuestos y
  el feed no se publica (un feed vacío le diría a Google que no hay nada).
  Los datos son los del momento del build.
*/
import type { Plugin } from 'vite';
import { MODELOS_CATALOGO } from '../src/config/constants';
import { modelosCompatiblesDe, sistemaDe } from '../src/utils/despiece/reglas';
import { rangoTicket, tipoPieza } from '../src/utils/despiece/clasificador.js';
import { fotosReales, leerCatalogoPublico, type Repuesto } from './datosCatalogo';

const SITIO = 'https://www.lvparts.ec';

/*
  "Vehículos y recambios > Piezas y accesorios para vehículos > Piezas para
  vehículos motorizados" en la taxonomía de Google. (El 3403 que usa el feed
  de Meta es "Cintas para empuñaduras de raquetas de tenis".)
*/
const CATEGORIA_GOOGLE = '899';

/*
  La vista todavía no publica la marca. En el ERP, 6.045 de los 6.514
  repuestos activos son DAYTONA (27-oct-2026); los demás (Alterna, Bost,
  Moxal…) saldrían con esta marca hasta que `catalogo_publico` tenga `marca`.
*/
const MARCA_POR_DEFECTO = 'Daytona';

export const urlDeRepuesto = (r: Pick<Repuesto, 'id'>) => `${SITIO}/catalogo?prod=${encodeURIComponent(r.id)}`;

const xml = (texto: string) => texto
  // eslint-disable-next-line no-control-regex
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const SIGLAS = new Set(['CDI', 'ECU', 'LED', 'USB', 'ABS', 'CBS', 'ATV', 'UTV', 'EFI', 'TPS', 'DOHC', 'SOHC']);
// Sin "DEL": en bodega es "delantero" ("ESTRIBO DEL CON BASE"), no el artículo.
const ENLACES = new Set(['DE', 'LA', 'LAS', 'EL', 'LOS', 'Y', 'O', 'PARA', 'CON', 'SIN', 'EN', 'POR', 'A', 'AL']);

/**
 * El nombre de bodega, que viene en mayúsculas, escrito para un título:
 * "TAPA FILTRO ACEITE WOLF 250CC/MAVERICK" → "Tapa Filtro Aceite Wolf 250cc/Maverick".
 * Los códigos con números (GP1, CB250) y las siglas cortas (DK, LS) quedan igual.
 */
export function legible(nombre: string): string {
  let primera = true;
  return nombre.replace(/\s+/g, ' ').trim().replace(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+/g, palabra => {
    const p = palabra.toUpperCase();
    const esPrimera = primera;
    primera = false;
    if (/\d/.test(p)) return p.replace(/(\d)CC$/, '$1cc');
    if (SIGLAS.has(p) || p.length <= 2 && !ENLACES.has(p)) return p;
    if (ENLACES.has(p) && !esPrimera) return p.toLowerCase();
    return p.charAt(0) + p.slice(1).toLowerCase();
  });
}

function sitemap(repuestos: Repuesto[]): string {
  const direcciones = [
    `${SITIO}/`,
    `${SITIO}/catalogo`,
    `${SITIO}/contacto`,
    `${SITIO}/privacidad`,
    ...MODELOS_CATALOGO.map(m => `${SITIO}/catalogo/${encodeURIComponent(m.id)}`),
    ...repuestos.map(urlDeRepuesto),
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...direcciones.map(d => `  <url><loc>${xml(d)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
}

function itemDelFeed(r: Repuesto, foto: string): string {
  const producto = { id: Number(r.id), sku: r.sku || null, name: r.nombre };
  const motos = modelosCompatiblesDe(producto).map(c => c.modelo);
  const titulo = legible(r.nombre).slice(0, 150);
  const descripcion = [
    `${legible(r.nombre)}.`,
    motos.length ? `Sirve para: ${motos.slice(0, 8).map(m => m.nombre).join(', ')}.` : '',
    'Repuesto nuevo, en stock en Guayaquil. Envíos a todo Ecuador.',
    r.sku ? `Código ${r.sku}.` : '',
  ].filter(Boolean).join(' ').slice(0, 5000);

  const campos: [string, string][] = [
    ['g:id', r.sku || r.id],
    ['g:title', titulo],
    ['g:description', descripcion],
    ['g:link', urlDeRepuesto(r)],
    ['g:image_link', foto.startsWith('/') ? `${SITIO}${foto}` : foto],
    ['g:availability', 'in_stock'],
    ['g:price', `${r.precio.toFixed(2)} USD`],
    ['g:condition', 'new'],
    ['g:brand', r.marca || MARCA_POR_DEFECTO],
    ['g:identifier_exists', 'no'],
    ['g:google_product_category', CATEGORIA_GOOGLE],
    ['g:product_type', tipoPieza(r.nombre)],
    // Los mismos cortes de ticket que el feed de Meta (custom_label_0).
    ['g:custom_label_0', rangoTicket(r.precio)],
    ['g:custom_label_1', motos[0]?.id ?? 'sin_moto'],
    ['g:custom_label_2', sistemaDe(r.nombre)],
  ];
  return ['    <item>', ...campos.map(([c, v]) => `      <${c}>${xml(v)}</${c}>`), '    </item>'].join('\n');
}

function feedGoogle(items: string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '  <channel>',
    '    <title>LV PARTS · Repuestos de moto</title>',
    `    <link>${SITIO}/</link>`,
    '    <description>Repuestos en bodega, con precio y foto, del catálogo de lvparts.ec.</description>',
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

export function sitemapYFeed(): Plugin {
  let url = '';
  let clave = '';
  let raiz = '';
  return {
    name: 'lvparts-sitemap-y-feed',
    apply: 'build',
    configResolved(config) {
      url = String(config.env.VITE_SUPABASE_URL ?? '');
      clave = String(config.env.VITE_SUPABASE_ANON_KEY ?? '');
      raiz = config.root;
    },
    async generateBundle() {
      let repuestos: Repuesto[] = [];
      try {
        if (!url || !clave) throw new Error('faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
        repuestos = await leerCatalogoPublico(url, clave);
      } catch (error) {
        this.warn(`sitemap y feed sin repuestos: ${(error as Error).message}`);
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(repuestos) });
      if (!repuestos.length) return;

      const candidatos = repuestos.filter(r => r.disponibilidad === 'en_stock' && r.precio > 0 && !r.descontinuado);
      const fotos = await fotosReales(candidatos, raiz);
      const items = candidatos.filter(r => fotos.has(r.id)).map(r => itemDelFeed(r, fotos.get(r.id)!));
      this.emitFile({ type: 'asset', fileName: 'feeds/google-merchant.xml', source: feedGoogle(items) });

      const conMarca = repuestos.some(r => r.marca);
      console.log(`\nsitemap.xml: ${repuestos.length} repuestos y ${MODELOS_CATALOGO.length} motos.`
        + `\nfeeds/google-merchant.xml: ${items.length} de ${candidatos.length} repuestos en bodega con precio`
        + ` (${candidatos.length - items.length} sin foto real).`
        + (conMarca ? '' : `\n  Aviso: catalogo_publico no tiene "marca"; todos salen como ${MARCA_POR_DEFECTO}.`));
    },
  };
}
