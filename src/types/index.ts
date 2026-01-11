// src/types/index.ts

export interface Producto {
  id: string;
  codigo_referencia: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: boolean;
  seccion?: string;       // Nueva propiedad para el filtro
  textoBusqueda?: string; // Nueva propiedad para búsqueda optimizada
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