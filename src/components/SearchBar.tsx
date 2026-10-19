import { useState, useEffect, useRef, useMemo, type FormEvent } from 'react';
import { Search, X, Mic, MicOff, TrendingUp, Hash } from 'lucide-react';
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

/*
  El buscador de la barra de arriba: uno solo para toda la página. En el
  catálogo filtra mientras se escribe; desde cualquier otra página, la
  primera letra lleva al catálogo (ver `buscar` en App.tsx).
*/

interface SearchBarProps {
  busqueda: string;
  setBusqueda: (s: string) => void;
  productos: Producto[];
  placeholder: string;
}

const POPULARES = ['Pastillas de freno', 'Kit de arrastre', 'Faro', 'Batería', 'Filtro de aire', 'Llanta'];

export const SearchBar = ({ busqueda, setBusqueda, productos, placeholder }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport] = useState(() => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  // Al salir del buscador el panel espera un instante (para que un toque en una sugerencia
  // alcance a llegar); si se vuelve a entrar antes, esa espera ya no debe cerrarlo.
  const cierreRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Palabras y códigos de los productos que empiezan con lo escrito.
  const sugerencias = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (termino.length < 2 || !isFocused) return [];
    const salida = new Set<string>();
    for (const producto of productos) {
      const codigo = producto.codigo_referencia?.toLowerCase();
      if (codigo?.startsWith(termino)) salida.add(`#${producto.codigo_referencia}`);
      for (const palabra of producto.nombre.split(/[\s/]+/)) {
        if (palabra.length > 2 && palabra.toLowerCase().startsWith(termino)) salida.add(palabra.toUpperCase());
      }
      if (salida.size >= 12) break;
    }
    return Array.from(salida).slice(0, 6);
  }, [busqueda, productos, isFocused]);

  useEffect(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;
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
    } catch (error) { console.error(error); }
  }, [setBusqueda]);

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
    setIsListening(!isListening);
  };

  const elegir = (texto: string) => {
    setBusqueda(texto.replace(/^#/, ''));
    setIsFocused(false);
    inputRef.current?.blur();
  };

  // "Buscar" en el teclado del celular: se cierra el teclado para ver los resultados.
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setBusqueda(busqueda);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const mostrarPanel = isFocused && (!busqueda || sugerencias.length > 0);

  return (
    <form role="search" onSubmit={enviar} className="relative w-full">
      <div className={`relative flex h-11 items-center rounded-lg border bg-white transition-shadow lg:h-12 ${isFocused ? 'border-brand-orange ring-4 ring-brand-orange/25' : 'border-white/20'}`}>
        <Search className="ml-3 h-5 w-5 shrink-0 text-[#666]" strokeWidth={2.4} aria-hidden="true" />
        <label htmlFor="buscador" className="sr-only">Buscar repuestos</label>
        <input
          ref={inputRef}
          id="buscador"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-base font-medium text-[#1a1a1a] outline-none placeholder:text-[#6b6b6b] [&::-webkit-search-cancel-button]:hidden"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          onFocus={() => { clearTimeout(cierreRef.current); setIsFocused(true); }}
          onBlur={() => { cierreRef.current = setTimeout(() => setIsFocused(false), 150); }}
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => { setBusqueda(''); inputRef.current?.focus(); }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#555] hover:bg-black/5"
            aria-label="Borrar búsqueda"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        )}
        {hasSpeechSupport && !busqueda && (
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`mr-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${isListening ? 'animate-pulse bg-red-500 text-white' : 'text-[#555] hover:bg-black/5 hover:text-brand-orange-action'}`}
            aria-label={isListening ? 'Detener búsqueda por voz' : 'Buscar hablando'}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        )}
      </div>

      {mostrarPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-dropdown overflow-hidden rounded-xl border border-ui-border bg-ui-surface text-ui-ink shadow-lifted animate-fade-in-up">
          {!busqueda ? (
            <div className="p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ui-copy">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> Lo más buscado
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULARES.map(term => (
                  <button
                    key={term}
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => elegir(term)}
                    className="min-h-[40px] rounded-full border border-ui-border bg-ui-muted px-3.5 text-sm font-semibold text-ui-ink hover:border-brand-orange hover:text-brand-orange-action dark:hover:text-brand-orange"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="py-1">
              {sugerencias.map(sugerencia => (
                <li key={sugerencia}>
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => elegir(sugerencia)}
                    className="flex min-h-[44px] w-full items-center gap-3 px-4 text-left text-sm hover:bg-ui-muted"
                  >
                    {sugerencia.startsWith('#')
                      ? <Hash className="h-4 w-4 shrink-0 text-ui-copy" aria-hidden="true" />
                      : <Search className="h-4 w-4 shrink-0 text-ui-copy" aria-hidden="true" />}
                    <span className={sugerencia.startsWith('#') ? 'font-mono font-semibold' : 'font-semibold'}>{sugerencia.replace(/^#/, '')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
};
