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

// Función para generar un ID consistente (hash simple)
// Esto asegura que si recargas la página, el producto "Amortiguador" siga teniendo el mismo ID
// en lugar de uno nuevo aleatorio, lo que arregla la persistencia en Favoritos y Carrito.
const generarIdDeterministico = (p: any) => {
  if (p.id) return String(p.id);
  
  // Usa referencia y nombre para crear siempre el mismo ID para el mismo producto
  // Se usa btoa (Base64) para crear un string seguro y limpio
  const clave = `${p.codigo_referencia || ''}-${p.nombre}`;
  try {
    return btoa(clave).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  } catch (e) {
    // Fallback por si la codificación falla (caracteres raros)
    return String(Math.abs(clave.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)));
  }
};

export const useProducts = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/data.json');
        if (!res.ok) throw new Error('Error al cargar datos');
        
        const data = await res.json();
        let raw: any[] = [];
        
        if (Array.isArray(data)) raw = data;
        else if (Array.isArray(data.RAW_SCRAPED_DATA)) raw = data.RAW_SCRAPED_DATA;
        else if (Array.isArray(data.products)) raw = data.products;

        const procesados = raw.map((p) => {
          const seccionCalc = detectarSeccion(p);
          return {
            ...p,
            // Aquí usamos la nueva función en lugar de crypto.randomUUID()
            id: generarIdDeterministico(p), 
            precio: limpiarPrecio(p.precio),
            seccion: seccionCalc,
            // Pre-calculamos texto de búsqueda para optimizar filtros
            textoBusqueda: limpiarTexto(`${p.nombre} ${p.codigo_referencia || ''} ${p.categoria || ''} ${seccionCalc}`)
          };
        });

        setProductos(procesados);
      } catch (err) {
        console.error("Error cargando productos:", err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { productos, loading, error };
};