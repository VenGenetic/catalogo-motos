import { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { useGarage } from '../context/GarageContext';

// Función de ayuda para limpiar texto (quitar tildes y mayúsculas)
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const useProducts = (searchTerm: string, category: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Obtenemos la moto seleccionada del contexto
  const { selectedMoto } = useGarage(); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Asumiendo que data.json está en la carpeta public
        const response = await fetch('/data.json');
        if (!response.ok) throw new Error('Error al cargar el catálogo');
        const data = await response.json();
        
        // Ajusta esto según la estructura real de tu JSON
        // Basado en lo que vi, parece ser data.RAW_SCRAPED_DATA
        const productsArray = data.RAW_SCRAPED_DATA || [];
        setProducts(productsArray);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los repuestos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Filtro de Búsqueda (Texto)
      const normalizedSearch = normalizeText(searchTerm);
      const normalizedName = normalizeText(product.nombre);
      const normalizedCode = normalizeText(product.codigo_referencia);

      const matchesSearch = 
        normalizedName.includes(normalizedSearch) || 
        normalizedCode.includes(normalizedSearch);

      if (!matchesSearch) return false;

      // 2. Filtro de Categoría
      if (category && category !== 'Todos') {
        // Asumiendo que tu producto tiene un campo 'categoria' o lo inferimos
        // Si no existe el campo, podrías omitir este paso o basarlo en el nombre
        // return product.categoria === category;
      }

      // 3. Filtro de Compatibilidad (Garage)
      if (selectedMoto) {
        // Lógica "inteligente": Si el nombre del producto incluye el nombre de la moto
        const motoName = normalizeText(selectedMoto.name); // Ej: "tekken"
        // Verificamos si el nombre del producto menciona la moto O si es universal
        const isCompatible = 
            normalizedName.includes(motoName) || 
            normalizedName.includes('universal');
            
        if (!isCompatible) return false;
      }

      return true;
    });
  }, [products, searchTerm, category, selectedMoto]);

  return { products: filteredProducts, loading, error };
};