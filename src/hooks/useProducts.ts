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

    const fetchProducts = async (): Promise<void> => {
      try {
        // Verificar conectividad antes de hacer la petición
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          throw new Error('Sin conexión a internet. Verifica tu conexión y recarga la página.');
        }

        // Timeout para conexiones lentas (especialmente útil en móviles)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

        const res = await fetch('/data.json', {
          signal: controller.signal,
          // Agregar headers para mejor compatibilidad y cache
          headers: {
            'Cache-Control': 'max-age=300', // Cache por 5 minutos
            'Accept': 'application/json'
          }
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Archivo de datos no encontrado. Contacta al soporte.');
          } else if (res.status >= 500) {
            throw new Error('Error del servidor. Intenta nuevamente en unos minutos.');
          } else {
            throw new Error(`Error al cargar datos (${res.status})`);
          }
        }

        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let raw: any[] = [];

        if (Array.isArray(data)) raw = data;
        else if (Array.isArray(data.RAW_SCRAPED_DATA)) raw = data.RAW_SCRAPED_DATA;
        else if (Array.isArray(data.products)) raw = data.products;

        if (raw.length === 0) {
          throw new Error('No se encontraron productos en la base de datos.');
        }

        const procesados = raw.map((p) => {
          const seccionCalc = detectarSeccion(p);
          
          // Lógica para construir el nombre de la imagen local
          // Asumimos que las guardas en public/imagenes_repuestos/
          // Si están en otra carpeta, cambia '/imagenes_repuestos/' por la ruta correcta.
          const nombreImagenLocal = p.codigo_referencia 
            ? `/imagenes_repuestos/${p.codigo_referencia}_cut.webp`
            : null;

          return {
            ...p,
            id: generarIdDeterministico(p), 
            precio: limpiarPrecio(p.precio),
            seccion: seccionCalc,
            // AQUÍ EL CAMBIO: Usamos la imagen local si hay código, sino dejamos la original o vacío
            imagen: nombreImagenLocal || p.imagen,
            textoBusqueda: limpiarTexto(`${p.nombre} ${p.codigo_referencia || ''} ${p.categoria || ''} ${seccionCalc}`)
          };
        });

        setProductos(procesados);
      } catch (err) {
        console.error("Error cargando productos:", err);
        
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