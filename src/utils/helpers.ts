// src/utils/helpers.ts

export const limpiarTexto = (texto: string) => {
  if (!texto) return '';
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Devuelve la imagen original sin pasar por Storage Image Transformations.
 *
 * El catálogo ya guarda las fotos optimizadas en WebP. Transformar cada
 * origen en Supabase no aporta un ahorro material y sí factura una imagen
 * transformada distinta por producto durante cada ciclo.
 *
 * `size` se conserva en la firma porque documenta el tamaño de presentación
 * en los consumidores y evita romper las llamadas existentes.
 */
/**
 * ¿La foto es el aviso gris de "sin imagen" en lugar de la foto del repuesto?
 * Es un mismo archivo repetido: en Supabase mide 512×398 (uno de cada cinco
 * productos) y su copia en public/imagenes_repuestos, 500×388 (1.173
 * archivos). Ninguna foto real tiene esas medidas (revisado contra 334 fotos
 * de Supabase y las 5.684 locales). Se cambia por /sin_imagen.webp.
 */
export const esFotoGenerica = (img: HTMLImageElement) =>
  (img.naturalWidth === 512 && img.naturalHeight === 398) || (img.naturalWidth === 500 && img.naturalHeight === 388);

export const optimizarImg = (url: string | null | undefined, _size: number = 500) => {
  // 1. BLINDAJE: Si no es string válida, devolvemos placeholder
  if (!url || typeof url !== 'string' || url.trim() === '' || url === 'No imagen') {
    return '/sin_imagen.webp';
  }

  // 2. NUEVO: Si es una ruta local (empieza con /), devolver tal cual
  if (url.startsWith('/')) {
    return url;
  }

  return url;
};
