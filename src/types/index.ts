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
  
  // --- CAMPOS NUEVOS (Corrección del error TS2339) ---
  isUniversal?: boolean;           // Indica si sirve para todas las motos
  compatibleModels?: Motorcycle[]; // Lista de modelos compatibles
}

export interface ItemCarrito extends Producto {
  cantidad: number;
  cant?: number; 
}

export interface DataFuente {
  RAW_SCRAPED_DATA: Producto[];
}

export interface ToastMessage {
  id: number;
  message: string;
}