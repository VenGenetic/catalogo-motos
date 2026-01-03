// src/utils/helpers.ts

export const limpiarTexto = (texto: string) => 
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const optimizarImg = (url: string) => {
  if (!url || url === 'No imagen') return 'https://via.placeholder.com/400x300?text=No+Image';
  if (url.includes('wsrv.nl')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=cover&a=top&q=80&output=webp`;
};