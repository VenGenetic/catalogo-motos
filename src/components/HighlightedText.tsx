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

  let content;
  try {
    // Si highlight contiene múltiples palabras (ej. de múltiples filtros), las separamos y escapamos individualmente
    const cleanHighlight = highlight.replace(/"/g, '');
    const terms = cleanHighlight.split(/\s+/).filter(t => t.length > 0);
    
    if (terms.length === 0) {
      return <span>{text}</span>;
    }

    const pattern = terms.map(escapeRegExp).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');
    const parts = text.split(regex);

    content = parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 text-slate-900 px-0.5 rounded-sm shadow-sm">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  } catch (e) {
    console.error("Error highlighting text", e);
    content = text;
  }

  return (
    <span className="break-words">
      {content}
    </span>
  );
});