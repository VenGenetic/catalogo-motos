export interface Producto {
  id: string;
  nombre: string;
  precio: number | string;
  categoria: string;
  imagen: string;
  stock?: boolean;
  codigo_referencia?: string;
  seccion?: string;
  textoBusqueda: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  imagen: string;
}

// --- ESTO ES LO QUE FALTABA ---
export interface ItemCarrito extends Producto {
  cantidad: number;
}