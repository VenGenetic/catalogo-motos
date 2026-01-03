import { ArrowLeft, X, Share2, Plus, ShoppingBag, MessageCircle } from 'lucide-react';
import { ImageZoom } from './ImageZoom';
import { optimizarImg } from '../utils/helpers';
import { Producto } from '../types';

interface Props {
  product: Producto | null;
  onClose: () => void;
  onAdd: (product: Producto) => void;
}

export const ProductDetailModal = ({ product, onClose, onAdd }: Props) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-white md:bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* ... (resto del código del modal tal cual estaba en App.tsx) ... */}
      {/* Recuerda reemplazar las llamadas locales por las importadas */}
    </div>
  );
};