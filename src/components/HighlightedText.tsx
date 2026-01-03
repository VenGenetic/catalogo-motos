// src/components/HighlightedText.tsx

interface Props {
  text: string;
  highlight: string;
}

export const HighlightedText = ({ text, highlight }: Props) => {
  if (!highlight.trim()) return <>{text}</>;

  // Dividir el texto basado en la búsqueda (insensible a mayúsculas)
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
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