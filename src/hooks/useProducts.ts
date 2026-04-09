import { useState, useEffect } from 'react';
import { Producto } from '../types';
import { detectarSeccion } from '../utils/categories';
import { limpiarTexto } from '../utils/helpers';

// Helper local para limpiar precios
const limpiarPrecio = (valor: unknown): number => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  const limpio = String(valor).replace(/[^0-9.]/g, '');
  const numero = parseFloat(limpio);
  return isNaN(numero) ? 0 : numero;
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

export const useProducts = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const CACHE_KEY = 'cached_products_v4';
    const CACHE_TIME_KEY = 'cached_products_time';
    const CACHE_DURATION = 1000 * 60 * 60; // 1 Hora

    // 1. CARGA INICIAL DESDE CACHÉ (Estrategia: Cache-First con TTL corto, luego Stale-While-Revalidate)
    let shouldUseCache = false;
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

      if (cachedData && cachedTime) {
        const age = Date.now() - parseInt(cachedTime);
        // Si el caché tiene menos de 15 minutos, lo consideramos FRESCO y no recargamos de red
        const FRESH_CACHE_TIME = 1000 * 60 * 15;

        if (age < FRESH_CACHE_TIME) {
          setProductos(JSON.parse(cachedData));
          setLoading(false);
          shouldUseCache = true;
          console.log('⚡ Usando caché fresco, omitiendo red');
          return; // <--- SALIR AQUÍ PARA EVITAR FETCH
        } else if (age < CACHE_DURATION * 24) {
          // Si es viejo pero válido (menos de 24h), lo mostramos "mientras" actualizamos (Stale-While-Revalidate)
          setProductos(JSON.parse(cachedData));
          setLoading(false);
        }
      }
    } catch (e) {
      console.warn('Error leyendo caché local', e);
    }

    const fetchProducts = async (): Promise<void> => {
      // Doble verificación por si acaso
      if (shouldUseCache) return;

      try {
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

        const fuentes = [
          { url: '/data_guayaquil.json', origen: 'Guayaquil' },
          { url: '/data.json', origen: 'Cuenca (bajo pedido)' }
        ];

        const fetchFuente = async (url: string) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const res = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'max-age=300',
              'Accept': 'application/json'
            }
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            if (res.status === 404) {
              throw new Error(`Archivo de datos no encontrado (${url}). Contacta al soporte.`);
            } else if (res.status >= 500) {
              throw new Error('Error del servidor. Intenta nuevamente en unos minutos.');
            } else {
              throw new Error(`Error al cargar datos (${res.status})`);
            }
          }

          return res.json();
        };

        const resultados = await Promise.all(
          fuentes.map(async (fuente) => {
            const data = await fetchFuente(fuente.url);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let raw: any[] = [];

            if (Array.isArray(data)) raw = data;
            else if (Array.isArray(data.RAW_SCRAPED_DATA)) raw = data.RAW_SCRAPED_DATA;
            else if (Array.isArray(data.products)) raw = data.products;

            return { raw, origen: fuente.origen };
          })
        );

        const mapaProductos = new Map<string, Producto>();

        const agregarProducto = (producto: Producto) => {
          const clave = (producto.codigo_referencia || producto.id || '').toUpperCase();
          const existente = mapaProductos.get(clave);

          if (existente) {
            const origenes = Array.from(new Set([...(existente.origenes || []), ...(producto.origenes || [])]));

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
            mapaProductos.set(clave, producto);
          }
        };

        resultados.forEach(({ raw, origen }) => {
          raw.forEach((p) => {
            const seccionCalc = detectarSeccion(p);
            const nombreImagenLocal = p.codigo_referencia
              ? `/imagenes_repuestos/${p.codigo_referencia}.webp`
              : null;

            const procesado: Producto = {
              ...p,
              id: generarIdDeterministico(p),
              precio: limpiarPrecio(p.precio),
              seccion: seccionCalc,
              imagen: nombreImagenLocal || p.imagen,
              origenes: [origen],
              textoBusqueda: limpiarTexto(`${p.nombre} ${p.codigo_referencia || ''} ${p.categoria || ''} ${seccionCalc} ${origen}`)
            };

            agregarProducto(procesado);
          });
        });

        // Sincronización con API de Inventario (Pagina Vendedor)
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
                  mapaProductos.set(clave, {
                    ...existente,
                    precio: typeof p.precio === 'number' ? p.precio : existente.precio,
                    stock: typeof p.stock === 'boolean' ? p.stock : existente.stock,
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