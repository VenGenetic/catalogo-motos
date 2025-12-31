import { Producto } from '../types/index';

export const detectarSeccion = (p: Producto): string => {
  const texto = (p.nombre + ' ' + p.categoria).toLowerCase();
  
  if (texto.match(/motor|pist|cilind|valv|cigue|biela|carter|empaque|cabeza de fuerza|balancin|anillo|arbol de levas/)) return 'Motor e Internos';
  if (texto.match(/freno|pastilla|disco|zapata|mordaza|liquido|bomba de freno/)) return 'Sistema de Frenos';
  if (texto.match(/llanta|tubo|camara|radio|aro|eje|manzana|rueda/)) return 'Ruedas y Ejes';
  if (texto.match(/electri|bateria|foco|luz|farol|stop|direccional|cdi|bobina|regulador|sensor|tablero|velocimetro|pito|bocina|encendido|switch/)) return 'Sistema Eléctrico';
  if (texto.match(/transmision|cadena|piñon|catalina|corona|arrastre|embrague|clutch|disco de embrague/)) return 'Transmisión';
  if (texto.match(/plastico|tanque|tapa|cubierta|guardabarro|carenado|sillon|asiento|parrilla|defensa|porta placa/)) return 'Carrocería y Plásticos';
  if (texto.match(/suspension|amortiguador|barra|telescopica|timon|manubrio|espejo|cuna|chasis|tijera/)) return 'Chasis y Suspensión';
  if (texto.match(/filtro|aire|aceite|gasolina|fluido|lubricante/)) return 'Filtros y Mantenimiento';
  if (texto.match(/cable|acelerador|embrague|freno/)) return 'Cables y Mandos';
  
  return 'Otros Repuestos';
};