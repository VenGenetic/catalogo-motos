// src/types/index.ts

export interface Producto {
  id: string;
  codigo_referencia: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: boolean;
  cantidad_disponible?: number;
  origenes?: string[];
  seccion?: string;       // Nueva propiedad para el filtro
  textoBusqueda?: string; // Nueva propiedad para búsqueda optimizada
  tags?: { name: string; color: string }[]; // Etiquetas importadas de Supabase
}

export interface ItemCarrito extends Producto {
  cantidad: number;
  cant?: number; // Soporte legacy
}

export interface DataFuente {
  RAW_SCRAPED_DATA: Producto[];
}

export interface ToastMessage {
  id: number;
  message: string;
}