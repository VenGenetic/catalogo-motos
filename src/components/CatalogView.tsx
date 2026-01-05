import { Search, PackageX, ShoppingBag, Eye, Star, Heart } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { optimizarImg } from '../utils/helpers';
import { CATEGORIAS } from '../utils/categories';
import { Producto } from '../types';
import { useCart } from '../context/CartContext';

// Definimos qué propiedades espera recibir este componente
interface Props {
  productos: Producto[];
  isFav: (id: string) => boolean;
  toggleFav: (id: string) => void;
  filtroModelo: string;
  setFiltroModelo: (modelo: string) => void;
  busqueda: string;
  setBusqueda: (busqueda: string) => void;
  filtroSeccion: string;
  setFiltroSeccion: (seccion: string) => void;
  onProductClick: (producto: Producto) => void;
}

export const CatalogView = ({
  productos,
  isFav,
  toggleFav,
  // filtroModelo, setFiltroModelo, // (Opcional si quieres usarlo en UI futura)
  busqueda,
  setBusqueda,
  filtroSeccion,
  setFiltroSeccion,
  onProductClick
}: Props) => {
  
  const { addToCart } = useCart();

  // Ya no usamos useProducts aquí, porque App.tsx nos manda la data ya lista

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Buscador y Filtros Sticky */}
      <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          
          {/* Barra de Búsqueda */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar repuesto (ej: Cilindro, Daytona...)"
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-xl transition-all outline-none font-medium placeholder:text-gray-400"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Categorías (Scroll horizontal) */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setFiltroSeccion('Todos')}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                filtroSeccion === 'Todos'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFiltroSeccion(cat.nombre)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                  filtroSeccion === cat.nombre
                    ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {productos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {productos.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group overflow-hidden relative"
              >
                {/* Badge Flotante Disponible */}
                <div className="absolute top-2 left-2 z-10 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                   <Star size={10} className="fill-current" /> DISPONIBLE
                </div>

                {/* Botón Favorito Flotante */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(product.id);
                  }}
                  className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                >
                  <Heart 
                    size={16} 
                    className={`transition-colors ${isFav(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                  />
                </button>

                {/* Imagen */}
                <div 
                  className="relative pt-[100%] bg-gray-50 overflow-hidden cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                     <LazyImage 
                        src={optimizarImg(product.imagen)} 
                        alt={product.nombre}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                      />
                  </div>
                  {/* Overlay Hover */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="bg-white/90 p-2 rounded-full shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                          <Eye className="text-slate-900" size={20}/>
                      </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 md:p-4 flex-1 flex flex-col">
                  <div className="mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.seccion}</span>
                  </div>
                  <h3 
                    className="font-bold text-slate-800 text-sm md:text-base leading-tight mb-2 line-clamp-2 cursor-pointer hover:text-red-600 transition-colors"
                    onClick={() => onProductClick(product)}
                  >
                    {product.nombre}
                  </h3>
                  
                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400">Precio</span>
                      <span className="text-lg font-extrabold text-slate-900">
                        ${Number(product.precio).toFixed(2)}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="bg-slate-900 hover:bg-red-600 text-white p-2.5 rounded-lg transition-colors shadow-lg shadow-slate-200 hover:shadow-red-200 active:scale-95"
                      aria-label="Agregar al carrito"
                    >
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="bg-gray-100 p-6 rounded-full mb-6">
               <PackageX size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No encontramos resultados
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Intenta con otros términos o navega por las categorías.
            </p>
            <button 
              onClick={() => {
                setBusqueda('');
                setFiltroSeccion('Todos');
              }}
              className="px-6 py-3 bg-white border border-gray-300 text-slate-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm active:scale-95"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};