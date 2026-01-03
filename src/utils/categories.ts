import { Producto } from '../types/index';

// Diccionario de reglas: Categoría -> Expresión Regular
const CATEGORY_RULES: Record<string, RegExp> = {
  'Cables y Mandos': /cable|guaya|manigueta|acelerador|choke|ahogador|puño|manguera|funda/i,
  'Motor e Internos': /motor|pist|cilind|valv|cigue|biela|carter|empaque|cabeza.*fuerza|balancin|anillo|arbol.*leva|cabezote|cadenilla|tensor|guia.*cadenilla|bendix|balanceador|resorte|sello|carburador|inyector|tobera|admision|arranque|stator|estator/i,
  'Sistema Eléctrico': /electri|bateria|foco|luz|farol|stop|direccional|cdi|bobina|regulador|sensor|tablero|velocimetro|pito|bocina|encendido|switch|rectificador|flasher|relay|fusible|ramal|pulsar/i,
  'Transmisión': /transmision|cadena|piñon|catalina|corona|arrastre|embrague|clutch|disco.*embrague|variador|polin|banda|caja.*cambio|selector|eje.*cambio/i,
  'Sistema de Frenos': /freno|pastilla|disco|zapata|mordaza|caliper|liquido|bomba.*freno/i,
  'Chasis y Suspensión': /suspension|amortiguador|barra|telescopica|timon|manubrio|espejo|cuna|chasis|tijera|trinche|basculante|estribo|pata|soporte|gato/i,
  'Carrocería y Plásticos': /plastico|tanque|tapa|cubierta|guardabarro|guardafango|guardalodo|carenado|sillon|asiento|parrilla|defensa|porta.*placa|mascarilla|visor|parabrisa|calcomania|sticker|placa/i,
  'Ruedas y Ejes': /llanta|tubo|camara|radio|aro|eje|manzana|rueda|neumatico|bujes|caucho/i,
  'Filtros y Mantenimiento': /filtro|aire|aceite|gasolina|fluido|lubricante|grasa/i,
};

export const detectarSeccion = (p: Producto): string => {
  // Protección contra datos vacíos
  const nombre = p.nombre || '';
  const categoria = p.categoria || '';
  
  // Unimos nombre y categoría para buscar palabras clave
  const texto = `${nombre} ${categoria}`.toLowerCase();

  // Iteramos sobre las reglas
  for (const [seccion, regex] of Object.entries(CATEGORY_RULES)) {
    if (regex.test(texto)) {
      return seccion;
    }
  }

  // Si nada coincide
  return 'Otros Repuestos';
};