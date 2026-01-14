import { memo } from 'react';

interface HighlightedTextProps {
  text: string;
  highlight: string;
}

export const HighlightedText = memo(({ text, highlight }: HighlightedTextProps) => {
  // Si no hay nada que resaltar, devolvemos el texto normal
  if (!highlight || !highlight.trim()) {
    return <span>{text}</span>;
  }

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  try {
    const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
    const parts = text.split(regex);

    return (
      // CORRECCIÓN: Quitamos "truncate" y "block". Usamos "break-words" para que el texto baje de línea si es necesario.
      <span className="break-words">
        {parts.map((part, i) => 
          regex.test(part) ? (
            <span key={i} className="bg-yellow-200 text-slate-900 px-0.5 rounded-sm shadow-sm">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  } catch (e) {
    console.error("Error highlighting text", e);
    return <span>{text}</span>;
  }
});