import React, { useState, useEffect } from 'react';
import { useGarage } from '../context/GarageContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';
import MotoSelector from './MotoSelector';
import ProductDetailModal from './ProductDetailModal';
import { Search, ShoppingCart, Filter, X } from 'lucide-react';

// Si tienes un componente de LazyImage, úsalo; si no, usa img normal
import { LazyImage } from './LazyImage'; 

// Definición de categorías (puedes moverlas a un archivo de constantes si prefieres)
const CATEGORIES = [
  { id: 'Todos', name: 'Todos' },
  { id: 'Motor', name: 'Motor' },
  { id: 'Frenos', name: 'Frenos' },
  { id: 'Suspensión', name: 'Suspensión' },
  { id: 'Eléctrico', name: 'Eléctrico' },
  { id: 'Transmisión', name: 'Transmisión' },
  { id: 'Llantas', name: 'Llantas' },
  { id: 'Accesorios', name: 'Accesorios' },
];

const CatalogView = () => {
  // --- Estados ---
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- Hooks Personalizados ---
  const { selectedMoto } = useGarage(); // Contexto del vehículo seleccionado
  const { addToCart } = useCart();      // Contexto del carrito
  
  // Aquí usamos el hook "inteligente" que creamos anteriormente
  const { products, loading, error } = useProducts(searchTerm, activeCategory);

  // --- Handlers ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setIsFilterOpen(false); // Cierra menú móvil al seleccionar
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeDetailModal = () => {
    setSelectedProduct(null);
  };

  // --- Renderizado ---

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header Fijo con Buscador */}
      <div className="sticky top-0 z-40 bg-white shadow-sm pb-2">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={selectedMoto ? `Buscar para ${selectedMoto.name}...` : "Buscar repuesto (ej: bujía, pistón)..."}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-base"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2.5 rounded-xl border ${activeCategory !== 'Todos' ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-600'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de Moto (Garaje) */}
          <div className="mb-1">
            <MotoSelector />
          </div>
        </div>

        {/* Categorías (Scroll Horizontal) */}
        <div className="flex overflow-x-auto px-4 pb-2 gap-2 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${activeCategory === cat.id 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Lista de Productos */}
      <div className="px-4 pt-4">
        {/* Mensaje de estado: Cargando o Error */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center my-4">
            <p>{error}</p>
          </div>
        )}

        {/* Resultados */}
        {!loading && !error && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">
                {products.length} Resultados
                {selectedMoto && <span className="text-red-600 text-sm font-normal ml-2">(Compatibles con tu moto)</span>}
              </h2>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No encontramos repuestos con esos criterios.</p>
                {selectedMoto && <p className="text-sm mt-1">Prueba quitando el filtro de moto o buscando por nombre genérico.</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Imagen */}
                    <div className="aspect-square bg-gray-50 relative p-4">
                      <LazyImage 
                        src={product.imagen || '/placeholder.png'} 
                        alt={product.nombre}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                      {/* Badge si es compatible explícitamente (opcional) */}
                      {selectedMoto && product.nombre.toLowerCase().includes(selectedMoto.name.toLowerCase()) && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          COMPATIBLE
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-xs text-gray-400 font-mono mb-1">{product.codigo_referencia}</p>
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-2 flex-1">
                        {product.nombre}
                      </h3>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <span className="font-bold text-lg text-red-600">
                          ${product.precio.toLocaleString()}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Modal de Detalle */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          isOpen={!!selectedProduct}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
};

export default CatalogView;