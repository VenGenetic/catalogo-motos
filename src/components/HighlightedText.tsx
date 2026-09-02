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

  let parts = [text];
  let matchedTerms = new Set<string>();
  try {
    // Si highlight contiene múltiples palabras (ej. de múltiples filtros), las separamos y escapamos individualmente
    const cleanHighlight = highlight.replace(/"/g, '');
    const terms = cleanHighlight.split(/\s+/).filter(t => t.length > 0);
    
    if (terms.length > 0) {
      matchedTerms = new Set(terms.map((term) => term.toLowerCase()));
      const pattern = terms.map(escapeRegExp).join('|');
      const regex = new RegExp(`(${pattern})`, 'gi');
      parts = text.split(regex);
    }
  } catch (e) {
    console.error("Error highlighting text", e);
    parts = [text];
    matchedTerms = new Set<string>();
  }

  const content = parts.map((part, i) =>
    matchedTerms.has(part.toLowerCase()) ? (
      <span key={i} className="rounded-sm bg-yellow-200 px-0.5 text-slate-900 shadow-sm">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );

  return (
    <span className="break-words">
      {content}
    </span>
  );
});
