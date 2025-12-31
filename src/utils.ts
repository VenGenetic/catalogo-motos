export const optimizarImagenThumbnail = (url: string) => {
  if (!url || url === 'No imagen') return '';
  if (url.includes('wsrv.nl')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=500&h=500&fit=cover&a=top&q=80&output=webp`;
};

export const optimizarImagenZoom = (url: string) => {
  if (!url || url === 'No imagen') return '';
  if (url.includes('wsrv.nl')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&q=90&output=webp`;
};