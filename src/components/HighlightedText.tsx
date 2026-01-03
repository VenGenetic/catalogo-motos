// src/components/HighlightedText.tsx

interface Props {
  text: string;
  highlight: string;
}

export const HighlightedText = ({ text, highlight }: Props) => {
  if (!highlight || !highlight.trim()) {
    return <span>{text}</span>;
  }

  // Escapamos caracteres especiales de regex para evitar errores
  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
};