import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useGarage } from '../context/GarageContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ProductDetailModal } from './ProductDetailModal';
import { LazyImage } from './LazyImage'; // Asumiendo que existe según tu estructura

interface CatalogViewProps {
  products: Product[];
}

// Categorías extraídas de tus datos o definidas estáticamente
const CATEGORIES = ['Todos', 'Motor', 'Frenos', 'Suspensión', 'Eléctrico', 'Accesorios', 'Llantas'];

export const CatalogView = ({ products }: CatalogViewProps) => {
  const { selectedBike } = useGarage();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 12;

  // 1. Lógica de Filtrado (Search + Category)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase()); // Buscar por ID/SKU también
      
      const matchCategory = 
        selectedCategory === 'Todos' || 
        product.category === selectedCategory; // Asegúrate de que tus productos tengan la propiedad 'category'

      return matchSearch && matchCategory;
    });
  }, [searchTerm, selectedCategory, products]);

  // 2. Lógica de Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const currentProducts = useMemo(() => {
    const firstIndex = (currentPage - 1) * itemsPerPage;
    const lastIndex = firstIndex + itemsPerPage;
    return filteredProducts.slice(firstIndex, lastIndex);
  }, [currentPage, filteredProducts]);

  // Resetear a página 1 si cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Scroll al top al cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Verificación de Compatibilidad
  const checkCompatibility = (product: Product) => {
    if (!selectedBike) return null;
    
    // Asumiendo que 'compatibleModels' es un array de strings en tu tipo Product
    const isCompatible = product.compatibleModels?.some(model => 
      model.toLowerCase().includes(selectedBike.model.toLowerCase())
    );

    return isCompatible;
  };

  // Handlers
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product);
    showToast(`Agregado al carrito: ${product.name}`, 'success');
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      
      {/* --- Controles Superiores (Buscador y Filtros) --- */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Barra de Búsqueda */}
          <div className="relative w-full md:w-1/2 lg:w-1/3">
            <input
              type="text"
              placeholder="Buscar repuesto o SKU..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
          </div>

          {/* Selector de Categorías (Móvil: Select / Desktop: Botones) */}
          <div className="w-full md:w-auto flex items-center overflow-x-auto pb-2 md:pb-0 gap-2 hide-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resumen de resultados */}
        <div className="text-sm text-gray-500">
          Mostrando {currentProducts.length} de {filteredProducts.length} productos
        </div>
      </div>

      {/* --- Grid de Productos --- */}
      {currentProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map((product) => {
            const isCompatible = checkCompatibility(product);

            return (
              <div 
                key={product.id} 
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer"
                onClick={() => openModal(product)}
              >
                {/* Imagen */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <LazyImage 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badge de Garage */}
                  {selectedBike && isCompatible !== null && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm ${
                      isCompatible ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {isCompatible ? (
                        <><CheckCircle size={12} /> Compatible</>
                      ) : (
                        <><AlertTriangle size={12} /> Revisar</>
                      )}
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{product.id}</span>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {product.category || 'General'}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      ${product.price.toLocaleString()}
                    </span>
                    
                    <div className="flex gap-2">
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                        title="Ver detalles"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transition transform active:scale-95"
                        title="Agregar al carrito"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Estado Vacío */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Filter className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">No se encontraron productos</h3>
          <p className="text-gray-500 mt-2">Intenta con otro término de búsqueda o categoría.</p>
          <button 
            onClick={() => {setSearchTerm(''); setSelectedCategory('Todos');}}
            className="mt-6 text-blue-600 hover:underline font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* --- Controles de Paginación --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-12 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={20} />
          </button>
          
          {/* Generación de números de página (simplificado) */}
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                </div>
              ))
            }
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* --- Modal de Detalle --- */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};