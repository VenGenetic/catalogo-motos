export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: boolean;
}

export interface ItemCarrito extends Producto {
  cantidad: number;
}

export interface Toast {
  id: number;
  message: string;
}