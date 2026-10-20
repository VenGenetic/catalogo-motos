import { Producto } from '../types';
import { limpiarTexto } from './helpers';

/*
  El puntaje del buscador del catálogo.

  Las reglas son las de siempre (sinónimos, código exacto entre comillas,
  palabra completa, un error de tipeo, castigo si falta una palabra o si está
  agotado). Lo que cambió es el costo: antes, en cada búsqueda, se pasaban a
  minúsculas los campos de los ~7.000 repuestos y se armaba una expresión
  regular por repuesto y por sinónimo (decenas de miles por búsqueda), y en un
  celular la pantalla se trababa al escribir. Ahora los campos se preparan una
  vez por catálogo (`indexar`) y las expresiones una vez por búsqueda
  (`prepararBusqueda`).

  Además, lo escrito se escapa antes de armar la expresión: con un paréntesis
  suelto ("filtro (") la expresión era inválida y la página quedaba en blanco.
*/

const SINONIMOS: Record<string, string[]> = {
  'freno': ['frenos', 'frenado', 'pastilla', 'pastillas', 'disco', 'tambor'],
  'filtro': ['filtro', 'filtrar', 'filtrado'],
  'aceite': ['aceite', 'lubricante', 'motor oil'],
  'cadena': ['cadena', 'transmisión', 'piñón'],
  'amortiguador': ['amortiguadores', 'suspensión', 'monoshock'],
  'llanta': ['llantas', 'neumático', 'neumáticos', 'rueda', 'ruedas'],
  'faro': ['faros', 'luz', 'luces', 'farola'],
  'escape': ['escape', 'silenciador', 'tubo', 'caño'],
  'motor': ['motor', 'cilindro', 'cilindros', 'piston', 'pistones'],
  'velocimetro': ['velocímetro', 'velocimetros', 'instrumentos', 'panel', 'tablero', 'tacometro', 'tacómetro'],
  'carburador': ['carburador', 'carburadores', 'inyección', 'inyector'],
  'arranque': ['arranque', 'starter', 'partida'],
  'electrico': ['eléctrico', 'eléctrica', 'eléctricos', 'eléctricas', 'electricidad'],
  'telescopica': ['telescopicas', 'telescópica', 'telescópicas', 'barra', 'barras', 'suspensión delantera', 'telescopio', 'amortiguadores delanteros'],
  'monoshock': ['monoshock', 'monoshocks', 'amortiguador trasero', 'suspensión trasera', 'amortiguador', 'suspensión'],
  'instalacion electrica': ['arnes', 'cableado', 'instalacion electrica'],
  'mesa': ['mesa', 'mesas', 'araña', 'arañas', 'castillo'],
  'traccion': ['arrastre'],
  'bujia': ['bujia', 'bujias', 'bujías', 'bujías'],
  'placa': ['placa', 'placas', 'Plastico', 'plasticos'],
  'del': ['delantero', 'delantera', 'delanteros', 'delanteras'],
  'post': ['posterior', 'trasero', 'posteriores', 'traseros'],
  'der': ['derecha', 'derecho', 'derechos', 'derechas'],
  'izq': ['izquierda', 'izquierdo', 'izquierdos', 'izquierdas'],
  'protec': ['protector', 'protectores'],
};

/** El término y todos sus sinónimos (en las dos direcciones). */
const expandir = (termino: string): string[] => {
  const expandidos = new Set<string>([termino]);
  for (const [clave, valores] of Object.entries(SINONIMOS)) {
    if (clave.includes(termino) || valores.some(v => v.includes(termino))) {
      expandidos.add(clave);
      valores.forEach(sinonimo => expandidos.add(sinonimo));
    }
  }
  return Array.from(expandidos);
};

const escaparRegex = (texto: string) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Los campos de un repuesto en minúsculas, preparados una vez por catálogo. */
export interface Indexado {
  nombre: string;
  codigo: string;
  categoria: string;
  texto: string;
  /** Las palabras del nombre y del código, para el error de tipeo (se arman la primera vez que hacen falta). */
  palabrasNombre?: string[];
  palabrasCodigo?: string[];
}

export const indexar = (productos: Producto[]): Map<string, Indexado> => {
  const indice = new Map<string, Indexado>();
  for (const p of productos) {
    indice.set(p.id, {
      nombre: p.nombre.toLowerCase(),
      codigo: p.codigo_referencia?.toLowerCase() || '',
      categoria: (p.categoria || '').toLowerCase(),
      texto: (p.textoBusqueda || '').toLowerCase(),
    });
  }
  return indice;
};

interface Expansion {
  texto: string;
  /** La palabra tal como la escribió el cliente (no un sinónimo). */
  original: boolean;
  /** La expansión como palabra completa. */
  palabra: RegExp;
  /** Sin tildes ni eñes: entonces sirve el atajo de `puntuar` (ver allí). */
  ascii: boolean;
  /** Sólo la palabra original y de 5 letras o más admite un error de tipeo. */
  admiteTipeo: boolean;
}

export interface BusquedaPreparada {
  /** Las palabras escritas, limpias. Vacío: no hay búsqueda. */
  terminos: string[];
  expansiones: Expansion[][];
  /** Lo que va entre comillas: un código exacto. */
  skuExacto: string | null;
}

export const prepararBusqueda = (busqueda: string): BusquedaPreparada => {
  const terminos = limpiarTexto(busqueda).split(' ').filter(t => t.length > 0);
  const expansiones = terminos.map(term => {
    const termLower = term.toLowerCase();
    return expandir(termLower).map(exp => {
      const texto = exp.toLowerCase();
      const original = texto === termLower;
      return {
        texto,
        original,
        palabra: new RegExp(`\\b${escaparRegex(texto)}\\b`, 'i'),
        ascii: /^[\x20-\x7e]*$/.test(texto),
        admiteTipeo: original && texto.length >= 5,
      };
    });
  });
  const comillas = busqueda.includes('"') ? busqueda.match(/"([^"]+)"/) : null;
  return { terminos, expansiones, skuExacto: comillas?.[1] ? comillas[1].toLowerCase() : null };
};

/** ¿Alguna palabra es `term` con, a lo más, un error de tipeo ("dedos gordos")? */
const unErrorDeTipeo = (palabras: string[], term: string): boolean => {
  for (const w of palabras) {
    if (Math.abs(w.length - term.length) <= 1) {
      let mismatches = 0;
      let i = 0, j = 0;
      while (i < term.length && j < w.length) {
        if (term[i] !== w[j]) {
          mismatches++;
          if (mismatches > 1) break;
          if (term[i + 1] === w[j]) i++;
          else if (term[i] === w[j + 1]) j++;
          else { i++; j++; }
        } else {
          i++; j++;
        }
      }
      mismatches += (term.length - i) + (w.length - j);
      if (mismatches <= 1) return true;
    }
  }
  return false;
};

const parecido = (texto: string, palabras: () => string[], term: string): boolean => {
  if (texto.includes(term)) return true;
  // Palabras cortas no: "aro" no es "faro" mal escrito.
  if (term.length < 5) return false;
  return unErrorDeTipeo(palabras(), term);
};

/** El puntaje de un repuesto para la búsqueda (0 o casi 0: no coincide). */
export const puntuar = (producto: Producto, campos: Indexado, busqueda: BusquedaPreparada): number => {
  const { nombre, codigo, categoria, texto } = campos;

  if (busqueda.skuExacto && codigo.includes(busqueda.skuExacto)) return 1000;

  const palabrasNombre = () => (campos.palabrasNombre ??= nombre.split(/[\s-]+/));
  const palabrasCodigo = () => (campos.palabrasCodigo ??= codigo.split(/[\s-]+/));

  let puntuacion = 0;
  let terminosEncontrados = 0;

  for (const expansiones of busqueda.expansiones) {
    let maxTermScore = 0;

    for (const { texto: exp, original, palabra, ascii, admiteTipeo } of expansiones) {
      // Atajo: el texto de búsqueda ya junta nombre, código y categoría (sin tildes). Si
      // una palabra sin tildes no está ahí, tampoco está en ninguno de ellos y sólo podría
      // sumar por un error de tipeo. Así se salta casi todo el trabajo con los sinónimos.
      const enTexto = texto.includes(exp);
      if (!enTexto && ascii && texto && !admiteTipeo) continue;

      let termScore = 0;
      let matchedInExp = false;

      if (codigo === exp) { termScore += 200; matchedInExp = true; }
      else if (codigo.includes(exp)) { termScore += 100; matchedInExp = true; }
      else if (original && parecido(codigo, palabrasCodigo, exp)) { termScore += 80; matchedInExp = true; }

      // Si el nombre ni siquiera contiene la palabra, no hace falta probar la expresión
      // (no puede coincidir): eso ahorra casi todas las pruebas.
      const enNombre = nombre.includes(exp);
      if (nombre === exp) { termScore += 150; matchedInExp = true; }
      else if (enNombre && palabra.test(nombre)) {
        // Si es la primera palabra, vale un poco más.
        if (nombre.startsWith(exp)) { termScore += 90; matchedInExp = true; }
        else { termScore += 70; matchedInExp = true; }
      }
      else if (nombre.startsWith(exp)) { termScore += 50; matchedInExp = true; }
      else if (enNombre) { termScore += 30; matchedInExp = true; }
      else if (original && parecido(nombre, palabrasNombre, exp)) { termScore += 20; matchedInExp = true; }

      if (categoria.includes(exp)) { termScore += 15; matchedInExp = true; }

      if (enTexto) { termScore += 5; matchedInExp = true; }

      // La palabra que escribió el cliente gana contra sus propios sinónimos.
      if (matchedInExp && original) termScore += 50;

      if (matchedInExp && termScore > maxTermScore) maxTermScore = termScore;
    }

    if (maxTermScore > 0) {
      puntuacion += maxTermScore;
      terminosEncontrados++;
    }
  }

  // Si buscó dos palabras, idealmente deben estar las dos (o sus sinónimos).
  if (terminosEncontrados < busqueda.terminos.length) puntuacion = puntuacion / 4;

  if (producto.stock === false) puntuacion *= 0.5;

  return puntuacion;
};
