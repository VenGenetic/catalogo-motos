// src/types/index.ts

export interface Producto {
  id: string;
  codigo_referencia?: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock?: boolean;
  cantidad_disponible?: number;
  origenes?: string[];
  seccion?: string;       // Nueva propiedad para el filtro
  textoBusqueda?: string; // Nueva propiedad para búsqueda optimizada
  is_discontinued?: boolean; // Producto descontinuado en el ERP
  gallery?: { url: string; type: string }[];
}

/** Cuánto lleva la primera carga del catálogo (la pantalla de carga lo muestra). */
export interface Progreso {
  /** Repuestos que ya llegaron. */
  cargadas: number;
  /** Cuántos son en total; null hasta que responde la primera página. */
  total: number | null;
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