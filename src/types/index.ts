// src/types/index.ts

export interface Producto {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
  compatibleModels?: string[];
  // ... otros campos
}

// ItemCarrito extiende Producto agregando 'quantity'
export interface ItemCarrito extends Producto {
  quantity: number;
}