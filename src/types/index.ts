// src/types/index.ts

// 1. Definición de Moto (Necesaria para el nuevo buscador)
export interface Motorcycle {
  make: string;
  model: string;
  yearStart?: number;
  yearEnd?: number;
}

// 2. Definición de Producto (Mezcla de tu código original + mejoras)
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
  
  // --- CAMPOS NUEVOS (Para que el buscador NO falle) ---
  isUniversal?: boolean;           
  compatibleModels?: Motorcycle[]; 
}

// 3. Definición del Item del Carrito (CORREGIDO: Incluye 'cant')
export interface ItemCarrito extends Producto {
  cantidad: number;
  cant?: number; // <--- ESTA LÍNEA ES LA QUE ARREGLA TU ERROR DE BUILD
}

export interface DataFuente {
  RAW_SCRAPED_DATA: Producto[];
}

export interface ToastMessage {
  id: number;
  message: string;
}