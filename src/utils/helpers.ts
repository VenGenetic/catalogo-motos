// src/utils/helpers.ts

export const limpiarTexto = (texto: string) => {
  // Si el texto no existe, devolvemos cadena vacía para evitar errores
  if (!texto) return '';
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const optimizarImg = (url: any) => {
  // 1. BLINDAJE: Si url no es texto, es nulo, o es un número, devolvemos placeholder.
  // EL CÓDIGO ANTERIOR FALLABA AQUÍ PORQUE NO VERIFICABA 'typeof url'
  if (!url || typeof url !== 'string' || url.trim() === '' || url === 'No imagen') {
    return 'https://via.placeholder.com/400x300?text=Sin+Imagen';
  }

  // 2. Si ya viene de wsrv, la dejamos pasar
  if (url.includes('wsrv.nl')) return url;

  // 3. Optimización segura
  try {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=cover&a=top&q=80&output=webp`;
  } catch (e) {
    return 'https://via.placeholder.com/400x300?text=Error+Img';
  }
};