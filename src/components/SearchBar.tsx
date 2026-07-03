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
      <div className={`relative flex items-center transition-all duration-300 rounded-2xl border ${
          isFocused 
            ? 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-500 shadow-[0_4px_20px_rgba(0,0,0,0.05)] ring-4 ring-slate-500/10' 
            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm hover:border-gray-300 dark:hover:border-slate-650'
        }`}>
        
        {/* Icono Lupa */}
        <div className="pl-4 text-gray-400">
           <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-slate-700 dark:text-slate-300' : ''}`} strokeWidth={2.5} />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || (filtroModelo ? `Buscar en ${filtroModelo}...` : "Escriba el modelo y el repuesto que necesita")}
          className="w-full px-3 py-3.5 bg-transparent text-slate-800 dark:text-white text-base placeholder:text-gray-400 outline-none rounded-2xl"
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
              className="p-2 text-gray-300 hover:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}

          {/* Divisor vertical suave */}
          <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>

          {hasSpeechSupport && (
            <button
              onClick={handleVoiceSearch}
              className={`p-2.5 rounded-xl transition-all active:scale-95 ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                  : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* PANEL DE SUGERENCIAS */}
      {showSuggestions && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none z-50 overflow-hidden animate-fade-in-up origin-top">
          
          {/* Si NO hay búsqueda: Mostrar Populares */}
          {!busqueda ? (
            <div className="p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                <TrendingUp className="w-3 h-3" />
                Lo más buscado
              </div>
              <div className="flex flex-wrap gap-2">
                {busquedasPopulares.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSuggestionClick(term)}
                    className="px-4 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white text-slate-600 dark:text-gray-300 text-sm font-medium rounded-xl transition-all active:scale-95 border border-transparent hover:border-slate-800 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-800/20"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Si HAY búsqueda: Mostrar Resultados */
            <div className="py-2">
              <div className="px-4 py-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex justify-between">
                <span>Coincidencias</span>
                <span className="text-red-500">{sugerencias.length} resultados</span>
              </div>
              
              {sugerencias.map((sugerencia, index) => {
                 const isCode = sugerencia.startsWith('"');
                 return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(sugerencia)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 group transition-colors border-l-2 border-transparent hover:border-red-500"
                  >
                    <div className={`p-1.5 rounded-lg ${isCode ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-red-500 group-hover:shadow-sm'}`}>
                       {isCode ? <History className="w-4 h-4"/> : <Search className="w-4 h-4" />}
                    </div>
                    <span className={`flex-1 text-sm ${isCode ? 'font-mono text-blue-700 dark:text-blue-450 font-bold' : 'text-slate-700 dark:text-gray-300 font-medium'}`}>
                      {sugerencia.replace(/"/g, '')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
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