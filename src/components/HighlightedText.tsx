import { useMemo } from 'react';
import { limpiarTexto } from '../utils/helpers';

interface Props {
  text: string;
  highlight: string;
  className?: string;
}

export const HighlightedText = ({ text, highlight, className = '' }: Props) => {
  const parts = useMemo(() => {
    if (!highlight.trim()) return [{ text, isMatch: false }];

    const normalizedText = limpiarTexto(text);
    const normalizedHighlight = limpiarTexto(highlight);
    
    if (!normalizedText.includes(normalizedHighlight)) {
      return [{ text, isMatch: false }];
    }

    const term = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    
    return parts.map(part => ({
      text: part,
      isMatch: limpiarTexto(part) === normalizedHighlight
    }));
  }, [text, highlight]);

  if (!highlight.trim()) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {parts.map((part, i) => (
        part.isMatch ? (
          <span key={i} className="bg-yellow-200 text-slate-900 font-extrabold px-0.5 rounded-sm">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      ))}
    </span>
  );
};