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

  // Optimizar usando el endpoint de transformación de imágenes de Supabase.
  // Importante: hay que reescribir a /render/image/public/ (no /object/public/);
  // el endpoint /object/public/ ignora los parámetros de tamaño y sirve el
  // archivo original completo, que puede pesar cientos de KB o varios MB.
  if (url.includes('/storage/v1/object/public/') && !url.includes('?')) {
    const renderUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${renderUrl}?width=${size}&height=${size}&resize=contain&quality=75`;
  }

  return url;
};