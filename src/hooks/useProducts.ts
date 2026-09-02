import { useState, useEffect } from 'react';
import { Producto } from '../types';
import { detectarSeccion } from '../utils/categories';
import { limpiarTexto } from '../utils/helpers';
import { supabase } from '../config/supabase';

// Helper local para limpiar precios
const limpiarPrecio = (valor: unknown): number => {
  if (typeof valor === 'number') return Math.ceil(valor);
  if (!valor) return 0;
  const limpio = String(valor).replace(/[^0-9.]/g, '');
  const numero = parseFloat(limpio);
  return isNaN(numero) ? 0 : Math.ceil(numero);
};



const CACHE_KEY = 'cached_products_v11';
const CACHE_TIME_KEY = 'cached_products_time';
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hora
const FRESH_CACHE_TIME = 1000 * 60 * 30; // 30 Minutos (Evita sobreconsumo de ancho de banda en Vercel)

export const useProducts = () => {
  const [productos, setProductos] = useState<Producto[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        if (cachedData && cachedTime) {
          const age = Date.now() - parseInt(cachedTime);
          // Si es válido (menos de 24h), lo inicializamos directamente sin flash de carga
          if (age < CACHE_DURATION * 24) {
             return JSON.parse(cachedData);
          }
        }
      }
    } catch (e) {
      console.warn('Error leyendo caché inicial', e);
    }
    return [];
  });
  
  // Si ya tenemos productos del caché síncrono, loading empieza en false.
  const [loading, setLoading] = useState(() => productos.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const MAX_RETRIES = 3;

    // 1. CARGA INICIAL DESDE CACHÉ (Estrategia: Stale-While-Revalidate)
    // Mostramos los datos de localStorage al instante, pero SIEMPRE consultamos
    // a Supabase en segundo plano para actualizar y refrescar los cambios de ERP.
    const fetchProducts = async (): Promise<void> => {

      try {
        // Evitar consultas repetidas en segundo plano si la caché es fresca (menos de 30s en producción)
        const esLocal = typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' || 
           window.location.hostname === '[::1]');

        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        if (cachedTime && productos.length > 0 && !esLocal) {
          const age = Date.now() - parseInt(cachedTime);
          if (age < FRESH_CACHE_TIME) {
            console.log('⚡ La caché es fresca (menos de 30 segundos). Evitando consulta a Supabase.');
            setLoading(false);
            return;
          }
        }
        // Verificar conectividad antes de hacer la petición
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          // Si no hay internet y ya cargamos caché, no tiramos error, solo avisamos
          const hasCache = productos.length > 0;
          if (hasCache) {
            console.log('Modo offline: Usando datos en caché');
            return;
          }
          throw new Error('Sin conexión a internet. Verifica tu conexión y recarga la página.');
        }

        const mapaProductos = new Map<string, Producto>();

        // El ERP no tiene UNIQUE sobre 'sku' y su borrado es lógico
        // (update is_active=false), así que la fila descartada sigue viviendo
        // en la tabla junto a la buena. Como acá agrupamos por SKU, hay que
        // decidir cuál de las dos gana.
        const normalizarOrigenes = (lista: string[]): string[] => {
          const set = new Set(lista);
          if (set.has('En Stock') || set.has('Guayaquil')) return ['En Stock'];
          if (set.has('bajo pedido')) return ['bajo pedido'];
          return [];
        };

        const tieneImagen = (p: Producto) => !!p.imagen && !p.imagen.includes('sin_imagen');

        // Puntaje de "calidad" de una fila. Se elige por esto y NO por orden de
        // llegada: antes ganaba la última página en llegar, que solía ser la
        // fila inactiva, y el producto bueno desaparecía tras el badge INACTIVO.
        const puntajeFila = (p: Producto): number => {
          let score = 0;
          if (p.is_active !== false) score += 1000;
          if (!p.is_discontinued) score += 500;
          if (p.stock) score += 250;
          if (p.precio > 0) score += 50;
          if (tieneImagen(p)) score += 25;
          return score;
        };

        const agregarProducto = (producto: Producto) => {
          const clave = (producto.codigo_referencia || producto.id || '').toUpperCase();
          const existente = mapaProductos.get(clave);

          if (!existente) {
            const origenes = normalizarOrigenes(producto.origenes || []);
            mapaProductos.set(clave, {
              ...producto,
              origenes,
              stock: origenes.length > 0,
              textoBusqueda: limpiarTexto(`${producto.nombre} ${producto.codigo_referencia || ''} ${producto.categoria || ''} ${producto.seccion || ''} ${origenes.join(' ')}`)
            });
            return;
          }

          const puntajeNuevo = puntajeFila(producto);
          const puntajeExistente = puntajeFila(existente);

          let ganador: Producto;
          let perdedor: Producto;
          if (puntajeNuevo !== puntajeExistente) {
            ganador = puntajeNuevo > puntajeExistente ? producto : existente;
            perdedor = puntajeNuevo > puntajeExistente ? existente : producto;
          } else {
            // Empate: gana el id más alto (la fila más nueva del ERP). Es un
            // desempate estable, así el resultado no depende del orden en que
            // respondan las páginas que se piden en paralelo.
            const nuevoEsMasNuevo = (parseInt(producto.id) || 0) > (parseInt(existente.id) || 0);
            ganador = nuevoEsMasNuevo ? producto : existente;
            perdedor = nuevoEsMasNuevo ? existente : producto;
          }

          // Solo las filas activas aportan origen (las inactivas llegan con la
          // lista vacía), así que 'stock' y 'origenes' quedan siempre
          // coherentes entre sí: nunca más un AGOTADO con badge "En Stock".
          const origenes = normalizarOrigenes([...(ganador.origenes || []), ...(perdedor.origenes || [])]);
          const hayStock = origenes.length > 0;

          mapaProductos.set(clave, {
            ...ganador,
            origenes,
            stock: hayStock,
            cantidad_disponible: hayStock
              ? (Math.max(ganador.cantidad_disponible || 0, perdedor.cantidad_disponible || 0) || undefined)
              : undefined,
            // Si a la fila ganadora le falta foto, rescatamos la de la otra.
            imagen: tieneImagen(ganador) ? ganador.imagen : (tieneImagen(perdedor) ? perdedor.imagen : ganador.imagen),
            gallery: ganador.gallery?.length ? ganador.gallery : (perdedor.gallery || []),
            textoBusqueda: limpiarTexto(`${ganador.nombre} ${ganador.codigo_referencia || ''} ${ganador.categoria || ''} ${ganador.seccion || ''} ${origenes.join(' ')}`)
          });
        };

        let rawProducts: any[] = [];

        console.log('📡 Consultando productos desde Supabase...');
        try {
          const pageSize = 1000;
          const selectCols = 'id, sku, name, category, price, local_stock, importer_stock, is_active, is_discontinued, image_url, gallery';

          // Primera página: pedimos el conteo total en la misma consulta para saber
          // cuántas páginas faltan y traerlas todas EN PARALELO (en vez de una por una).
          // El .order('id') es obligatorio: sin ORDER BY explícito Postgres no
          // garantiza un orden estable entre consultas, y como las páginas se
          // piden en paralelo con .range() una fila puede repetirse en dos
          // páginas y otra no salir en ninguna.
          const { data: firstPage, error: firstError, count } = await supabase
            .from('products')
            .select(selectCols, { count: 'exact' })
            .order('id', { ascending: true })
            .range(0, pageSize - 1);

          if (firstError) throw firstError;

          let allData: any[] = firstPage || [];

          const totalPages = count ? Math.ceil(count / pageSize) : 1;
          if (totalPages > 1) {
            const pagePromises = [];
            for (let page = 1; page < totalPages; page++) {
              pagePromises.push(
                supabase
                  .from('products')
                  .select(selectCols)
                  .order('id', { ascending: true })
                  .range(page * pageSize, (page + 1) * pageSize - 1)
              );
            }
            const results = await Promise.all(pagePromises);
            for (const r of results) {
              if (r.error) throw r.error;
              if (r.data) allData = allData.concat(r.data);
            }
          }

          rawProducts = allData;
        } catch (sbErr) {
          console.error('⚠️ Supabase falló al cargar productos:', sbErr);
          throw sbErr;
        }

        if (rawProducts.length === 0) {
           throw new Error('No se encontraron productos en Supabase.');
        }

        // Procesar datos exitosos de Supabase (Mapeo de la tabla 'products')
        console.log(`📦 Procesando ${rawProducts.length} productos cargados de Supabase.`);
          rawProducts.forEach((p) => {
            const skuVal = (p.sku || p.codigo_referencia || '').trim();
            const nameVal = (p.name || p.nombre || '').trim();
            const categoryVal = (p.category || p.categoria || 'General').trim();
            const priceVal = p.price !== undefined ? p.price : (p.precio || 0);

            const localStockQty = parseInt(p.local_stock) || 0;
            const importerStockQty = parseInt(p.importer_stock) || 0;

            // Almacén Local -> 'En Stock'
            // Solo Importadora -> 'bajo pedido'
            // Sin stock en ninguno -> Agotado
            let tieneStock = false;
            let origenesRaw: string[] = [];

            if (p.is_active !== false) {
              if (localStockQty > 0) {
                tieneStock = true;
                origenesRaw = ['En Stock'];
              } else if (importerStockQty > 0) {
                tieneStock = true;
                origenesRaw = ['bajo pedido'];
              }
            }

            const seccionCalc = detectarSeccion({
              nombre: nameVal,
              categoria: categoryVal,
              codigo_referencia: skuVal
            } as any);

            // Imagen desde la URL de Supabase storage o local fallback
            const imageVal = p.image_url || (skuVal ? `/imagenes_repuestos/${skuVal}.webp` : 'sin_imagen.jpg');

            const procesado: Producto = {
              id: String(p.id || skuVal),
              codigo_referencia: skuVal,
              nombre: nameVal,
              precio: limpiarPrecio(priceVal),
              categoria: categoryVal,
              seccion: seccionCalc,
              imagen: imageVal,
              stock: tieneStock,
              cantidad_disponible: localStockQty > 0 ? localStockQty : (importerStockQty > 0 ? importerStockQty : undefined),
              origenes: origenesRaw,
              is_discontinued: p.is_discontinued === true,
              is_active: p.is_active !== false,
              gallery: Array.isArray(p.gallery) ? p.gallery : [],
              textoBusqueda: limpiarTexto(`${nameVal} ${skuVal} ${categoryVal} ${seccionCalc} ${origenesRaw.join(' ')}`)
            };
            agregarProducto(procesado);
          });

        // Sincronización con API de Inventario (Pagina Vendedor) - Solo en local/desarrollo
        if (esLocal) {
          try {
            const apiRes = await fetch('http://localhost:3000/api/inventory');
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              if (Array.isArray(apiData)) {
                console.log(`📦 Sincronizando ${apiData.length} productos desde API...`);
                apiData.forEach((p: any) => {
                  const clave = (p.codigo_referencia || '').toUpperCase();
                  const existente = mapaProductos.get(clave);

                  if (existente) {
                    const nuevoStock = typeof p.stock === 'boolean' ? p.stock : existente.stock;
                    mapaProductos.set(clave, {
                      ...existente,
                      precio: typeof p.precio === 'number' ? p.precio : existente.precio,
                      stock: nuevoStock,
                      origenes: nuevoStock ? existente.origenes : [],
                      cantidad_disponible: typeof p.cantidad === 'number' ? p.cantidad : undefined,
                      // Si el nombre en el CSV es mejor, se podría actualizar aqui
                    });
                  }
                });
              }
            }
          } catch (apiErr) {
            console.warn('⚠️ No se pudo conectar con el API de inventario (usando datos locales)', apiErr);
          }
        }


        const procesados = Array.from(mapaProductos.values());

        if (procesados.length === 0) {
          throw new Error('No se encontraron productos en la base de datos.');
        }

        setProductos(procesados);

        // GUARDAR EN CACHÉ PARA LA PRÓXIMA VEZ
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(procesados));
          localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        } catch (e) {
          console.warn('No se pudo guardar en caché (posiblemente cuota excedida)', e);
        }

      } catch (err) {
        console.error("Error cargando productos:", err);

        // Si ya tenemos productos (de caché), no mostramos error fatal, solo logueamos
        if (productos.length > 0) {
          console.warn('Falló la actualización en segundo plano, manteniendo datos en caché.');
          return;
        }

        // Implementar reintentos automáticos en caso de error de red
        if (retryCount < MAX_RETRIES && err instanceof Error &&
          (err.name === 'AbortError' || err.message.includes('Failed to fetch'))) {
          retryCount++;
          console.log(`Reintentando carga de productos (${retryCount}/${MAX_RETRIES})...`);
          setTimeout(() => fetchProducts(), 2000 * retryCount); // Backoff exponencial
          return;
        }

        setError(err instanceof Error ? err.message : 'Error desconocido al cargar productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { productos, loading, error };
};