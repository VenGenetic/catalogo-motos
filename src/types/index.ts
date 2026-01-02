// src/types/index.ts

export interface Producto {
  id: string;
  codigo_referencia: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: boolean;
  seccion?: string; // Propiedad opcional para el agrupamiento
}

export interface ItemCarrito extends Producto {
  cantidad: number; // En el carrito necesitamos saber la cantidad
  cant?: number;    // Soporte legacy por si usas 'cant' en vez de 'cantidad'
}

export interface ToastMessage {
  id: number;
  message: string;
}