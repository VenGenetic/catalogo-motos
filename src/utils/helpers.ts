// src/utils/helpers.ts

export const limpiarTexto = (texto: string) => {
  if (!texto) return '';
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const optimizarImg = (url: any) => {
  // 1. BLINDAJE: Si no es string válida, devolvemos placeholder
  if (!url || typeof url !== 'string' || url.trim() === '' || url === 'No imagen') {
    return 'https://via.placeholder.com/400x300.webp?text=Sin+Imagen';
  }

  // 2. NUEVO: Si es una ruta local (empieza con /), devolver tal cual
  // Esto evita que wsrv.nl intente procesar un archivo local
  if (url.startsWith('/')) {
    return url;
  }

  // 3. Si ya viene de wsrv, retornar tal cual
  if (url.includes('wsrv.nl')) return url;

  // 4. Optimización LIMPIA (Para URLs externas)
  try {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=500&q=80&output=webp`;
  } catch (e) {
    return 'https://via.placeholder.com/400x300.webp?text=Error+Img';
  }
};