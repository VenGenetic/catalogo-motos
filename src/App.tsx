// 1. Extrae la lógica de filtrado fuera del componente o déjala dentro pero envuélvela.
// Mueve esta función dentro del componente App o usa useCallback si depende de estados, 
// pero lo mejor es usar useMemo para el RESULTADO.

export default function App() {
  // ... (tus estados)

  // MEJORA: Memorizar la lista filtrada
  const filteredProducts = useMemo(() => {
    const terminos = limpiarTexto(busqueda).split(' ').filter(t => t.length > 0);
    
    return productos.filter((p) => {
      if (!p.precio) return false;
      // Optimización: Si no hay búsqueda, saltar este check pesado
      if (terminos.length > 0) {
        if (!terminos.every((t) => p.textoBusqueda?.includes(t))) return false;
      }
      if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
      if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;
      return true;
    });
  }, [productos, busqueda, filtroSeccion, filtroModelo]); // Solo se recalcula si esto cambia

  // ... (resto del código)

  return (
    // ...
    <Routes>
       {/* ... */}
       <Route path="/catalogo" element={
          <CatalogView 
            productos={filteredProducts} // Pasamos la variable memorizada
            // ... resto de props
          />
       } />
       {/* Hacemos lo mismo para favoritos */}
    </Routes>
    // ...
  );
}