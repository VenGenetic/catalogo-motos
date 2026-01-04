import { useState, useEffect } from 'react';
import { Producto } from '../types';
import { detectarSeccion } from '../utils/categories';
import { limpiarTexto } from '../utils/helpers';

// Helper para precio (movido aquí)
const limpiarPrecio = (valor: unknown): number => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  const limpio = String(valor).replace(/[^0-9.]/g, '');
  const numero = parseFloat(limpio);
  return isNaN(numero) ? 0 : numero;
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
            id: String(p.id || crypto.randomUUID()), // Asegurar ID
            precio: limpiarPrecio(p.precio),
            seccion: seccionCalc,
            textoBusqueda: limpiarTexto(`${p.nombre} ${p.codigo_referencia || ''} ${p.categoria || ''} ${seccionCalc}`)
          };
        });

        setProductos(procesados);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { productos, loading, error };
};