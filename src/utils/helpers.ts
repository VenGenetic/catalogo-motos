// src/utils/helpers.ts

export const limpiarTexto = (texto: string) => {
  // Protección: si texto es null/undefined, devolvemos cadena vacía
  if (!texto) return '';
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const optimizarImg = (url: any) => {
  // 1. BLINDAJE TOTAL: Verificamos si es string. Si es null, número o undefined, ponemos placeholder.
  if (!url || typeof url !== 'string' || url.trim() === '' || url === 'No imagen') {
    return 'https://via.placeholder.com/400x300?text=Sin+Imagen';
  }

  // 2. Si la imagen ya viene optimizada, la dejamos pasar
  if (url.includes('wsrv.nl')) return url;

  // 3. Optimización con wsrv.nl (WebP, cover, top alignment)
  // Usamos try-catch por si encodeURIComponent falla con caracteres raros
  try {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=cover&a=top&q=80&output=webp`;
  } catch (e) {
    return 'https://via.placeholder.com/400x300?text=Error+Img';
  }
};