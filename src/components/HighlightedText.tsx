// src/components/HighlightedText.tsx

interface Props {
  text: string;
  highlight: string;
}

export const HighlightedText = ({ text, highlight }: Props) => {
  // Protección contra textos vacíos o nulos
  if (!text) return null;
  if (!highlight || !highlight.trim()) return <span>{text}</span>;

  // Función para "escapar" caracteres peligrosos de Regex (., *, +, ?, etc.)
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  try {
    // Dividir el highlight en múltiples términos
    const terms = highlight.trim().split(/\s+/).filter(term => term.length > 0);
    
    if (terms.length === 0) return <span>{text}</span>;

    // Crear un patrón que combine todos los términos
    const patterns = terms.map(term => `(${escapeRegExp(term)})`);
    const combinedPattern = new RegExp(`(${patterns.join('|')})`, 'gi');
    
    const parts = text.split(combinedPattern);

    return (
      <span>
        {parts.map((part, i) => {
          // Verificar si esta parte coincide con alguno de los términos
          const isMatch = terms.some(term => 
            new RegExp(`^${escapeRegExp(term)}$`, 'i').test(part)
          );
          
          return isMatch ? (
            <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5 font-bold mx-0.5">
              {part}
            </mark>
          ) : (
            part
          );
        })}
      </span>
    );
  } catch (e) {
    // Si algo falla, devolvemos el texto normal para no romper la app
    console.error("Error en resaltado:", e);
    return <span>{text}</span>;
  }
};