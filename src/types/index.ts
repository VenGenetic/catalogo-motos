export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: boolean;
  seccion?: string; 
}

export interface ItemCarrito extends Producto {
  cantidad: number;
}

export interface ToastMessage {
  id: number;
  message: string;
}