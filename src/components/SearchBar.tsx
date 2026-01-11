import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Mic, MicOff, TrendingUp } from 'lucide-react';
import { Producto } from '../types';

// Declaraciones de tipos para Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
  }

  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    length: number;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Detectar si es dispositivo móvil
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Generar sugerencias inteligentes basadas en productos
  const sugerencias = useMemo(() => {
    if (!busqueda.trim() || busqueda.length < 2) return [];

    const terminoLower = busqueda.toLowerCase();
    const sugerenciasSet = new Set<string>();

    productos.forEach(producto => {
      // Sugerencias de códigos de referencia
      if (producto.codigo_referencia &&
          producto.codigo_referencia.toLowerCase().includes(terminoLower)) {
        sugerenciasSet.add(`"${producto.codigo_referencia}"`);
      }

      // Sugerencias de nombres de productos
      const palabrasNombre = producto.nombre.split(' ').filter(p => p.length > 2);
      palabrasNombre.forEach(palabra => {
        if (palabra.toLowerCase().includes(terminoLower) &&
            palabra.length > terminoLower.length) {
          sugerenciasSet.add(palabra);
        }
      });

      // Sugerencias de categorías/secciones
      if (producto.seccion && producto.seccion.toLowerCase().includes(terminoLower)) {
        sugerenciasSet.add(producto.seccion);
      }

      // Sugerencias de modelos extraídos del nombre
      const modelosExtraidos = producto.nombre.match(/\b[A-Z]{2,}[\d-]+\b/g) || [];
      modelosExtraidos.forEach(modelo => {
        if (modelo.toLowerCase().includes(terminoLower)) {
          sugerenciasSet.add(modelo);
        }
      });
    });

    return Array.from(sugerenciasSet).slice(0, 8);
  }, [busqueda, productos]);

  // Búsquedas populares (hardcoded por ahora, se puede hacer dinámico después)
  const busquedasPopulares = [
    'freno delantero',
    'filtro aceite',
    'bateria',
    'cadena',
    'amortiguador',
    'llanta',
    'faro',
    'escape'
  ];

  // Inicializar reconocimiento de voz de manera segura
  useEffect(() => {
    // Solo inicializar si estamos en un navegador y es seguro
    if (typeof window === 'undefined') return;

    try {
      // Verificar si la API está disponible
      const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

      if (!hasSpeechRecognition) {
        console.warn('Speech Recognition API no disponible en este navegador');
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.warn('No se pudo acceder a SpeechRecognition');
        return;
      }

      recognitionRef.current = new SpeechRecognition();

      // Configuración segura para móviles
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES'; // Español
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        try {
          if (event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript;
            if (transcript && transcript.trim()) {
              setBusqueda(transcript.trim());
            }
          }
        } catch (error) {
          console.error('Error procesando resultado de voz:', error);
        } finally {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        setIsListening(false);

        // Mostrar mensaje amigable al usuario solo para errores críticos
        if (event.error === 'not-allowed') {
          alert('Permiso de micrófono denegado. Revisa la configuración de tu navegador.');
        } else if (event.error === 'network') {
          alert('Error de conexión. Verifica tu conexión a internet.');
        }
        // Otros errores se manejan silenciosamente
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

    } catch (error) {
      console.error('Error inicializando reconocimiento de voz:', error);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignorar errores al detener
        }
      }
    };
  }, [setBusqueda]);

  const handleVoiceSearch = () => {
    // En móviles, mostrar un mensaje más claro sobre permisos
    if (isMobile) {
      if (!confirm('La búsqueda por voz necesita acceso al micrófono. ¿Permitir acceso?')) {
        return;
      }
    }

    // Verificar si estamos en un entorno seguro (HTTPS o localhost)
    if (typeof window !== 'undefined' && !window.location.protocol.includes('https') && !window.location.hostname.includes('localhost')) {
      alert('La búsqueda por voz requiere una conexión segura (HTTPS)');
      return;
    }

    if (!recognitionRef.current) {
      alert('La búsqueda por voz no está disponible en este navegador');
      return;
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error con reconocimiento de voz:', error);
      setIsListening(false);
      alert('Error al iniciar el reconocimiento de voz. Intenta nuevamente.');
    }
  };

  const handleSuggestionClick = (sugerencia: string) => {
    setBusqueda(sugerencia);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const showSuggestions = isFocused && (sugerencias.length > 0 || (!busqueda && busquedasPopulares.length > 0));

  return (
    <div className="relative group">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
          isFocused ? 'text-red-500' : 'text-gray-400'
        }`} />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || (filtroModelo ? `Buscar en ${filtroModelo}...` : "Buscar repuestos, códigos o marcas...")}
          className="w-full pl-9 pr-20 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none shadow-sm placeholder:text-gray-400 transition-all"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />

        {/* Botones de acción */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Búsqueda por voz */}
          {recognitionRef.current && (
            <button
              onClick={handleVoiceSearch}
              className={`p-1.5 rounded-full transition-all ${
                isListening
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
              title={isListening ? 'Escuchando...' : 'Búsqueda por voz'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {/* Limpiar búsqueda */}
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Panel de sugerencias */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Búsquedas populares cuando no hay búsqueda */}
          {!busqueda && busquedasPopulares.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
                <TrendingUp className="w-3 h-3" />
                BÚSQUEDAS POPULARES
              </div>
              <div className="flex flex-wrap gap-1">
                {busquedasPopulares.map((popular) => (
                  <button
                    key={popular}
                    onClick={() => handleSuggestionClick(popular)}
                    className="px-2 py-1 text-xs bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-md transition-colors"
                  >
                    {popular}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias basadas en la búsqueda actual */}
          {sugerencias.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-600 mb-2 px-1">
                SUGERENCIAS
              </div>
              {sugerencias.map((sugerencia, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(sugerencia)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
                >
                  <Search className="w-3 h-3 text-gray-400" />
                  <span className="flex-1">{sugerencia}</span>
                  {sugerencia.startsWith('"') && sugerencia.endsWith('"') && (
                    <span className="text-xs text-blue-600 font-medium">CÓDIGO</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Consejos de búsqueda */}
          <div className="p-3 border-t border-gray-100 bg-blue-50">
            <div className="text-xs font-semibold text-blue-800 mb-1">💡 CONSEJOS</div>
            <div className="text-xs text-blue-700 space-y-1">
              <div>• Usa comillas para códigos exactos: "ABC123"</div>
              <div>• Busca por marca, modelo o tipo</div>
              <div>• Prueba términos relacionados</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};