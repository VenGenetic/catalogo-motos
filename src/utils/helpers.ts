// src/utils/helpers.ts

export const limpiarTexto = (texto: string) => {
  if (!texto) return '';
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const optimizarImg = (url: string | null | undefined, size: number = 500) => {
  // 1. BLINDAJE: Si no es string válida, devolvemos placeholder
  if (!url || typeof url !== 'string' || url.trim() === '' || url === 'No imagen') {
    return '/sin_imagen.webp';
  }

  // 2. NUEVO: Si es una ruta local (empieza con /), devolver tal cual
  if (url.startsWith('/')) {
    return url;
  }

  // Devolvemos la URL directamente en lugar de pasar por wsrv.nl
  // Ya que pasar por un proxy hace que los fallos 404 tarden más en saltar,
  // ralentizando la carga del fallback de la imagen.
  return url;
};