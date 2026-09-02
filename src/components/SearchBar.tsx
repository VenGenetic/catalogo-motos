import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Mic, MicOff, TrendingUp, ChevronRight, History } from 'lucide-react';
import { Producto } from '../types';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionResultList {
    readonly [index: number]: SpeechRecognitionResult;
    readonly length: number;
  }
  interface SpeechRecognitionResult {
    readonly [index: number]: SpeechRecognitionAlternative;
    readonly length: number;
  }
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
}

interface SearchBarProps {
  busqueda: string;
  setBusqueda: (s: string) => void;
  productos: Producto[];
  filtroModelo: string;
  placeholder?: string;
}

export const SearchBar = ({
  busqueda,
  setBusqueda,
  productos,
  filtroModelo,
  placeholder
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport] = useState(() => {
     return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const sugerencias = useMemo(() => {
    if (!busqueda.trim()) return [];
    const terminoLower = busqueda.toLowerCase();
    const sugerenciasSet = new Set<string>();
    const esBusquedaCorta = busqueda.length < 3;

    productos.forEach(producto => {
      if (producto.codigo_referencia && producto.codigo_referencia.toLowerCase().includes(terminoLower)) {
        sugerenciasSet.add(`"${producto.codigo_referencia}"`);
      }
      const palabrasNombre = producto.nombre.split(' ').filter(p => p.length > (esBusquedaCorta ? 1 : 2));
      palabrasNombre.forEach(palabra => {
        if (palabra.toLowerCase().includes(terminoLower)) {
          sugerenciasSet.add(palabra);
        }
      });
      if (producto.seccion && producto.seccion.toLowerCase().includes(terminoLower)) {
        sugerenciasSet.add(producto.seccion);
      }
      const modelosExtraidos = producto.nombre.match(/\b[A-Z]{2,}[\d-]+\b/g) || [];
      modelosExtraidos.forEach(modelo => {
        if (modelo.toLowerCase().includes(terminoLower)) sugerenciasSet.add(modelo);
      });
    });

    return Array.from(sugerenciasSet).slice(0, 6); // Limitamos a 6 para no saturar móvil
  }, [busqueda, productos]);

  const busquedasPopulares = ['Freno', 'Bateria', 'Cadena', 'Llanta', 'Faro', 'Aceite'];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'es-ES';
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0]?.[0]?.transcript;
            if (transcript) setBusqueda(transcript.trim());
            setIsListening(false);
        };
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = () => setIsListening(false);
      }
    } catch (error) { console.error(error); }
  }, [setBusqueda]);

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta búsqueda por voz.');
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
    setIsListening(!isListening);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (sugerencia: string) => {
    setBusqueda(sugerencia.replace(/"/g, ''));
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const showSuggestions = isFocused && (sugerencias.length > 0 || !busqueda);

  return (
    <div className="relative group w-full">
      <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
          isFocused 
            ? 'border-brand-orange/70 bg-ui-surface shadow-lifted ring-4 ring-brand-orange/10'
            : 'border-ui-border bg-ui-surface shadow-sm hover:border-brand-orange/30'
        }`}>
        
        {/* Icono Lupa */}
        <div className="pl-4 text-ui-copy">
           <Search className={`h-5 w-5 transition-colors ${isFocused ? 'text-brand-orange' : ''}`} strokeWidth={2.5} />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || (filtroModelo ? `Buscar en ${filtroModelo}...` : "Escriba el modelo y el repuesto que necesita")}
          className="w-full rounded-2xl bg-transparent px-3 py-3.5 text-base text-ui-ink outline-none placeholder:text-ui-copy/70"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />

        {/* Botones de Acción (Lado Derecho) */}
        <div className="pr-2 flex items-center gap-1">
          {busqueda && (
            <button
              onClick={() => { setBusqueda(''); inputRef.current?.focus(); }}
              className="touch-target flex items-center justify-center rounded-xl text-ui-copy/70 transition-all hover:bg-ui-muted hover:text-ui-ink"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}

          {/* Divisor vertical suave */}
          <div className="mx-1 h-6 w-px bg-ui-border"></div>

          {hasSpeechSupport && (
            <button
              onClick={handleVoiceSearch}
              className={`touch-target flex items-center justify-center rounded-xl transition-all active:scale-95 ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                  : 'text-ui-copy hover:bg-brand-orange/10 hover:text-brand-orange'
              }`}
              aria-label={isListening ? 'Detener búsqueda por voz' : 'Buscar por voz'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* PANEL DE SUGERENCIAS */}
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-dropdown origin-top overflow-hidden rounded-2xl border border-ui-border bg-ui-surface shadow-lifted animate-fade-in-up">
          
          {/* Si NO hay búsqueda: Mostrar Populares */}
          {!busqueda ? (
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ui-copy">
                <TrendingUp className="w-3 h-3" />
                Lo más buscado
              </div>
              <div className="flex flex-wrap gap-2">
                {busquedasPopulares.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSuggestionClick(term)}
                    className="min-h-[40px] rounded-xl border border-ui-border bg-ui-muted px-4 py-2 text-sm font-medium text-ui-ink transition-all hover:border-brand-orange/25 hover:bg-brand-orange/10 hover:text-brand-orange active:scale-95"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Si HAY búsqueda: Mostrar Resultados */
            <div className="py-2">
              <div className="flex justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-ui-copy">
                <span>Coincidencias</span>
                <span className="text-brand-orange">{sugerencias.length} resultados</span>
              </div>
              
              {sugerencias.map((sugerencia, index) => {
                 const isCode = sugerencia.startsWith('"');
                 return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(sugerencia)}
                    className="group flex w-full min-h-[48px] items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:border-brand-orange hover:bg-ui-muted"
                  >
                    <div className={`p-1.5 rounded-lg ${isCode ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-brand-surface-2 text-gray-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-brand-orange group-hover:shadow-sm'}`}>
                       {isCode ? <History className="w-4 h-4"/> : <Search className="w-4 h-4" />}
                    </div>
                    <span className={`flex-1 text-sm ${isCode ? 'font-mono font-bold text-blue-700 dark:text-blue-400' : 'font-medium text-ui-ink'}`}>
                      {sugerencia.replace(/"/g, '')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-orange opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
