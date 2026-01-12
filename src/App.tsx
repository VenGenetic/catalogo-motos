import { useState, useMemo, useEffect, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, useSearchParams, Link, useLocation } from 'react-router-dom';
import { Heart, WifiOff } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import './App.css';
import { limpiarTexto } from './utils/helpers';
import { APP_CONFIG } from './config/constants';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView'; 
// Asegúrate de tener este componente creado (te lo di hace un par de pasos)
import { WhatsAppButton } from './components/WhatsAppButton'; 

const CatalogView = lazy(() => import('./components/CatalogView').then(module => ({ default: module.CatalogView })));
const ContactView = lazy(() => import('./components/ContactView').then(module => ({ default: module.ContactView })));

import { ProductDetailModal } from './components/ProductDetailModal';
import { BottomNav } from './components/BottomNav';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Producto } from './types';
import { useProducts } from './hooks/useProducts';
import { useDebounce } from './hooks/useDebounce';

const PageLoader = () => (
  <div className="flex h-[60vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-400 animate-spin animation-delay-300"></div>
      </div>
      <p className="text-gray-500 font-medium animate-pulse">Cargando catálogo...</p>
    </div>
  </div>
);

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { productos, loading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('Todos');
  const busquedaDebounced = useDebounce(busqueda, 300);

  // Monitorear estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Estado inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleFav = useCallback((id: string) => {
    setFavs(prev => {
      const nuevos = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEY_FAVS, JSON.stringify(nuevos));
      return nuevos;
    });
  }, []);

  const productosFavoritos = useMemo(() => {
    return productos.filter(p => favs.includes(p.id));
  }, [productos, favs]);

  const filteredProducts = useMemo(() => {
    if (!busquedaDebounced && filtroSeccion === 'Todos' && !filtroModelo) return productos;

    // Mapeo de términos de búsqueda a variantes relacionadas basado en la tabla proporcionada
    const keywordToTermsMap: Record<string, string[]> = {
      // Instrumentos / Velocímetro
      'tablero': ['velocímetro', 'tacómetro', 'tacometro', 'relojes', 'panel de instrumentos', 'cuenta kilómetros'],
      'velocímetro': ['tablero', 'tacómetro', 'tacometro', 'relojes', 'panel de instrumentos', 'cuenta kilómetros'],
      'tacómetro': ['tablero', 'velocímetro', 'tacometro', 'relojes', 'panel de instrumentos', 'cuenta kilómetros'],
      'tacometro': ['tablero', 'velocímetro', 'tacómetro', 'relojes', 'panel de instrumentos', 'cuenta kilómetros'],
      'relojes': ['tablero', 'velocímetro', 'tacómetro', 'tacometro', 'panel de instrumentos', 'cuenta kilómetros'],
      'panel de instrumentos': ['tablero', 'velocímetro', 'tacómetro', 'tacometro', 'relojes', 'cuenta kilómetros'],
      'cuenta kilómetros': ['tablero', 'velocímetro', 'tacómetro', 'tacometro', 'relojes', 'panel de instrumentos'],

      // Motor / Culata
      'cabezote': ['culata', 'tapa de cilindro', 'cabeza de fuerza', 'tapa de compresión'],
      'culata': ['cabezote', 'tapa de cilindro', 'cabeza de fuerza', 'tapa de compresión'],
      'tapa de cilindro': ['cabezote', 'culata', 'cabeza de fuerza', 'tapa de compresión'],
      'cabeza de fuerza': ['cabezote', 'culata', 'tapa de cilindro', 'tapa de compresión'],
      'tapa de compresión': ['cabezote', 'culata', 'tapa de cilindro', 'cabeza de fuerza'],

      // Sistema Eléctrico / Bujía
      'candela': ['bujía', 'spark plug', 'chispero'],
      'bujía': ['candela', 'spark plug', 'chispero'],
      'spark plug': ['candela', 'bujía', 'chispero'],
      'chispero': ['candela', 'bujía', 'spark plug'],

      // Carburador / Sistema de Aire
      'choke': ['ahogador', 'estrangulador', 'válvula de aire', 'choque'],
      'ahogador': ['choke', 'estrangulador', 'válvula de aire', 'choque'],
      'estrangulador': ['choke', 'ahogador', 'válvula de aire', 'choque'],
      'válvula de aire': ['choke', 'ahogador', 'estrangulador', 'choque'],
      'choque': ['choke', 'ahogador', 'estrangulador', 'válvula de aire'],

      // Sistema Eléctrico / CDI - ECU
      'cerebro': ['cdi', 'ecu', 'computadora', 'módulo de encendido', 'caja negra', 'tci'],
      'cdi': ['cerebro', 'ecu', 'computadora', 'módulo de encendido', 'caja negra', 'tci'],
      'ecu': ['cerebro', 'cdi', 'computadora', 'módulo de encendido', 'caja negra', 'tci'],
      'computadora': ['cerebro', 'cdi', 'ecu', 'módulo de encendido', 'caja negra', 'tci'],
      'módulo de encendido': ['cerebro', 'cdi', 'ecu', 'computadora', 'caja negra', 'tci'],
      'caja negra': ['cerebro', 'cdi', 'ecu', 'computadora', 'módulo de encendido', 'tci'],
      'tci': ['cerebro', 'cdi', 'ecu', 'computadora', 'módulo de encendido', 'caja negra'],

      // Sistema Eléctrico / Relé de Arranque
      'chancho': ['chanchito', 'marrano', 'relé de arranque', 'solenoide de partida', 'relay', 'automático de arranque', 'cochinito'],
      'chanchito': ['chancho', 'marrano', 'relé de arranque', 'solenoide de partida', 'relay', 'automático de arranque', 'cochinito'],
      'marrano': ['chancho', 'chanchito', 'relé de arranque', 'solenoide de partida', 'relay', 'automático de arranque', 'cochinito'],
      'relé de arranque': ['chancho', 'chanchito', 'marrano', 'solenoide de partida', 'relay', 'automático de arranque', 'cochinito'],
      'solenoide de partida': ['chancho', 'chanchito', 'marrano', 'relé de arranque', 'relay', 'automático de arranque', 'cochinito'],
      'relay': ['chancho', 'chanchito', 'marrano', 'relé de arranque', 'solenoide de partida', 'automático de arranque', 'cochinito'],
      'automático de arranque': ['chancho', 'chanchito', 'marrano', 'relé de arranque', 'solenoide de partida', 'relay', 'cochinito'],
      'cochinito': ['chancho', 'chanchito', 'marrano', 'relé de arranque', 'solenoide de partida', 'relay', 'automático de arranque'],

      // Iluminación / Faro Delantero
      'farola': ['faro', 'ojo', 'luz delantera', 'foco delantero', 'lámpara principal', 'farol'],
      'faro': ['farola', 'ojo', 'luz delantera', 'foco delantero', 'lámpara principal', 'farol'],
      'ojo': ['farola', 'faro', 'luz delantera', 'foco delantero', 'lámpara principal', 'farol'],
      'luz delantera': ['farola', 'faro', 'ojo', 'foco delantero', 'lámpara principal', 'farol'],
      'foco delantero': ['farola', 'faro', 'ojo', 'luz delantera', 'lámpara principal', 'farol'],
      'lámpara principal': ['farola', 'faro', 'ojo', 'luz delantera', 'foco delantero', 'farol'],
      'farol': ['farola', 'faro', 'ojo', 'luz delantera', 'foco delantero', 'lámpara principal'],

      // Iluminación / Luz Trasera
      'stop': ['luz de freno', 'piloto trasero', 'luz trasera', 'calavera', 'farol trasero'],
      'luz de freno': ['stop', 'piloto trasero', 'luz trasera', 'calavera', 'farol trasero'],
      'piloto trasero': ['stop', 'luz de freno', 'luz trasera', 'calavera', 'farol trasero'],
      'luz trasera': ['stop', 'luz de freno', 'piloto trasero', 'calavera', 'farol trasero'],
      'calavera': ['stop', 'luz de freno', 'piloto trasero', 'luz trasera', 'farol trasero'],
      'farol trasero': ['stop', 'luz de freno', 'piloto trasero', 'luz trasera', 'calavera'],

      // Iluminación / Direccionales
      'guías': ['direccionales', 'intermitentes', 'pidevías', 'luces de giro', 'flasher'],
      'direccionales': ['guías', 'intermitentes', 'pidevías', 'luces de giro', 'flasher'],
      'intermitentes': ['guías', 'direccionales', 'pidevías', 'luces de giro', 'flasher'],
      'pidevías': ['guías', 'direccionales', 'intermitentes', 'luces de giro', 'flasher'],
      'luces de giro': ['guías', 'direccionales', 'intermitentes', 'pidevías', 'flasher'],
      'flasher': ['guías', 'direccionales', 'intermitentes', 'pidevías', 'luces de giro'],

      // Sistema Eléctrico / Estator
      'bobinas': ['corona de bobinas', 'plato de bobinas', 'estator', 'generador', 'magneto', 'campo'],
      'corona de bobinas': ['bobinas', 'plato de bobinas', 'estator', 'generador', 'magneto', 'campo'],
      'plato de bobinas': ['bobinas', 'corona de bobinas', 'estator', 'generador', 'magneto', 'campo'],
      'estator': ['bobinas', 'corona de bobinas', 'plato de bobinas', 'generador', 'magneto', 'campo'],
      'generador': ['bobinas', 'corona de bobinas', 'plato de bobinas', 'estator', 'magneto', 'campo'],
      'magneto': ['bobinas', 'corona de bobinas', 'plato de bobinas', 'estator', 'generador', 'campo'],
      'campo': ['bobinas', 'corona de bobinas', 'plato de bobinas', 'estator', 'generador', 'magneto'],

      // Transmisión / Kit de Arrastre
      'kit de arrastre': ['kit de transmisión', 'catalina y piñón', 'sprocket kit', 'relación', 'transmisión final'],
      'kit de transmisión': ['kit de arrastre', 'catalina y piñón', 'sprocket kit', 'relación', 'transmisión final'],
      'catalina y piñón': ['kit de arrastre', 'kit de transmisión', 'sprocket kit', 'relación', 'transmisión final'],
      'sprocket kit': ['kit de arrastre', 'kit de transmisión', 'catalina y piñón', 'relación', 'transmisión final'],
      'relación': ['kit de arrastre', 'kit de transmisión', 'catalina y piñón', 'sprocket kit', 'transmisión final'],
      'transmisión final': ['kit de arrastre', 'kit de transmisión', 'catalina y piñón', 'sprocket kit', 'relación'],

      // Transmisión / Corona (Catalina)
      'catalina': ['corona trasera', 'sprocket trasero', 'engranaje trasero', 'plato dentado'],
      'corona trasera': ['catalina', 'sprocket trasero', 'engranaje trasero', 'plato dentado'],
      'sprocket trasero': ['catalina', 'corona trasera', 'engranaje trasero', 'plato dentado'],
      'engranaje trasero': ['catalina', 'corona trasera', 'sprocket trasero', 'plato dentado'],
      'plato dentado': ['catalina', 'corona trasera', 'sprocket trasero', 'engranaje trasero'],

      // Transmisión / Piñón
      'piñón de ataque': ['piñón de salida', 'piñón delantero', 'sprocket delantero', 'piñón de motor'],
      'piñón de salida': ['piñón de ataque', 'piñón delantero', 'sprocket delantero', 'piñón de motor'],
      'piñón delantero': ['piñón de ataque', 'piñón de salida', 'sprocket delantero', 'piñón de motor'],
      'sprocket delantero': ['piñón de ataque', 'piñón de salida', 'piñón delantero', 'piñón de motor'],
      'piñón de motor': ['piñón de ataque', 'piñón de salida', 'piñón delantero', 'sprocket delantero'],

      // Mandos / Cables de Control
      'guaya': ['cable', 'piola', 'alambre', 'chicote'],
      'cable': ['guaya', 'piola', 'alambre', 'chicote'],
      'piola': ['guaya', 'cable', 'alambre', 'chicote'],
      'alambre': ['guaya', 'cable', 'piola', 'chicote'],
      'chicote': ['guaya', 'cable', 'piola', 'alambre'],

      // Suspensión / Horquilla Delantera
      'barras': ['telescópicas', 'suspensión delantera', 'botellas', 'tubos de suspensión', 'amortiguador delantero'],
      'telescópicas': ['barras', 'suspensión delantera', 'botellas', 'tubos de suspensión', 'amortiguador delantero'],
      'suspensión delantera': ['barras', 'telescópicas', 'botellas', 'tubos de suspensión', 'amortiguador delantero'],
      'botellas': ['barras', 'telescópicas', 'suspensión delantera', 'tubos de suspensión', 'amortiguador delantero'],
      'tubos de suspensión': ['barras', 'telescópicas', 'suspensión delantera', 'botellas', 'amortiguador delantero'],
      'amortiguador delantero': ['barras', 'telescópicas', 'suspensión delantera', 'botellas', 'tubos de suspensión'],

      // Suspensión / Basculante
      'tijera': ['basculante', 'horquilla trasera', 'brazo oscilante', 'cuadro trasero'],
      'basculante': ['tijera', 'horquilla trasera', 'brazo oscilante', 'cuadro trasero'],
      'horquilla trasera': ['tijera', 'basculante', 'brazo oscilante', 'cuadro trasero'],
      'brazo oscilante': ['tijera', 'basculante', 'horquilla trasera', 'cuadro trasero'],
      'cuadro trasero': ['tijera', 'basculante', 'horquilla trasera', 'brazo oscilante'],

      // Chasis / Soporte Lateral
      'pata de cabra': ['pata lateral', 'soporte lateral', 'pata', 'muleta'],
      'pata lateral': ['pata de cabra', 'soporte lateral', 'pata', 'muleta'],
      'soporte lateral': ['pata de cabra', 'pata lateral', 'pata', 'muleta'],
      'pata': ['pata de cabra', 'pata lateral', 'soporte lateral', 'muleta'],
      'muleta': ['pata de cabra', 'pata lateral', 'soporte lateral', 'pata'],

      // Chasis / Soporte Central
      'gato central': ['caballete', 'burro', 'soporte central', 'parador central', 'doble pata'],
      'caballete': ['gato central', 'burro', 'soporte central', 'parador central', 'doble pata'],
      'burro': ['gato central', 'caballete', 'soporte central', 'parador central', 'doble pata'],
      'soporte central': ['gato central', 'caballete', 'burro', 'parador central', 'doble pata'],
      'parador central': ['gato central', 'caballete', 'burro', 'soporte central', 'doble pata'],
      'doble pata': ['gato central', 'caballete', 'burro', 'soporte central', 'parador central'],

      // Frenos / Pastillas (Disco)
      'pastillas': ['pastas de freno', 'caliper pads', 'balatas'],
      'pastas de freno': ['pastillas', 'caliper pads', 'balatas'],
      'caliper pads': ['pastillas', 'pastas de freno', 'balatas'],
      'balatas': ['pastillas', 'pastas de freno', 'caliper pads'],

      // Frenos / Zapatas (Tambor)
      'bandas': ['zapatas', 'frenos de tambor', 'balatas de tambor'],
      'zapatas': ['bandas', 'frenos de tambor', 'balatas de tambor'],
      'frenos de tambor': ['bandas', 'zapatas', 'balatas de tambor'],
      'balatas de tambor': ['bandas', 'zapatas', 'frenos de tambor'],

      // Ruedas / Neumáticos
      'llantas': ['cauchos', 'neumáticos', 'neumaticos', 'gomas', 'cubierta', 'cubiertas'],
      'cauchos': ['llantas', 'neumáticos', 'neumaticos', 'gomas', 'cubierta', 'cubiertas'],
      'neumáticos': ['llantas', 'cauchos', 'neumaticos', 'gomas', 'cubierta', 'cubiertas'],
      'neumaticos': ['llantas', 'cauchos', 'neumáticos', 'gomas', 'cubierta', 'cubiertas'],
      'gomas': ['llantas', 'cauchos', 'neumáticos', 'neumaticos', 'cubierta', 'cubiertas'],
      'cubierta': ['llantas', 'cauchos', 'neumáticos', 'neumaticos', 'gomas', 'cubiertas'],
      'cubiertas': ['llantas', 'cauchos', 'neumáticos', 'neumaticos', 'gomas', 'cubierta'],

      // Ruedas / Aros
      'aros': ['rines', 'ruedas metálicas'],
      'rines': ['aros', 'ruedas metálicas'],
      'ruedas metálicas': ['aros', 'rines'],

      // Motor-Chasis / Rulimanes
      'rulimanes': ['rodamientos', 'baleros', 'cojinetes', 'bearings', 'bolilleros'],
      'rodamientos': ['rulimanes', 'baleros', 'cojinetes', 'bearings', 'bolilleros'],
      'baleros': ['rulimanes', 'rodamientos', 'cojinetes', 'bearings', 'bolilleros'],
      'cojinetes': ['rulimanes', 'rodamientos', 'baleros', 'bearings', 'bolilleros'],
      'bearings': ['rulimanes', 'rodamientos', 'baleros', 'cojinetes', 'bolilleros'],
      'bolilleros': ['rulimanes', 'rodamientos', 'baleros', 'cojinetes', 'bearings'],

      // Carrocería / Carenado
      'plásticos': ['carenado', 'cachas', 'tapas', 'vestidura', 'cowl', 'guardafangos'],
      'carenado': ['plásticos', 'cachas', 'tapas', 'vestidura', 'cowl', 'guardafangos'],
      'cachas': ['plásticos', 'carenado', 'tapas', 'vestidura', 'cowl', 'guardafangos'],
      'tapas': ['plásticos', 'carenado', 'cachas', 'vestidura', 'cowl', 'guardafangos'],
      'vestidura': ['plásticos', 'carenado', 'cachas', 'tapas', 'cowl', 'guardafangos'],
      'cowl': ['plásticos', 'carenado', 'cachas', 'tapas', 'vestidura', 'guardafangos'],
      'guardafangos': ['plásticos', 'carenado', 'cachas', 'tapas', 'vestidura', 'cowl'],

      // Mandos / Manubrio
      'volante': ['manubrio', 'manillar', 'timón', 'dirección', 'tubo de dirección'],
      'manubrio': ['volante', 'manillar', 'timón', 'dirección', 'tubo de dirección'],
      'manillar': ['volante', 'manubrio', 'timón', 'dirección', 'tubo de dirección'],
      'timón': ['volante', 'manubrio', 'manillar', 'dirección', 'tubo de dirección'],
      'dirección': ['volante', 'manubrio', 'manillar', 'timón', 'tubo de dirección'],
      'tubo de dirección': ['volante', 'manubrio', 'manillar', 'timón', 'dirección'],

      // Mandos / Puños
      'puños': ['mangos', 'empuñaduras', 'gomas de manubrio', 'grips'],
      'mangos': ['puños', 'empuñaduras', 'gomas de manubrio', 'grips'],
      'empuñaduras': ['puños', 'mangos', 'gomas de manubrio', 'grips'],
      'gomas de manubrio': ['puños', 'mangos', 'empuñaduras', 'grips'],
      'grips': ['puños', 'mangos', 'empuñaduras', 'gomas de manubrio'],

      // Mandos / Manetas
      'maniguetas': ['manillas', 'palancas de freno', 'levas'],
      'manillas': ['maniguetas', 'palancas de freno', 'levas'],
      'palancas de freno': ['maniguetas', 'manillas', 'levas'],
      'levas': ['maniguetas', 'manillas', 'palancas de freno'],

      // Motor / Sistema de Escape
      'mofle': ['escape', 'tubo de escape', 'exhosto', 'silenciador', 'silenciadores', 'bala'],
      'escape': ['mofle', 'tubo de escape', 'exhosto', 'silenciador', 'silenciadores', 'bala'],
      'tubo de escape': ['mofle', 'escape', 'exhosto', 'silenciador', 'silenciadores', 'bala'],
      'exhosto': ['mofle', 'escape', 'tubo de escape', 'silenciador', 'silenciadores', 'bala'],
      'silenciador': ['mofle', 'escape', 'tubo de escape', 'exhosto', 'silenciadores', 'bala'],
      'silenciadores': ['mofle', 'escape', 'tubo de escape', 'exhosto', 'silenciador', 'bala'],
      'bala': ['mofle', 'escape', 'tubo de escape', 'exhosto', 'silenciador', 'silenciadores']
    };

    // Función para expandir términos con sinónimos y términos relacionados
    const expandirTerminos = (terminos: string[]): string[] => {
      const expandidos = new Set<string>();

      terminos.forEach(termino => {
        const terminoLower = termino.toLowerCase();
        expandidos.add(termino);

        // Agregar términos relacionados si existen
        if (keywordToTermsMap[terminoLower]) {
          keywordToTermsMap[terminoLower].forEach(terminoRelacionado => {
            expandidos.add(terminoRelacionado);
          });
        }

        // Agregar sinónimos existentes (mantener compatibilidad)
        const sinonimos: Record<string, string[]> = {
          'freno': ['frenos', 'frenado', 'pastilla', 'pastillas', 'disco', 'tambor'],
          'filtro': ['filtro', 'filtrar', 'filtrado'],
          'aceite': ['aceite', 'lubricante', 'motor oil'],
          'bateria': ['batería', 'baterías', 'acumulador'],
          'cadena': ['cadena', 'transmisión', 'piñón'],
          'amortiguador': ['amortiguadores', 'suspensión', 'shock'],
          'llanta': ['llantas', 'neumático', 'neumáticos', 'rueda', 'ruedas'],
          'faro': ['faros', 'luz', 'luces', 'farola'],
          'escape': ['escape', 'silenciador', 'tubo', 'caño'],
          'motor': ['motor', 'cilindro', 'cilindros', 'piston', 'pistones'],
          'clutch': ['clutch', 'embrague', 'clutches'],
          'velocimetro': ['velocímetro', 'velocimetros', 'instrumentos', 'panel'],
          'carburador': ['carburador', 'carburadores', 'inyección', 'inyector'],
          'arranque': ['arranque', 'starter', 'partida'],
          'electrico': ['eléctrico', 'eléctrica', 'eléctricos', 'eléctricas', 'electricidad']
        };

        Object.entries(sinonimos).forEach(([clave, valores]) => {
          if (clave.includes(terminoLower) || valores.some(v => v.includes(terminoLower))) {
            valores.forEach(sinonimo => expandidos.add(sinonimo));
          }
        });
      });

      return Array.from(expandidos);
    };

    // Función para calcular puntuación de relevancia
    const calcularRelevancia = (producto: Producto, terminos: string[]): number => {
      if (!producto.textoBusqueda) return 0;

      const textoBusqueda = producto.textoBusqueda.toLowerCase();
      const nombre = producto.nombre.toLowerCase();
      const codigo = producto.codigo_referencia?.toLowerCase() || '';
      const seccion = producto.seccion?.toLowerCase() || '';
      let puntuacion = 0;

      // Expandir términos con sinónimos
      const terminosExpandidos = expandirTerminos(terminos);

      // Búsqueda exacta por código si está entre comillas
      if (busquedaDebounced.includes('"')) {
        const match = busquedaDebounced.match(/"([^"]+)"/);
        if (match && codigo.includes(match[1].toLowerCase())) {
          return 1000; // Puntuación máxima para coincidencia exacta de código
        }
      }

      // Calcular puntuación por cada término (original y expandido)
      for (const termino of [...terminos, ...terminosExpandidos]) {
        const terminoLower = termino.toLowerCase();

        // Coincidencia exacta en código de referencia (muy alta puntuación)
        if (codigo.includes(terminoLower)) {
          puntuacion += 50;
        }

        // Coincidencia al inicio del nombre (alta puntuación)
        if (nombre.startsWith(terminoLower)) {
          puntuacion += 30;
        }

        // Coincidencia en el nombre (puntuación media)
        if (nombre.includes(terminoLower)) {
          puntuacion += 20;
        }

        // Coincidencia en sección/categoría (alta puntuación para términos mapeados)
        if (seccion.includes(terminoLower) || terminoLower.includes(seccion)) {
          puntuacion += 25;
        }

        // Coincidencia en cualquier campo (puntuación baja)
        if (textoBusqueda.includes(terminoLower)) {
          puntuacion += 10;
        }

        // Bonus por posición: términos que aparecen más temprano tienen más peso
        const posicion = textoBusqueda.indexOf(terminoLower);
        if (posicion >= 0) {
          puntuacion += Math.max(0, 10 - Math.floor(posicion / 10));
        }
      }



      // Penalización por productos sin stock
      if (producto.stock === false) {
        puntuacion *= 0.7;
      }

      return puntuacion;
    };

    const terminos = busquedaDebounced ? limpiarTexto(busquedaDebounced).split(' ').filter(t => t.length > 0) : [];

    // Filtrar y puntuar productos
    const productosConPuntuacion = productos
      .filter((p) => {
        if (!p.precio) return false;
        if (filtroSeccion !== 'Todos' && p.seccion !== filtroSeccion) return false;
        if (filtroModelo && !p.nombre.toLowerCase().includes(filtroModelo.toLowerCase())) return false;

        // Si hay términos de búsqueda, debe tener al menos puntuación mínima
        if (terminos.length > 0) {
          const puntuacion = calcularRelevancia(p, terminos);
          return puntuacion > 3; // Umbral más bajo para incluir sinónimos
        }

        return true;
      })
      .map((p) => ({
        ...p,
        relevancia: terminos.length > 0 ? calcularRelevancia(p, terminos) : 0
      }))
      .sort((a, b) => {
        // Si hay búsqueda, ordenar por relevancia descendente
        if (terminos.length > 0) {
          return b.relevancia - a.relevancia;
        }
        // Si no hay búsqueda, mantener orden original
        return 0;
      });

    return productosConPuntuacion;
  }, [productos, busquedaDebounced, filtroSeccion, filtroModelo]);

  const handleProductClick = useCallback((p: Producto) => {
    setSelectedProduct(p);
    setSearchParams((prev: URLSearchParams) => { prev.set('prod', p.id); return prev; });
  }, [setSearchParams]);

  const handleCloseModal = useCallback(() => {
    setSelectedProduct(null);
    setSearchParams((prev: URLSearchParams) => { prev.delete('prod'); return prev; });
  }, [setSearchParams]);

  useEffect(() => {
      if (!loading && productos.length > 0) {
        const prodId = searchParams.get('prod');
        if (prodId) {
          const found = productos.find((p) => p.id === prodId);
          if (found) setSelectedProduct(found);
        } else setSelectedProduct(null);
      }
  }, [searchParams, productos, loading]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-red-400 animate-spin animation-delay-300"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-bold text-lg animate-pulse">Cargando catálogo</p>
            <p className="text-gray-400 text-sm mt-1">Preparando repuestos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      {/* Indicador de conexión para móviles */}
      {!isOnline && (
        <div className="md:hidden bg-red-600 text-white text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
          <WifiOff size={16} />
          Sin conexión a internet
        </div>
      )}

      <Navbar />
      <main className="fade-in flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={
              <>
                <Helmet><title>LV PARTS | Repuestos de Moto Ecuador</title></Helmet>
                <HomeView productos={productos} />
              </>
            } />
            
            <Route path="/catalogo" element={
              <>
                <Helmet><title>Catálogo | LV PARTS</title></Helmet>
                <CatalogView 
                  productos={filteredProducts}
                  isFav={(id) => favs.includes(id)} 
                  toggleFav={toggleFav}
                  filtroModelo={filtroModelo} 
                  setFiltroModelo={setFiltroModelo}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  filtroSeccion={filtroSeccion} 
                  setFiltroSeccion={setFiltroSeccion}
                  onProductClick={handleProductClick} 
                />
              </>
            } />

            <Route path="/favoritos" element={
              <>
                <Helmet><title>Mis Favoritos | LV PARTS</title></Helmet>
                {favs.length > 0 ? (
                  <div className="animate-fade-in">
                    <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Heart className="text-red-600 fill-current" /> Mis Favoritos
                      </h2>
                    </div>
                    <CatalogView 
                      productos={productosFavoritos}
                      isFav={(id) => favs.includes(id)} 
                      toggleFav={toggleFav}
                      filtroModelo={filtroModelo} 
                      setFiltroModelo={setFiltroModelo}
                      busqueda={busqueda} 
                      setBusqueda={setBusqueda}
                      filtroSeccion={filtroSeccion} 
                      setFiltroSeccion={setFiltroSeccion}
                      onProductClick={handleProductClick} 
                    />
                  </div>
                ) : (
                  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                      <Heart className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes favoritos</h2>
                    <Link to="/catalogo" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                      Explorar Catálogo
                    </Link>
                  </div>
                )}
              </>
            } />
            <Route path="/contacto" element={<><Helmet><title>Contacto | LV PARTS</title></Helmet><ContactView /></>} />
            <Route path="*" element={<div className="p-20 text-center font-bold text-2xl">404 - No encontrado</div>} />
          </Routes>
        </Suspense>
      </main>
      
      {/* Componentes Globales ACTUALIZADOS */}
      <ProductDetailModal 
        product={selectedProduct} 
        allProducts={productos}         // NUEVO: Pasamos todo el catálogo
        onClose={handleCloseModal} 
        onSelectRelated={handleProductClick} // NUEVO: Acción al hacer clic en un relacionado
      />
      <CartDrawer />
      <WhatsAppButton hideWhenModalOpen={!!selectedProduct || location.pathname !== '/'} /> {/* NUEVO: Botón flotante siempre visible */}
      <ScrollToTopButton />
      <BottomNav />
      <Footer />
    </div>
  );
}