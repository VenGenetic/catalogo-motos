export const SkeletonLoader = () => {
    // Generamos 8 elementos placeholder
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col h-[320px]">
            {/* Imagen Placeholder */}
            <div className="w-full pt-[100%] bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            
            {/* Texto Placeholder */}
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
  
            {/* Footer Card Placeholder */}
            <div className="mt-4 flex justify-between items-end">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };