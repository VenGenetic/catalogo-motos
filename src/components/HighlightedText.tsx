import { memo } from 'react';

interface HighlightedTextProps {
  text: string;
  highlight: string;
}

export const HighlightedText = memo(({ text, highlight }: HighlightedTextProps) => {
  if (!highlight?.trim()) {
    return <span>{text}</span>;
  }

  // Función segura para escapar caracteres especiales de Regex (como +, *, ?, etc.)
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  try {
    // Creamos una expresión regular que separa el texto buscando la coincidencia (case insensitive)
    // El paréntesis () es vital: hace que el .split incluya también el separador (la coincidencia) en el array
    const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
    
    const parts = text.split(regex);

    return (
      <span className="truncate block">
        {parts.map((part, i) => 
          regex.test(part) ? (
            // Si la parte coincide con la búsqueda, la resaltamos
            <span key={i} className="bg-yellow-200 text-slate-900 font-extrabold px-0.5 rounded-sm mx-0.5 shadow-sm">
              {part}
            </span>
          ) : (
            // Si no coincide, devolvemos el texto normal
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  } catch (e) {
    // Fallback de seguridad por si falla el Regex
    console.error("Error highlighting text", e);
    return <span>{text}</span>;
  }
});