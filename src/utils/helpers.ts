// src/utils/helpers.ts

export const limpiarTexto = (texto: string) => {
  if (!texto) return '';
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const optimizarImg = (url: any) => {
  // 1. BLINDAJE TOTAL: Si no es string, devolvemos placeholder para evitar crash
  if (!url || typeof url !== 'string' || url.trim() === '' || url === 'No imagen') {
    return 'https://via.placeholder.com/400x300?text=Sin+Imagen';
  }

  // 2. Si ya viene optimizada, retornar tal cual
  if (url.includes('wsrv.nl')) return url;

  // 3. Optimización segura SIN RECORTES
  try {
    // ⚠️ CAMBIO CRÍTICO: 
    // Eliminamos 'h=400', 'fit=cover' y 'a=top' que causaban el recorte cuadrado.
    // Solo limitamos el ancho (w=500) para que cargue rápido, pero dejamos la altura AUTOMÁTICA.
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=500&q=80&output=webp`;
  } catch (e) {
    return 'https://via.placeholder.com/400x300?text=Error+Img';
  }
};