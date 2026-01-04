import { useState, useEffect, useMemo } from 'react';
import { Producto } from '../types';
import { detectarSeccion } from '../utils/categories';
import { limpiarTexto } from '../utils/helpers';

// Función auxiliar fuera del componente para no recrearla
const limpiarPrecio = (valor: any): number => {
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
    fetch('/data.json')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar datos');
        return res.json();
      })
      .then((data: any) => {
        // Soporte para diferentes estructuras de JSON
        let raw: any[] = [];
        if (Array.isArray(data)) raw = data;
        else if (Array.isArray(data.RAW_SCRAPED_DATA)) raw = data.RAW_SCRAPED_DATA;
        else if (Array.isArray(data.products)) raw = data.products;

        const procesados = raw.map((p) => {
            const seccionCalc = detectarSeccion(p);
            return {
              ...p,
              precio: limpiarPrecio(p.precio),
              seccion: seccionCalc,
              // Pre-calculamos el texto de búsqueda para que el filtro sea instantáneo
              textoBusqueda: limpiarTexto(`${p.nombre} ${p.codigo_referencia || ''} ${p.categoria || ''} ${seccionCalc}`)
            };
        });

        setProductos(procesados);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('No se pudieron cargar los productos');
        setLoading(false);
      });
  }, []);

  return { productos, loading, error };
};