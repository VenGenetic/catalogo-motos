export const SkeletonLoader = () => {
    // Generamos 8 elementos placeholder
    return (
      <div className="grid grid-cols-1 gap-3 animate-pulse min-[380px]:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="surface-card flex h-[300px] flex-col rounded-[1.25rem] p-3">
            {/* Imagen Placeholder */}
            <div className="product-media-shell relative mb-4 w-full overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            
            {/* Texto Placeholder */}
            <div className="space-y-2 flex-1">
              <div className="h-3 w-1/3 rounded bg-ui-raised"></div>
              <div className="h-4 w-full rounded bg-ui-raised"></div>
              <div className="h-4 w-2/3 rounded bg-ui-raised"></div>
            </div>
  
            {/* Footer Card Placeholder */}
            <div className="mt-4 flex justify-between items-end">
                <div className="h-6 w-16 rounded bg-ui-raised"></div>
                <div className="h-10 w-10 rounded-lg bg-ui-raised"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };
