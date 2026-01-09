// src/types/index.ts

export interface Motorcycle {
  make: string;
  model: string;
  yearStart?: number;
  yearEnd?: number;
}

export interface Producto {
  id: string;
  codigo_referencia: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: boolean;
  seccion?: string;
  textoBusqueda?: string;
  
  // --- CAMPOS NUEVOS (Opcionales para no romper datos antiguos) ---
  isUniversal?: boolean;           // Ej: Espejos, Llaveros
  compatibleModels?: Motorcycle[]; // Lista de motos compatibles
}

export interface ItemCarrito extends Producto {
  cantidad: number;
}

export interface DataFuente {
  RAW_SCRAPED_DATA: Producto[];
}

export interface ToastMessage {
  id: number;
  message: string;
}