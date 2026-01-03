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
    const pattern = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
    const parts = text.split(pattern);

    return (
      <span>
        {parts.map((part, i) => 
          pattern.test(part) ? (
            <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5 font-bold mx-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  } catch (e) {
    // Si algo falla, devolvemos el texto normal para no romper la app
    console.error("Error en resaltado:", e);
    return <span>{text}</span>;
  }
};