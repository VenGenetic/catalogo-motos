import { Producto } from '../types/index';

export const detectarSeccion = (p: Producto): string => {
  // 🛡️ BLINDAJE: Si el nombre o categoría vienen vacíos, usamos texto vacío para no romper la app
  const nombre = p.nombre || '';
  const categoria = p.categoria || '';
  const texto = `${nombre} ${categoria}`.toLowerCase();

  // 1. CABLES Y MANDOS (Prioridad alta)
  if (texto.match(/cable|guaya|manigueta|acelerador|choke|ahogador|puño|manguera|funda/)) return 'Cables y Mandos';

  // 2. MOTOR E INTERNOS (Detección mejorada)
  // Nota: "arbol.*leva" detecta "Arbol de Levas" y "Arbol Levas"
  if (texto.match(/motor|pist|cilind|valv|cigue|biela|carter|empaque|cabeza.*fuerza|balancin|anillo|arbol.*leva|cabezote|cadenilla|tensor|guia.*cadenilla|bendix|balanceador|resorte|sello|carburador|inyector|tobera|admision|arranque|stator|estator/)) return 'Motor e Internos';

  // 3. SISTEMA ELÉCTRICO
  if (texto.match(/electri|bateria|foco|luz|farol|stop|direccional|cdi|bobina|regulador|sensor|tablero|velocimetro|pito|bocina|encendido|switch|rectificador|flasher|relay|fusible|ramal|pulsar/)) return 'Sistema Eléctrico';

  // 4. TRANSMISIÓN
  // Nota: "cadena" se pone aquí, pero "cadenilla" ya fue capturada arriba por Motor
  if (texto.match(/transmision|cadena|piñon|catalina|corona|arrastre|embrague|clutch|disco.*embrague|variador|polin|banda|caja.*cambio|selector|eje.*cambio/)) return 'Transmisión';

  // 5. SISTEMA DE FRENOS
  if (texto.match(/freno|pastilla|disco|zapata|mordaza|caliper|liquido|bomba.*freno/)) return 'Sistema de Frenos';

  // 6. SUSPENSIÓN Y CHASIS
  if (texto.match(/suspension|amortiguador|barra|telescopica|timon|manubrio|espejo|cuna|chasis|tijera|trinche|basculante|estribo|pata|soporte|gato/)) return 'Chasis y Suspensión';

  // 7. CARROCERÍA Y PLÁSTICOS
  if (texto.match(/plastico|tanque|tapa|cubierta|guardabarro|guardafango|guardalodo|carenado|sillon|asiento|parrilla|defensa|porta.*placa|mascarilla|visor|parabrisa|calcomania|sticker|placa/)) return 'Carrocería y Plásticos';

  // 8. RUEDAS Y EJES
  if (texto.match(/llanta|tubo|camara|radio|aro|eje|manzana|rueda|neumatico|bujes|caucho/)) return 'Ruedas y Ejes';

  // 9. FILTROS Y MANTENIMIENTO
  if (texto.match(/filtro|aire|aceite|gasolina|fluido|lubricante|grasa/)) return 'Filtros y Mantenimiento';

  // Si no cae en ninguna, va a Otros
  return 'Otros Repuestos';
};