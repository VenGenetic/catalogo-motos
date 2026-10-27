# LV PARTS — catálogo web ([lvparts.ec](https://www.lvparts.ec))

El catálogo público de repuestos de LV PARTS: buscar un repuesto, ver qué le
sirve a cada moto (el despiece), armar un pedido y mandarlo por WhatsApp.
Vende repuestos **nuevos**: nunca se describen como usados, de segunda o
genéricos.

Es una página de React 19 + Vite + Tailwind, sin servidor propio. Lee los
datos de Supabase (el mismo proyecto que el ERP y el agente de WhatsApp) con
la clave pública, y Vercel la publica desde `main`.

**Este repositorio es público.** Aquí sólo van valores públicos: la URL de
Supabase y la clave anónima (`VITE_SUPABASE_ANON_KEY`, que de todas formas va
dentro de la página). Nunca una clave de servicio (`service_role`,
`sb_secret_…`), planillas, volcados de la base ni datos de clientes.

## Cómo correrlo

Necesita Node 22.18 o más nuevo (en CI se usa el 24).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build, y el sitemap y el feed (ver abajo)
npm run lint
```

`.env.production` está versionado y basta para compilar. Para desarrollar,
un `.env` (no se versiona) con lo mismo:

| Variable | Qué es |
|---|---|
| `VITE_SUPABASE_URL` | El proyecto de Supabase del ERP (`xzsdsmskyosepemalage`). |
| `VITE_SUPABASE_ANON_KEY` | La clave pública (anon / publishable). |
| `VITE_META_PIXEL_ID` | El píxel de Meta. Vacío: la página funciona igual y no manda eventos. |

## Las páginas

| Dirección | Qué muestra |
|---|---|
| `/` | Portada: elegir la moto, sistemas, cómo llegar. |
| `/catalogo` | Todo el catálogo, con buscador (`?q=`) y filtro por sistema. |
| `/catalogo/<moto>` | El despiece de una moto (`/catalogo/wolf-250`): sólo lo que le sirve. |
| `?prod=<id>` | La ficha de un repuesto, encima de cualquier página. `<id>` es el id del ERP. |
| `/contacto`, `/privacidad` | Contacto y política de privacidad. |

El enrutado es del navegador (`BrowserRouter`): `vercel.json` manda todo a
`index.html`, salvo los archivos que existen (fotos, `sitemap.xml`, el feed).

## De dónde salen los datos

Todo vive en el Supabase del ERP. Las migraciones están en el repo
`Sistema_ERP` (`supabase/migrations/`) y se aplican a mano en el SQL Editor de
ese proyecto.

- **`catalogo_publico`** (vista, migración `20261019150000`): lo único que la
  página lee. Sólo repuestos activos, sin costos ni cantidades, con la
  disponibilidad (`en_stock`, `bajo_pedido`, `agotado`) y el "descontinuado"
  ya calculados con las mismas reglas del ERP y del bot. La clave pública no
  puede leer la tabla `products`.
- **`solicitudes_web`** (migración `20261022120000`): cada "Pedir" y cada
  "Copiar proforma" del pedido deja una fila, que el equipo ve en el ERP
  (Ventas → Pedidos de la web). La clave pública sólo puede insertar.
- **`web_ad_clicks`**: el clic del anuncio (gclid, fbclid…) y el token corto
  que viaja en el mensaje de WhatsApp (`src/utils/attribution.ts`).
- **Fotos**: `image_url` de cada repuesto, en el Storage de Supabase (bucket
  `product_images`). `public/imagenes_repuestos` es una copia vieja que la
  página usa sólo si la del Storage falla.

`src/hooks/useProducts.ts` baja la vista entera (de a mil, en paralelo), la
guarda una hora en el navegador y junta por SKU las filas repetidas.

## Reglas que comparte con el ERP y el agente

Si una cambia en un lado y no en el otro, la web le dice al cliente una cosa y
el vendedor o el bot otra.

- **Despiece por moto**: `src/utils/despiece/reglas.ts` y `clasificador.js`
  son copias exactas del ERP (`apartamentos/bodega/despiece.ts` y
  `scripts/meta/clasificador.js`). No se editan aquí: se cambian en el ERP y
  se traen con `npm run sincronizar-despiece` (o, desde el ERP,
  `npm run despiece:copiar`, que copia también al agente).
  `npm run check:despiece` falla si la copia quedó vieja o se editó a mano.
- **Sistema de cada pieza** (`src/utils/sistemas.ts`): copia a mano, porque se
  usa al cargar los productos y no puede tener lookbehind (ver abajo).
  `npm run check:despiece` la compara con la del ERP repuesto por repuesto.
- **Precio**: el del ERP redondeado hacia arriba al dólar, igual que el ERP y
  el agente.

## Lo que se genera en cada build

El plugin `vite/sitemapYFeed.ts` lee `catalogo_publico` al compilar y deja en
`dist/`:

- **`sitemap.xml`**: inicio, catálogo, contacto, privacidad, la página de cada
  moto del filtro y la ficha de cada repuesto. `public/robots.txt` lo anuncia.
- **`feeds/google-merchant.xml`**: el feed para Google Merchant Center con lo
  que está en bodega, con precio, con foto real y no descontinuado. No lleva
  costos, márgenes ni cantidades: se publica en
  `https://www.lvparts.ec/feeds/google-merchant.xml`.

Los datos son los del momento del build: Vercel compila con cada push a
`main`. Si la base no responde, el build no falla: el sitemap sale sin
repuestos y el feed no se publica.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | La página en modo desarrollo. |
| `npm run build` | Compila (con `tsc`), y genera el sitemap y el feed. |
| `npm run lint` | ESLint. |
| `npm run sincronizar-despiece` | Trae las reglas del despiece del último commit del ERP (`ERP_DIR`, por defecto `../../Sistema_ERP`). |
| `npm run check:despiece` | Falla si la copia del despiece se separó del ERP. |
| `npm run fotos:sin-foto` | Escribe `informes/repuestos-sin-foto.csv`: los repuestos que no muestran una foto real, primero los de bodega. |

## Publicar

- Una rama por cambio. A `main` sólo con la aprobación del dueño: Vercel
  publica `main` en lvparts.ec.
- GitHub Actions corre `npm ci`, `lint`, `build` y `check:despiece` en cada
  push (`.github/workflows/ci.yml`), y cada mañana la lista de repuestos sin
  foto (`.github/workflows/repuestos-sin-foto.yml`, en la pestaña Actions).
- Subir cambios en `.github/workflows/` necesita una cuenta de GitHub con
  permiso de workflows.

## Navegadores viejos

La página se compila para Safari 13 (iPhones que no se actualizan). Las
reglas del despiece usan lookbehind (`(?<!SUPER\s*)WOLF`), que Safari entiende
recién desde iOS 16.4: por eso el despiece se carga en su propio archivo
(`src/utils/cargarDespiece.ts`) y, si el navegador no puede, el catálogo sigue
funcionando sin el filtro por moto. Nada con lookbehind puede entrar al
archivo principal.

## Carpetas

| Carpeta | Qué hay |
|---|---|
| `src/components/` | Las pantallas y piezas de la página. |
| `src/hooks/useProducts.ts` | La carga del catálogo. |
| `src/utils/` | Búsqueda, despiece, sistemas, pedido (`solicitudes.ts`), atribución, medición. |
| `src/config/` | Número de WhatsApp, motos del filtro, Supabase. |
| `vite/` | El plugin que genera el sitemap y el feed. |
| `scripts/` | Despiece y lista de repuestos sin foto. |
| `public/` | Logo, imágenes de motos, `robots.txt` y la copia vieja de las fotos. |
