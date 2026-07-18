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

// Función para generar un ID consistente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generarIdDeterministico = (p: any) => {
  if (p.id) return String(p.id);

  const clave = `${p.codigo_referencia || ''}-${p.nombre}`;
  try {
    return btoa(clave).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  } catch {
    return String(Math.abs(clave.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)));
  }
};

const CACHE_KEY = 'cached_products_v8';
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

        const agregarProducto = (producto: Producto) => {
          const clave = (producto.codigo_referencia || producto.id || '').toUpperCase();
          const existente = mapaProductos.get(clave);

          if (existente) {
            // Combinar orígenes respetando si está vacío
            const todosOrigenes = new Set([...(existente.origenes || []), ...(producto.origenes || [])]);
            let origenes: string[] = [];
            if (todosOrigenes.has('En Stock') || todosOrigenes.has('Guayaquil')) {
              origenes = ['En Stock'];
            } else if (todosOrigenes.has('bajo pedido')) {
              origenes = ['bajo pedido'];
            }

            const imagenElegida = existente.imagen?.includes('sin_imagen') && producto.imagen
              ? producto.imagen
              : existente.imagen;

            mapaProductos.set(clave, {
              ...existente,
              ...producto,
              imagen: imagenElegida || producto.imagen,
              origenes,
              textoBusqueda: limpiarTexto(`${producto.nombre} ${producto.codigo_referencia || ''} ${producto.categoria || ''} ${producto.seccion || ''} ${origenes.join(' ')}`)
            });
          } else {
            // Para productos nuevos, respetar la lista de orígenes calculada
            let origenes: string[] = [];
            const prodOrigenes = producto.origenes || [];
            if (prodOrigenes.includes('En Stock') || prodOrigenes.includes('Guayaquil')) {
              origenes = ['En Stock'];
            } else if (prodOrigenes.includes('bajo pedido')) {
              origenes = ['bajo pedido'];
            }

            mapaProductos.set(clave, {
              ...producto,
              origenes,
              textoBusqueda: limpiarTexto(`${producto.nombre} ${producto.codigo_referencia || ''} ${producto.categoria || ''} ${producto.seccion || ''} ${origenes.join(' ')}`)
            });
          }
        };

        // 1. Cargar desde Supabase Pro (si no es placeholder)
        const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                              !import.meta.env.VITE_SUPABASE_ANON_KEY || 
                              import.meta.env.VITE_SUPABASE_URL.includes('tu-proyecto');

        let rawProducts: any[] = [];

        if (!isPlaceholder) {
          console.log('📡 Consultando productos desde Supabase Pro...');
          try {
            let allData: any[] = [];
            let pageNum = 0;
            const pageSize = 1000;
            
            while (true) {
              const { data, error } = await supabase
                .from('products')
                .select('id, sku, name, category, price, local_stock, importer_stock, is_active, is_discontinued, seccion, image_url, gallery')
                .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

              if (error) throw error;
              if (!data || data.length === 0) break;
              allData = allData.concat(data);
              if (data.length < pageSize) break; // Fin de los registros
              pageNum++;
            }

            rawProducts = allData;
          } catch (sbErr) {
            console.warn('⚠️ Supabase falló, recurriendo a archivos JSON estáticos:', sbErr);
          }
        }

        // 2. Si no hay datos de Supabase, cargar los JSON estáticos locales (Fallback)
        if (rawProducts.length === 0) {
          console.log('📂 Usando archivos JSON locales estáticos (Fallback)...');
          const fuentes = [
            { url: '/data_guayaquil.json', origen: 'Guayaquil' },
            { url: '/data.json', origen: 'bajo pedido' },
            { url: '/inventario_supabase.json', origen: 'En Stock' }
          ];

          const fetchFuente = async (url: string) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            const res = await fetch(url, {
              signal: controller.signal,
              headers: { 'Cache-Control': 'max-age=300', 'Accept': 'application/json' }
            });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          };

          const resultados = await Promise.all(
            fuentes.map(async (fuente) => {
              const data = await fetchFuente(fuente.url);
              let raw: any[] = [];
              if (Array.isArray(data)) raw = data;
              else if (Array.isArray(data.RAW_SCRAPED_DATA)) raw = data.RAW_SCRAPED_DATA;
              else if (Array.isArray(data.products)) raw = data.products;
              return { raw, origen: fuente.origen };
            })
          );

          resultados.forEach(({ raw, origen }) => {
            raw.forEach((p) => {
              const seccionCalc = detectarSeccion(p);
              const nombreImagenLocal = p.codigo_referencia
                ? `/imagenes_repuestos/${p.codigo_referencia}.webp`
                : null;

              const tieneStock = p.stock !== undefined ? p.stock : true;
              const origenesRaw = tieneStock ? [origen] : [];

              const procesado: Producto = {
                ...p,
                id: generarIdDeterministico(p),
                precio: limpiarPrecio(p.precio),
                seccion: seccionCalc,
                imagen: nombreImagenLocal || p.imagen,
                stock: tieneStock,
                origenes: origenesRaw,
                textoBusqueda: limpiarTexto(`${p.nombre} ${p.codigo_referencia || ''} ${p.categoria || ''} ${seccionCalc} ${origenesRaw.join(' ')}`)
              };
              agregarProducto(procesado);
            });
          });
        } else {
          // 3. Procesar datos exitosos de Supabase (Mapeo de la tabla 'products')
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

            const seccionCalc = p.seccion || detectarSeccion({
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
        }

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