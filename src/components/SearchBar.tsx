import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Mic, MicOff, TrendingUp, ShoppingCart, ArrowRight, Command } from 'lucide-react';
import { Producto } from '../types';

// Estilos CSS para el efecto shimmer
const shimmerStyles = `
  .shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .animation-delay-200 {
    animation-delay: 0.2s;
  }

  .animation-delay-400 {
    animation-delay: 0.4s;
  }
`;

// Inyectar estilos CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shimmerStyles;
  document.head.appendChild(styleSheet);
}

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
  placeholder?: string;
}

export const SearchBar = ({
  busqueda,
  setBusqueda,
  productos,
  placeholder
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showKeyboardHint, setShowKeyboardHint] = useState(true);
  const [isMobileSearch, setIsMobileSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Detectar si es dispositivo móvil
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Categorías disponibles para filtros
  const categorias = [
    'Todos',
    'Motor',
    'Transmisión',
    'Sistema Eléctrico',
    'Sistema de Frenos',
    'Suspensión',
    'Carrocería',
    'Iluminación'
  ];

  // Componente de Shimmer Loading
  const ShimmerSkeleton = () => (
    <div className="p-3 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl">
          <div className="w-12 h-12 bg-gray-200 rounded-xl shimmer"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded shimmer w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded shimmer w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Componente de barras de sonido para voz
  const SoundWave = () => {
    const [bars, setBars] = useState([0.2, 0.4, 0.1, 0.6, 0.3, 0.8, 0.2]);

    useEffect(() => {
      if (!isListening) return;

      const interval = setInterval(() => {
        setBars(prev => prev.map(() => Math.random() * 0.8 + 0.2));
      }, 100);

      return () => clearInterval(interval);
    }, [isListening]);

    return (
      <div className="flex items-end gap-1 h-6">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-1 bg-red-500 rounded-full transition-all duration-100"
            style={{ height: `${height * 24}px` }}
          />
        ))}
      </div>
    );
  };

  // Componente para estado vacío ilustrado
  const EmptyState = () => (
    <div className="p-8 text-center">
      <div className="mb-4">
        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.98-5.5-2.5m.5-4.5a7.963 7.963 0 015 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">No encontramos ese repuesto</h3>
      <p className="text-gray-500 mb-4">¿Prueba con términos como "frenos", "filtro" o "batería"?</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {['frenos', 'filtro', 'batería', 'cadena'].map((sugerencia) => (
          <button
            key={sugerencia}
            onClick={() => handleSuggestionClick(sugerencia)}
            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-full text-sm font-medium transition-colors"
          >
            {sugerencia}
          </button>
        ))}
      </div>
    </div>
  );

  // Placeholders dinámicos con efecto typewriter
  const placeholders = [
    'Buscar repuestos...',
    'Busca "Llantas"...',
    'Busca "Baterías"...',
    'Busca por referencia...',
    'Busca "Frenos"...',
    'Busca "Velocímetro"...'
  ];

  // Simular loading cuando hay búsqueda activa
  useEffect(() => {
    if (busqueda && busqueda.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 800); // Simular delay de búsqueda
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [busqueda]);

  // Función para resaltar texto coincidente
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-red-100 text-red-700 font-semibold px-0.5 rounded">
          {part}
        </span>
      ) : part
    );
  };

  // Efecto typewriter para placeholders
  useEffect(() => {
    if (busqueda || isFocused) return; // No ejecutar si hay búsqueda o está enfocado

    const currentText = placeholders[placeholderIndex];
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 2000;

    if (isTyping) {
      if (currentPlaceholder.length < currentText.length) {
        // Escribiendo
        const timeout = setTimeout(() => {
          setCurrentPlaceholder(currentText.slice(0, currentPlaceholder.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Pausa antes de borrar
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, pauseTime);
        return () => clearTimeout(timeout);
      }
    } else {
      if (currentPlaceholder.length > 0) {
        // Borrando
        const timeout = setTimeout(() => {
          setCurrentPlaceholder(currentPlaceholder.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Cambiar al siguiente placeholder
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setIsTyping(true);
      }
    }
  }, [currentPlaceholder, placeholderIndex, isTyping, busqueda, isFocused, placeholders]);

  // Control de expansión del ancho
  useEffect(() => {
    setIsExpanded(isFocused || busqueda.length > 0);
  }, [isFocused, busqueda]);

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
    setShowKeyboardHint(false);
    inputRef.current?.blur();
  };

  const handleCategorySelect = (categoria: string) => {
    setSelectedCategory(categoria === 'Todos' ? '' : categoria);
  };

  const handleQuickAction = (action: string, producto: Producto) => {
    // Aquí iría la lógica para añadir al carrito o navegar
    console.log(`${action} para producto:`, producto.nombre);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearch(!isMobileSearch);
  };

  const showSuggestions = isFocused && (sugerencias.length > 0 || (!busqueda && busquedasPopulares.length > 0));

  return (
    <>
      {/* Overlay de dimming para modo enfoque */}
      {isFocused && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 transition-opacity duration-300"
          onClick={() => {
            setIsFocused(false);
            inputRef.current?.blur();
          }}
        />
      )}

      <div className="relative group">
        {/* Efecto de glow dinámico */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isFocused ? 'bg-gradient-to-r from-red-500/20 via-red-400/10 to-red-500/20 blur-md scale-110' : 'opacity-0'
        }`} />

        {/* Borde gradiente animado */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isFocused
            ? 'bg-gradient-to-r from-red-500 via-red-400 to-red-600 p-[2px] animate-pulse'
            : 'bg-gradient-to-r from-transparent via-transparent to-transparent p-[2px]'
        }`}>
          <div className="w-full h-full rounded-full bg-white" />
        </div>

        <div className="relative">
          {/* Chip de categoría seleccionada */}
          {selectedCategory && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center">
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md mr-2">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {/* Icono de búsqueda con animación de rebote */}
          <div className={`absolute ${selectedCategory ? 'left-20' : 'left-4'} top-1/2 -translate-y-1/2 z-10`}>
            <Search className={`h-5 w-5 transition-all duration-300 ${
              isFocused
                ? 'text-red-500 scale-110 drop-shadow-sm animate-bounce'
                : 'text-gray-400 group-hover:text-gray-500 group-hover:scale-105'
            }`} />
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder={
              isListening
                ? ""
                : busqueda || isFocused
                  ? (placeholder || "Buscar repuestos, códigos o marcas...")
                  : currentPlaceholder
            }
            className={`relative w-full text-sm bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 outline-none transition-all duration-500 placeholder:text-gray-400 shadow-lg hover:shadow-xl focus:shadow-2xl focus:bg-white focus:ring-0 hover:border-gray-300 ${
              isExpanded
                ? 'pl-12 pr-24 py-4 rounded-full min-w-[400px] max-w-[600px]'
                : 'pl-12 pr-24 py-3.5 rounded-full min-w-[300px] max-w-[400px]'
            } ${selectedCategory ? 'pl-20' : ''}`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowKeyboardHint(false);
            }}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />

          {/* Barras de sonido cuando está escuchando */}
          {isListening && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <SoundWave />
            </div>
          )}

          {/* Botones de acción con micro-interacciones */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Búsqueda por voz con efecto de onda */}
            {recognitionRef.current && (
              <div className="relative">
                <button
                  onClick={handleVoiceSearch}
                  className={`relative p-2.5 rounded-full transition-all duration-200 group/voice ${
                    isListening
                      ? 'bg-red-100 text-red-600 shadow-lg shadow-red-200/50 scale-110'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50 hover:shadow-md'
                  }`}
                  title={isListening ? 'Escuchando...' : 'Búsqueda por voz'}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Mic className="w-4 h-4 group-hover/voice:scale-110 transition-transform" />
                  )}
                </button>
                {/* Efecto de onda pulsante */}
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping animation-delay-300" />
                  </>
                )}
              </div>
            )}

            {/* Limpiar búsqueda con rotación */}
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 hover:shadow-md hover:scale-105 hover:rotate-90"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Badge de teclado (Command Palette Style) */}
        {showKeyboardHint && !busqueda && !isFocused && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md border border-gray-200 opacity-60 hover:opacity-100 transition-opacity">
              <Command className="w-3 h-3" />
              <span className="hidden sm:inline">/</span>
            </div>
          </div>
        )}

        {/* Panel de sugerencias mejorado con imágenes y agrupación */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden">
            {/* Selector de categorías */}
            <div className="p-4 border-b border-gray-100/80 bg-gray-50/50">
              <div className="flex flex-wrap gap-2">
                {categorias.map((categoria) => (
                  <button
                    key={categoria}
                    onClick={() => handleCategorySelect(categoria)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                      selectedCategory === categoria || (categoria === 'Todos' && !selectedCategory)
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    {categoria}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading con Shimmer */}
            {isLoading && <ShimmerSkeleton />}

            {/* Búsquedas populares cuando no hay búsqueda */}
            {!busqueda && !isLoading && busquedasPopulares.length > 0 && (
              <div className="p-5 bg-gradient-to-r from-gray-50/50 to-white">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-4">
                  <div className="p-2 bg-red-100 rounded-xl shadow-sm">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                  </div>
                  BÚSQUEDAS POPULARES
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {busquedasPopulares.slice(0, 9).map((popular) => (
                    <button
                      key={popular}
                      onClick={() => handleSuggestionClick(popular)}
                      className="px-4 py-2.5 text-sm bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 text-gray-700 hover:text-red-700 rounded-xl border border-gray-200 hover:border-red-200 transition-all duration-300 hover:shadow-lg hover:scale-105 font-medium group/popular"
                    >
                      <span className="group-hover/popular:scale-105 transition-transform inline-block">
                        {popular}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sugerencias basadas en la búsqueda actual */}
            {sugerencias.length > 0 && !isLoading && (
              <div className="max-h-64 overflow-y-auto">
                <div className="text-xs font-bold text-gray-600 mb-2 px-4 pt-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  SUGERENCIAS
                </div>
                <div className="space-y-1">
                  {sugerencias.map((sugerencia, index) => (
                    <div
                      key={sugerencia}
                      className="relative group/item"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <button
                        onClick={() => handleSuggestionClick(sugerencia)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-none transition-all duration-200 flex items-center gap-4"
                      >
                        <div className="p-2 bg-gray-100 rounded-xl transition-all duration-200 shadow-sm">
                          <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="flex-1 font-medium text-gray-700">
                          {highlightMatch(sugerencia, busqueda)}
                        </span>
                        {sugerencia.startsWith('"') && sugerencia.endsWith('"') && (
                          <span className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full font-bold border border-blue-300 shadow-sm">
                            CÓDIGO
                          </span>
                        )}
                      </button>

                      {/* Acciones rápidas al hacer hover */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAction('cart', { id: sugerencia, nombre: sugerencia } as any);
                          }}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                          title="Añadir al carrito"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAction('navigate', { id: sugerencia, nombre: sugerencia } as any);
                          }}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                          title="Ver producto"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estado vacío ilustrado */}
            {busqueda && !isLoading && sugerencias.length === 0 && (
              <EmptyState />
            )}

            {/* Consejos de búsqueda mejorados */}
            <div className="p-5 border-t border-gray-100/80 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div className="flex items-center gap-3 text-sm font-bold text-blue-800 mb-3">
                <div className="text-2xl animate-bounce">💡</div>
                CONSEJOS DE BÚSQUEDA
              </div>
              <div className="text-sm text-blue-700 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  Usa comillas para códigos exactos: <code className="bg-white px-2 py-1 rounded-lg text-blue-600 font-mono font-bold shadow-sm">"ABC123"</code>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
                  Busca por marca, modelo o tipo de repuesto
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-400"></div>
                  Prueba términos coloquiales como "farola", "pastillas", "tablero"
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal inmersivo para móviles */}
      {isMobileSearch && isMobile && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header con input y botón cancelar */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white">
            <button
              onClick={toggleMobileSearch}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar repuestos..."
                className="w-full pl-10 pr-4 py-3 text-lg bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Contenido del modal */}
          <div className="flex-1 overflow-y-auto">
            {/* Selector de categorías */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {categorias.map((categoria) => (
                  <button
                    key={categoria}
                    onClick={() => handleCategorySelect(categoria)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                      selectedCategory === categoria || (categoria === 'Todos' && !selectedCategory)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    {categoria}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido según estado */}
            {isLoading && <ShimmerSkeleton />}
            {!busqueda && !isLoading && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Búsquedas populares</h3>
                <div className="grid grid-cols-2 gap-3">
                  {busquedasPopulares.map((popular) => (
                    <button
                      key={popular}
                      onClick={() => handleSuggestionClick(popular)}
                      className="p-4 bg-gray-50 hover:bg-red-50 text-left rounded-lg transition-colors"
                    >
                      <span className="font-medium text-gray-700">{popular}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {sugerencias.length > 0 && !isLoading && (
              <div className="divide-y divide-gray-100">
                {sugerencias.map((sugerencia) => (
                  <button
                    key={sugerencia}
                    onClick={() => handleSuggestionClick(sugerencia)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                  >
                    <Search className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {highlightMatch(sugerencia, busqueda)}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {busqueda && !isLoading && sugerencias.length === 0 && <EmptyState />}
          </div>
        </div>
      )}
    </>
  );
};