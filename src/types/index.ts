export interface Product {
  id: string;
  codigo_referencia: string;
  nombre: string;
  precio: number;
  imagen?: string; // Opcional si no todas tienen imagen
  categorias?: string[];
  compatibilidad?: string[];
}

export interface Category {
  id: string;
  name: string;
  image: string;
}