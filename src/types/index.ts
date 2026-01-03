// src/types/index.ts

export interface Producto {
  id: string;
  codigo_referencia: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: boolean;
  seccion?: string;
  textoBusqueda?: string; // Para optimizar búsquedas
}

export interface ItemCarrito extends Producto {
  cantidad: number;
  cant?: number;
}

// Estructura del JSON completo
export interface DataFuente {
  RAW_SCRAPED_DATA: Producto[];
}// src/types/index.ts

export interface Producto {
  id: string;
  codigo_referencia: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: boolean;
  seccion?: string; // Propiedad añadida dinámicamente
  textoBusqueda?: string; // Propiedad para optimizar filtros
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