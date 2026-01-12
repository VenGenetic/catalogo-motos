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
    'escape',
    'pastillas',
    'bujía',
    'velocímetro',
    'culata',
    'estator',
    'piñón',
    'manubrio'
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
      {/* Efecto de glow sutil */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
        isFocused ? 'bg-gradient-to-r from-red-500/10 via-red-400/5 to-red-500/10 blur-sm' : 'opacity-0'
      }`} />

      <div className="relative">
        {/* Icono de búsqueda con animación */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Search className={`h-5 w-5 transition-all duration-300 ${
            isFocused
              ? 'text-red-500 scale-110 drop-shadow-sm'
              : 'text-gray-400 group-hover:text-gray-500'
          }`} />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || (filtroModelo ? `Buscar en ${filtroModelo}...` : "Buscar repuestos, códigos o marcas...")}
          className="relative w-full pl-12 pr-24 py-3.5 text-sm bg-white/80 backdrop-blur-sm border-2 border-gray-200/60 rounded-xl outline-none transition-all duration-300 placeholder:text-gray-400 shadow-sm hover:shadow-md focus:shadow-lg focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 hover:border-gray-300"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />

        {/* Botones de acción con mejor diseño */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {/* Búsqueda por voz */}
          {recognitionRef.current && (
            <button
              onClick={handleVoiceSearch}
              className={`relative p-2 rounded-lg transition-all duration-200 group/voice ${
                isListening
                  ? 'bg-red-100 text-red-600 shadow-lg shadow-red-200/50 scale-105'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 hover:shadow-md'
              }`}
              title={isListening ? 'Escuchando...' : 'Búsqueda por voz'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 animate-pulse" />
              ) : (
                <Mic className="w-4 h-4 group-hover/voice:scale-110 transition-transform" />
              )}
              {isListening && (
                <div className="absolute inset-0 rounded-lg bg-red-500/20 animate-ping" />
              )}
            </button>
          )}

          {/* Limpiar búsqueda */}
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Panel de sugerencias mejorado */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Búsquedas populares cuando no hay búsqueda */}
          {!busqueda && busquedasPopulares.length > 0 && (
            <div className="p-4 border-b border-gray-100/80 bg-gradient-to-r from-gray-50/50 to-white">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="p-1 bg-red-100 rounded-md">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                </div>
                BÚSQUEDAS POPULARES
              </div>
              <div className="flex flex-wrap gap-2">
                {busquedasPopulares.map((popular, index) => (
                  <button
                    key={popular}
                    onClick={() => handleSuggestionClick(popular)}
                    className="px-3 py-1.5 text-sm bg-white hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-lg border border-gray-200 hover:border-red-200 transition-all duration-200 hover:shadow-sm hover:scale-105 font-medium"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {popular}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias basadas en la búsqueda actual */}
          {sugerencias.length > 0 && (
            <div className="p-2 max-h-64 overflow-y-auto">
              <div className="text-xs font-semibold text-gray-600 mb-2 px-2 flex items-center gap-2">
                <Search className="w-3 h-3" />
                SUGERENCIAS
              </div>
              {sugerencias.map((sugerencia, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(sugerencia)}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-white rounded-lg transition-all duration-200 flex items-center gap-3 group/suggestion"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="p-1 bg-gray-100 group-hover/suggestion:bg-red-100 rounded-md transition-colors">
                    <Search className="w-3 h-3 text-gray-400 group-hover/suggestion:text-red-500" />
                  </div>
                  <span className="flex-1 font-medium text-gray-700 group-hover/suggestion:text-red-700">
                    {sugerencia}
                  </span>
                  {sugerencia.startsWith('"') && sugerencia.endsWith('"') && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
                      CÓDIGO
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Consejos de búsqueda mejorados */}
          <div className="p-4 border-t border-gray-100/80 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-2">
              <div className="text-lg">💡</div>
              CONSEJOS DE BÚSQUEDA
            </div>
            <div className="text-xs text-blue-700 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                Usa comillas para códigos exactos: <code className="bg-white px-1 py-0.5 rounded text-blue-600 font-mono">"ABC123"</code>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                Busca por marca, modelo o tipo de repuesto
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                Prueba términos coloquiales como "farola", "pastillas", "tablero"
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};