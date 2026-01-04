// src/components/SkeletonLoader.tsx
export const SkeletonLoader = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 py-8 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm h-72">
          {/* Imagen falsa */}
          <div className="h-40 bg-gray-200 w-full" />
          <div className="p-3 space-y-2">
            {/* Título falso */}
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            {/* Precio falso */}
            <div className="mt-4 h-6 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};