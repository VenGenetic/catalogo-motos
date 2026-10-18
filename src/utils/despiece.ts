/*
  Qué moto lleva cada repuesto: las reglas del despiece por modelo.

  COPIA de Sistema_ERP/apartamentos/bodega/despiece.ts (sin la clasificación
  por sistema: el catálogo usa sus propias secciones). Las reglas se revisaron
  pieza por pieza contra el catálogo real; si cambias una aquí, cambia la
  otra igual, o el ERP y la web le dirán al cliente cosas distintas.

  El código de la importadora es el modelo más la posición de la pieza
  (CB250GP1-019 es el asiento de la GP1 250). Una pieza es de una moto si su
  código es de ella (propia) o si su nombre dice que también le sirve
  (compartida). Los nombres que no dicen la versión no se asignan, salvo las
  excepciones escritas en el modelo (`aSecas`).
*/

export const SEGMENTOS = [
  'Deportivas', 'Doble propósito', 'Enduro', 'Clásicas', 'Utilitarias', 'Caballito', 'Scooters', 'Cuadrón', 'Otros modelos',
] as const;
export type Segmento = typeof SEGMENTOS[number];

export interface ModeloDespiece {
  id: string;
  nombre: string;
  segmento: Segmento;
  /** Prefijos de código de la importadora que son de este modelo. */
  prefijos: string[];
  /** ¿El nombre (ya normalizado) dice que la pieza sirve para este modelo? */
  coincide: (nombre: string) => boolean;
  /**
   * Para sus piezas propias basta con que el nombre diga la familia: en la
   * lista de la Wolf 200 "WOLF/ADV 200" es la Wolf 200 aunque no diga el 200.
   * No sirve para reconocer piezas de otros códigos.
   */
  propio?: RegExp;
  /** Despieces con dibujo publicados por otras marcas que venden la misma moto. */
  documentos?: { titulo: string; url: string }[];
  /** Algo que el vendedor debe confirmar antes de vender piezas de esta moto. */
  aviso?: string;
  /** Versiones de una misma moto (Tekken 250, Evo, Discovery). */
  familia?: string;
  /**
   * Para un modelo que se reconoce por un nombre ambiguo ("TEKKEN" a secas): lo
   * que lo nombra sin duda. Una pieza con código de otra versión de la familia
   * sólo se le comparte si el nombre cumple esto.
   */
  explicito?: RegExp;
  /**
   * El nombre sin cilindrada ("CRUCERO" a secas) también es de este modelo,
   * salvo que el código sea de otro motor: un árbol de levas `CG200-…` que
   * dice "CRUCERO" es de la Crucero 200.
   */
  aSecas?: { nombre: RegExp; salvoPrefijo: RegExp };
}

export interface ProductoDespiece {
  id: number | string;
  sku: string | null;
  name: string;
}


/** Mayúsculas y sin tildes: los nombres vienen escritos de las dos formas. */
export const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

/**
 * "CB250GP1-068G" → prefijo CB250GP1, posición 68, variante G (color, lado, año).
 * Se ignora la terminación de las copias ("CB200WF-070-A", "CB110CX79C-042.").
 */
export function leerCodigo(sku: string | null | undefined): { prefijo: string; numero: number; variante: string } | null {
  const m = (sku || '').trim().toUpperCase().replace(/(-[A-Z]{1,3}|\.)$/, '').match(/^([A-Z0-9]+?)-(\d{1,4})([A-Z]{0,4})$/);
  return m ? { prefijo: m[1], numero: Number(m[2]), variante: m[3] } : null;
}

// --- Versiones que el nombre separa con un sufijo -------------------------

/**
 * GP1 tiene cuatro motos distintas: GP1 250, GP1-R 250, GP1 S 300 y GP1 RR 370.
 * Lo que sigue al "GP1" decide cuál ("GP1/TEKKEN" es la 250; "GP1R", la R).
 */
function versionesGP1(n: string): Set<string> {
  const out = new Set<string>();
  for (const m of n.matchAll(/\bGP\s*-?\s*1/g)) {
    const resto = n.slice((m.index ?? 0) + m[0].length);
    if (/^\s*-?\s*RR(?![A-Z])/.test(resto)) out.add('RR');
    else if (/^\s*-?\s*R(?![A-Z])/.test(resto)) out.add('R');
    else if (/^\s*-?\s*S(?![A-Z])/.test(resto) || /^S\d/.test(resto)) out.add('S');
    else if (/^\d/.test(resto) && !/^250/.test(resto)) continue; // GP12, GP150: otra cosa
    else out.add('250');
  }
  if (/TUNDRA\s*VELOCE/.test(n)) out.add('250');
  return out;
}

/** "SHARK II-III", "SHARK2", "SHARK 1 200B" → {2,3}, {2}, {1}. "SHARK 2012" no es versión. */
function versionesShark(n: string): Set<number> {
  const out = new Set<number>();
  const romano: Record<string, number> = { I: 1, II: 2, III: 3, '1': 1, '2': 2, '3': 3 };
  for (const m of n.matchAll(/\b(?:SHARK|SRK)\s*((?:(?:III|II|I|[123])(?![0-9A-Z])\s*[-/.]?\s*)+)/g)) {
    if (/^\s*SUV\b/.test(n.slice((m.index ?? 0) + m[0].length))) continue; // "SHARK I SUV" es la Shark SUV
    for (const t of m[1].split(/[-/.\s]+/)) if (romano[t]) out.add(romano[t]);
  }
  return out;
}

/** "EAGLE III", "EAGLE 3-4-5", "EAGLE 150CC I-II-III", "EAGLE Z". */
function versionesEagle(n: string): Set<string> {
  const out = new Set<string>();
  const valor: Record<string, string> = { I: '1', II: '2', III: '3', IV: '4', V: '5', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', Z: 'Z' };
  for (const m of n.matchAll(/\bEAGLE\s*(?:150\s*(?:CC)?\s*)?((?:(?:III|II|IV|I|V|Z|[1-5])(?![0-9A-Z])\s*[-/]?\s*)+)/g)) {
    for (const t of m[1].split(/[-/\s]+/)) if (valor[t]) out.add(valor[t]);
  }
  return out;
}

const re = (patron: RegExp) => (n: string) => patron.test(n);

// Para las piezas propias basta con la familia, pero no si el nombre dice OTRA versión:
// "MASCARILLA SHARK II" en la lista de la Shark 1 es de la Shark II.
const SHARK_SIN_VERSION = /\bSHARK\b(?!\s*-?\s*(III|II|I|[123])(?![0-9A-Z]))/;
const EAGLE_SIN_VERSION = /\bEAGLE\b(?!\s*(150\s*(CC)?\s*)?(III|II|IV|I|V|Z|[1-5])(?![0-9A-Z]))/;
const GP1_SIN_VERSION = /\bGP\s*-?\s*1(?!\s*-?\s*(RR?|S)(?![A-Z]))/;

/** "PLACA LAT POST S1 180 2018": la S1 180 anterior, no la Adventure ni la Crossover. */
const esS1Anterior = (n: string) => /\bS1\s*180\b/.test(n) && /\b20(1[5-9]|20)\b/.test(n) && !/\bADV|CROSS/.test(n);

/** Motores CG200 y 170: "CRUCERO" o "CAFE RACER" a secas con este código no es la 150. */
const MOTOR_200 = /^(CG|CGB|CBG)200|^(CG|CGB|CB)170/;

// --- Modelos ---------------------------------------------------------------

export const MODELOS_DESPIECE: ModeloDespiece[] = [
  // Deportivas
  { id: 'gp1-250', nombre: 'GP1 250', segmento: 'Deportivas', prefijos: ['CB250GP1', 'CB200GP1', 'CB25GP1', 'BASGP1'], coincide: n => versionesGP1(n).has('250'), propio: GP1_SIN_VERSION,
    aviso: 'Tuvo dos motores: Loncin RE250 de 2 válvulas (2017-2018) y FE250 de 4 válvulas ("GP1 4V", desde 2023). Confirma el año antes de vender piezas de motor.' },
  { id: 'gp1-r-250', nombre: 'GP1-R 250', segmento: 'Deportivas', prefijos: ['FE250GP1R', 'FE0GP1R', 'BASGP1R'], coincide: n => versionesGP1(n).has('R'), propio: GP1_SIN_VERSION },
  { id: 'gp1-s-300', nombre: 'GP1 S 300', segmento: 'Deportivas', prefijos: ['FE300GPS'], coincide: n => versionesGP1(n).has('S'), propio: GP1_SIN_VERSION },
  { id: 'gp1-rr-370', nombre: 'GP1 RR 370', segmento: 'Deportivas', prefijos: ['CB370GPRR'], coincide: n => versionesGP1(n).has('RR'), propio: GP1_SIN_VERSION },
  { id: 'xpower-250', nombre: 'XPower 250', segmento: 'Deportivas', prefijos: ['CBB250XP', 'BASXP'], coincide: re(/\bX\s*-?\s*POWER\b/),
    aviso: 'Tuvo motor de 2 válvulas (2019-2022) y luego el FE250 de 4 válvulas. Confirma el año antes de vender piezas de motor.' },
  { id: 'feroce-250', nombre: 'Feroce 250', segmento: 'Deportivas', prefijos: ['FE250FRC'], coincide: re(/\bFEROCE\b/) },
  { id: 'wolf-200', nombre: 'Wolf 200', segmento: 'Deportivas', prefijos: ['CB200WF'], coincide: re(/(?<!SUPER\s*)\bWOLF\s*-?\s*200|\bDY\s*-?\s*200\s*WOLF\b/), propio: /(?<!SUPER\s*)\bWOLF\b(?!\s*(EVO|-?\s*250))/ },
  { id: 'wolf-250', nombre: 'Wolf 250', segmento: 'Deportivas', prefijos: ['CB250WF', 'BASWF250', 'KSELWF250'], coincide: re(/(?<!SUPER\s*)\bWOLF\s*-?\s*250|\bWF\s*250\b|\bDY\s*-?\s*250\s*WOLF\b/), propio: /(?<!SUPER\s*)\bWOLF\b(?!\s*(EVO|-?\s*200))/ },
  { id: 'wolf-evolution-250', nombre: 'Wolf Evolution 250', segmento: 'Deportivas', prefijos: ['FE250WFE', 'BASWE'], coincide: re(/\bWOLF\s*EVO/) },
  { id: 'super-wolf-300', nombre: 'Super Wolf 300', segmento: 'Deportivas', prefijos: ['CB300SW', 'BASSPW'], coincide: re(/\bSUPER\s*-?\s*W(OLF)?\b/) },
  { id: 'spitfire-250', nombre: 'Spitfire 250', segmento: 'Deportivas', prefijos: ['CGB250SPF', 'CB250SPF'],
    // "SPITFIRE/M1 STIFF 250CC", "SPITFIRE CG250CC": a secas pero la única cilindrada es 250.
    // El 250 tiene que estar pegado a la Spitfire (en su elemento de la lista o en el siguiente),
    // no en otra moto de una lista universal ("SPITFIRE/DELTA/.../EVEREST 250CC").
    coincide: n => /\bSPIT(FIRE)?\s*(150\s*\/\s*)?250/.test(n)
      || (/\bSPIT(FIRE)?\b[^/]*?250|\bSPIT(FIRE)?\s*\/\s*[^/]*?250/.test(n) && !/\b(150|200)\b|\b(150|200)\s*CC/.test(n)),
    propio: /\bSPIT/ },
  { id: 'gtr-200', nombre: 'GTR 200', segmento: 'Deportivas', prefijos: ['CGB200GTR'], coincide: re(/\bGTR(\s*-?\s*200)?\b(?!\s*-?\s*ROAD)/) },
  { id: 'gtr-roadster-200', nombre: 'GTR Roadster 200', segmento: 'Deportivas', prefijos: ['CGB200GTRRD'], coincide: re(/\bROADSTER\b/) },
  { id: 'predator-200', nombre: 'Predator 200', segmento: 'Deportivas', prefijos: ['CB200PDT'], coincide: re(/\bPREDATOR\b/) },
  { id: 'wing-evo-200', nombre: 'Wing Evo 200', segmento: 'Deportivas', prefijos: ['CG200WEV'], coincide: re(/\bWING\s*EVO\s*(200|I\b(?!\s*I))|\bWEVI\b|\bWING\s*200\b/), propio: /\bWING\s*(EVO\b|200)|\bWEV/ },
  { id: 'wing-evo-2', nombre: 'Wing Evo 2 (200 / 202)', segmento: 'Deportivas', prefijos: ['CG200WEV2', 'CG200WEV2A', 'CG200WINGEV', 'CG200WINGBL', 'CG200WEVF', 'CG200WEVO', 'BASWEV2', 'KSELWEV2'], coincide: re(/\bWING\s*EVO\s*-?\s*(2|II|202)(?!\d)|\bWING\s*EVO\s*20(2[3-9])\b|\bWING\s*EVO\s*I\s*\/\s*II\b|\bWEV\s*2\b|\bWEVI\s*\/\s*II\b/), propio: /\bWING\s*EVO\b|\bWEV/ },
  { id: 'wing-150', nombre: 'Wing 150 (anterior)', segmento: 'Deportivas', prefijos: ['CG150WING'], coincide: re(/\bWING\b(?!\s*(EVO|200))/) },
  { id: 'cobra-370', nombre: 'Cobra 370', segmento: 'Deportivas', prefijos: [], coincide: re(/\bCOBRA\b/) },
  { id: 'zr-290', nombre: 'ZR 290', segmento: 'Deportivas', prefijos: [], coincide: re(/\bZR\s*-?\s*290(?!\d)/) },

  // Doble propósito
  {
    id: 'tekken-250', nombre: 'Tekken 250', segmento: 'Doble propósito', prefijos: [],
    // "TEKKEN250" va pegado. "TEKKEN 4V" es la Evo (la 250 original es de 2 válvulas)
    // y "TEKKEN R" no se sabe cuál es: ninguna de las dos se le da a la 250.
    // La Axxo Tracker y la DK Nativa son gemelas de la Evo, y la 250 original no llegó a 2021.
    coincide: n => /\bTEKK(EN)?(?![A-Z])(?!\s*-?\s*(EVO|DISC|TRACK|R\b))/.test(n) && !/\b4V\b/.test(n)
      && !/\b(NATIVA|TRACKER)\b/.test(n) && !/\b202[1-9]\b/.test(n),
    documentos: [{ titulo: 'Despiece con fotos de la Tekken 250 (RVM Argentina, misma moto)', url: 'https://rvm.com.ar/wp-content/uploads/2019/07/manual-despiece-tekken-rvm.pdf' }],
    familia: 'tekken', explicito: /\b2V\b|\b201[5-9]\b|ANTIGU/,
    aviso: 'La importadora escribe "TEKKEN" a secas tanto para esta moto como para la Evo. Confirma con el cliente cuál tiene antes de vender.',
  },
  { id: 'tekken-evo-250', nombre: 'Tekken Evo 250', segmento: 'Doble propósito', familia: 'tekken', prefijos: ['CB250TKN', 'BASTKN'], coincide: n => /\bTEKKEN\s*EVO|\bTEKKEN\b.*\b4V\b/.test(n) || (/\bTEKK(EN)?(?![A-Z])/.test(n) && /\b(NATIVA|TRACKER)\b/.test(n)), propio: /\bTEKK|\bTKN\b/ },
  { id: 'tekken-discovery-300', nombre: 'Tekken Discovery 300', segmento: 'Doble propósito', familia: 'tekken', prefijos: ['YB300', 'YB300TKD'], coincide: re(/\bTEKKEN\s*DISC/) },
  // "CROSS" a secas sólo como elemento de una lista de motos ("ADV-R/CROSS/LONCIN"):
  // "LLANTA CROSS" es una llanta de taco y "RANGER CROSS" es otra moto.
  { id: 'crossfire-250', nombre: 'Crossfire 250', segmento: 'Doble propósito', prefijos: ['CB250CRF'], coincide: re(/\bCROS+\s*-?\s*FIRE\b|\/\s*CROSS\s*(\/|$)/) },
  { id: 'shark-1-200', nombre: 'Shark 1 200', segmento: 'Doble propósito', prefijos: ['CG200SR1', 'CG200SRK'], coincide: n => versionesShark(n).has(1), propio: SHARK_SIN_VERSION },
  { id: 'shark-2-200', nombre: 'Shark II 200', segmento: 'Doble propósito', prefijos: ['CB200SRK'], coincide: n => versionesShark(n).has(2), propio: SHARK_SIN_VERSION },
  { id: 'shark-3-200', nombre: 'Shark III 200', segmento: 'Doble propósito', prefijos: ['CGB200SR3', 'CB200SKR'], coincide: n => versionesShark(n).has(3), propio: SHARK_SIN_VERSION },
  // Las tres Shark tuvieron versión 250 ("SHARK II 250/200CC", "FARO SHARK I 200/250"). El 250 tiene
  // que ir pegado a la Shark: en "RX/SHARK/BULL 250CC" o "SHARK I/BULL" puede ser cualquiera.
  { id: 'shark-250', nombre: 'Shark 250 (I, II y III)', segmento: 'Doble propósito', prefijos: [], coincide: re(/\bSHARK\b[\sI123/-]*?(CB\s*)?(200\s*(CC)?\s*\/\s*)?250|\bSHARK\s*\/\s*RX\s*250/),
    aviso: 'Hubo Shark 250 de las tres generaciones (I, II y III), cada una con su carrocería. Confirma cuál tiene el cliente antes de vender faros, tanque, placas o guardafangos.' },
  // "SHARK SUV", "SHARK I SUV", "SHARK I 200/250/SUV": es una versión de la Shark I con su carrocería.
  { id: 'shark-suv-200', nombre: 'Shark SUV 200', segmento: 'Doble propósito', prefijos: [], coincide: re(/\bSHARK\s*([I1](?![A-Z0-9]))?[\s\d/.-]*SUV\b/) },
  // RX y Bull son la familia del motor CB250 con la Shark y la Scorpion: "RX-SHARK-BULL".
  { id: 'rx-250', nombre: 'RX 250', segmento: 'Doble propósito', prefijos: ['CB250RX'], coincide: re(/\bRX(?![A-Z])/) },
  { id: 'bull-250', nombre: 'Bull 250', segmento: 'Doble propósito', prefijos: ['CB250BLL'], coincide: re(/\bBULL(?![A-Z])/) },
  { id: 'montana-150', nombre: 'Montana 150', segmento: 'Doble propósito', prefijos: ['CB150'], coincide: re(/\bMONTANA\s*150/), propio: /\bMONTANA\b/ },
  { id: 'montana-200', nombre: 'Montana 200', segmento: 'Doble propósito', prefijos: ['CB200MT'], coincide: re(/\bMONTANA\s*200/) },
  { id: 'force-ds-200', nombre: 'Force DS 200', segmento: 'Doble propósito', prefijos: ['CB200FC'], coincide: re(/(?<!WORK\s*)\bFORCE\b/) },
  { id: 'adventure-200', nombre: 'Adventure 200', segmento: 'Doble propósito', prefijos: ['CB200ADV'], coincide: re(/\bADV(E|ENTURE)?\s*-?\s*200/), propio: /\bADV/ },
  { id: 'adventure-300', nombre: 'Adventure 300', segmento: 'Doble propósito', prefijos: ['TY300ADV'], coincide: re(/\bADV(ENTURE)?\s*300(?!\s*-?\s*R(?![A-Z]))/), propio: /\bADV/ },
  // La lista de la importadora junta las dos: "ADVENTURE-R 250/300CC". "ADV250" es la R: no hubo otra Adventure 250.
  { id: 'adventure-300r', nombre: 'Adventure R (250 / 300)', segmento: 'Doble propósito', prefijos: ['CB250ADV'], coincide: re(/\bADV(ENTURE)?\s*-\s*R(?![A-Z])|\bADV(ENTURE)?\s*300\s*-?\s*R(?![A-Z])|\bADV(ENTURE)?\s*-?\s*(R\s*-?\s*)?250(?!\d)/), propio: /\bADV/ },
  { id: 'arctic-250', nombre: 'Arctic 250', segmento: 'Doble propósito', prefijos: ['FE250ART', 'CKDART'], coincide: re(/\bARC?TIC\b/) },
  { id: 'everest-300', nombre: 'Everest 300 (Dual Sport / Off Road)', segmento: 'Doble propósito', prefijos: ['PR300EVT'], coincide: re(/\bEVEREST\b/) },
  { id: 'xpedition-300', nombre: 'Xpedition 300', segmento: 'Doble propósito', prefijos: ['PR300XPD'], coincide: re(/\bXPEDITION\b/) },
  { id: 'terrex-300', nombre: 'Terrex 300', segmento: 'Doble propósito', prefijos: ['FE300TRX'], coincide: re(/\bTERREX\b/) },

  // Enduro
  { id: 'eagle-150', nombre: 'Eagle 150 (I, II y III)', segmento: 'Enduro', prefijos: ['CGEA150', 'BASEAG'], coincide: n => ['1', '2', '3'].some(v => versionesEagle(n).has(v)), propio: EAGLE_SIN_VERSION },
  { id: 'eagle-4-150', nombre: 'Eagle IV 150', segmento: 'Enduro', prefijos: ['CG150EA4'], coincide: n => versionesEagle(n).has('4'), propio: EAGLE_SIN_VERSION },
  { id: 'eagle-5-150', nombre: 'Eagle 5 150', segmento: 'Enduro', prefijos: ['CG150E5'], coincide: n => versionesEagle(n).has('5'), propio: EAGLE_SIN_VERSION },
  { id: 'eagle-z-200', nombre: 'Eagle Z 200', segmento: 'Enduro', prefijos: ['CB200EGZ'], coincide: n => versionesEagle(n).has('Z'), propio: EAGLE_SIN_VERSION },
  { id: 'scorpion-200-250', nombre: 'Scorpion 200 / 250', segmento: 'Enduro', prefijos: ['CB250SC', 'BASSCO', 'CB250SCSENG', 'CB250B'], coincide: re(/\bSCO(RP|PR)ION\b|\bSCO\b/) }, // "SCO" abreviada: "SHARK/SCO/TEKKEN"

  // Clásicas
  { id: 'cafe-racer-170', nombre: 'Café Racer 170', segmento: 'Clásicas', prefijos: ['CB170', 'CB170CR', 'CGB170'], coincide: re(/\bCAFE\s*RACER\s*170|\bCGB\s*170\b/), propio: /\bCAFE\s*RACER\b(?!\s*1[57]0)/ },
  { id: 'cafe-racer-150', nombre: 'Café Racer 150 (anterior)', segmento: 'Clásicas', prefijos: ['CG150CR'], coincide: re(/\bCAFE\s*RACER\s*150/), propio: /\bCAFE\s*RACER\b(?!\s*1[57]0)/,
    aSecas: { nombre: /\bCAFE\s*RACER\b(?!\s*-?\s*1[57]0)/, salvoPrefijo: MOTOR_200 } },
  { id: 'scrambler-250', nombre: 'Scrambler 250 / Revolution', segmento: 'Clásicas', prefijos: ['CB250SCB'], coincide: n => /\bSCRAMBLER\s*(CLASICA|REVOLUTION|250)/.test(n)
    // "SCB" es la 250 salvo en una lista de motor 300 ("SCB/ADV-R/SUPER WOLF 300CC") o "SCB MAX".
    || (/\bSCB\b(?!\s*MAX)/.test(n) && !(/\b300/.test(n) && !/250/.test(n)))
    // "SCRAMBLER" a secas en una lista de motor 250 ("RE250//TEKKEN/SCRAMBLER/GP1") es la 250.
    || (/\bSCRAMBLER\b(?!\s*(MAX|300|FE))/.test(n) && /\b(RE\s*-?\s*)?250\b/.test(n) && !/\b300\b|\bMAX\b/.test(n)), propio: /\bSCRAMBLER\b(?!\s*(MAX|300|FE\s*300))/ },
  { id: 'scrambler-max-300', nombre: 'Scrambler Max 300', segmento: 'Clásicas', prefijos: ['CB300SCB'], coincide: n => /\bSCRAMBLER\s*(MAX|300|FE\s*300)|\bSCB\s*MAX\b/.test(n) || (/\bSCB\b/.test(n) && /\b300/.test(n) && !/250/.test(n)), propio: /\bSCRAMBLER\b/,
    aviso: 'Hay piezas de motor de dos familias: la del Super Wolf 300 y la FE300 de 4 válvulas (la de la GP1 S y la Terrex). Confirma con el cliente cuál tiene.' },

  // Utilitarias
  { id: 'workforce-150', nombre: 'Workforce 150', segmento: 'Utilitarias', prefijos: ['CG150WRF', 'BASWRF'], coincide: re(/\bWORK\s*-?\s*FORCE(?![A-Z])/) },
  { id: 'delta-150', nombre: 'Delta 150', segmento: 'Utilitarias', prefijos: ['CG150DELT'], coincide: re(/\bDELTA\b/) },
  { id: 'crucero-150', nombre: 'Crucero 150', segmento: 'Utilitarias', prefijos: ['CG150CRU'], coincide: re(/\bCRUCERO\s*150|\bCRU\s*150\b/), propio: /\bCRUCERO\b/,
    aSecas: { nombre: /\bCRUCERO\b(?!\s*-?\s*(150|200))/, salvoPrefijo: MOTOR_200 } },
  // "CRUCERO/200" es la 150 y la 200.
  { id: 'crucero-200', nombre: 'Crucero 200', segmento: 'Utilitarias', prefijos: ['CGB200CRU', 'CBG200CRU'], coincide: re(/\bCRUCERO\s*(150\s*\/|\/)?\s*200|\bCRU\s*200\b/), propio: /\bCRUCERO\b/ },
  { id: 'spitfire-150', nombre: 'Spitfire 150', segmento: 'Utilitarias', prefijos: ['CG150SPF', 'CG150SP', 'CG150SF2'],
    // "SPITFIRE" a secas es la 150 sólo si el nombre no habla de 250.
    coincide: n => /\bSPIT(FIRE)?\s*150/.test(n) || (/\bSPIT(FIRE)?\b(?!\s*\/?\s*250)/.test(n) && !/250/.test(n)),
    propio: /\bSPIT/ },
  { id: 'commander-200', nombre: 'Commander 200', segmento: 'Utilitarias', prefijos: ['CGB200CMD'], coincide: re(/\bCOM?MANDER\b/) },
  { id: 'leopard-150', nombre: 'Leopard 150', segmento: 'Utilitarias', prefijos: ['CG150LP'], coincide: re(/\bLEOPARD\b/) },

  // Caballito
  { id: 'cx7-125', nombre: 'CX7 Evo / Pro 125', segmento: 'Caballito', prefijos: ['CB125CX7', 'BASCX7'], coincide: re(/\bCX\s*-?\s*7\s*(125\s*)?(EVO|PRO)|\bCX7EVO\b|\bCB125\s*CX7\b/), propio: /\bCX\s*-?\s*7/ },
  { id: 'cx7-110', nombre: 'CX7 110 (anterior)', segmento: 'Caballito', prefijos: ['CB110CX79C'], coincide: re(/\bCX7\s*110/) },
  { id: 'tanq-125', nombre: 'TANQ 125', segmento: 'Caballito', prefijos: ['CB125TNQ', 'BASTNQ'], coincide: re(/\bTANQ\b/) },

  // Scooters
  { id: 'bit-125', nombre: 'BIT 125', segmento: 'Scooters', prefijos: ['CB125BIT'], coincide: re(/\bBIT\s*125/) },
  { id: 'bit-se-150', nombre: 'BIT SE 150', segmento: 'Scooters', prefijos: ['CB150BSE'], coincide: re(/\bBIT\s*SE\b/) },
  { id: 'dynamic-pro-150', nombre: 'Dynamic Pro 150', segmento: 'Scooters', prefijos: ['CB150DYP'], coincide: re(/\bDYNAMIC\b/) },
  { id: 's1-150', nombre: 'S1 150', segmento: 'Scooters', prefijos: ['CB150S1', 'CB150GHS1'], coincide: re(/\bS1\s*150|\bGH\s*\/\s*S1\b|\bS1\s*\/(?!\s*180)|\bS1\s*-\s*EVO/), propio: /\bS1\b(?!\s*-?\s*(ADV|CROSS|180))/ },
  { id: 's1-adventure-180', nombre: 'S1 Adventure 180', segmento: 'Scooters', prefijos: ['CB180S1ADV', 'CB18051ADV', 'CB180ADV', 'CB180SADV', 'BASS1ADV'], coincide: n => /\bS1\s*-?\s*ADV(ENTURE)?\b(?!\s*CROSS)|\bS1ADV(?![A-Z])(?!\s*CROSS)|\bS1\s*(150\s*\/\s*)?180\b|\bADVENTURE\s*180|\b180\s*ADVENTURE/.test(n) && !esS1Anterior(n), propio: /\bS1\b/ },
  { id: 's1-crossover-180', nombre: 'S1 Crossover 180', segmento: 'Scooters', prefijos: ['CB180ADVCR'], coincide: n => /\bCROSS\s*OVER\b|\bS1\s*(150\s*\/\s*)?180\b(?!\s*ADV)/.test(n) && !esS1Anterior(n), propio: /\bS1\b|\bCROSS/ },
  // La S1 180 de 2018, anterior a la Adventure y la Crossover: su carrocería no es la de ellas.
  { id: 's1-180', nombre: 'S1 180 (anterior)', segmento: 'Scooters', prefijos: [], coincide: n => esS1Anterior(n) },
  { id: 'agility-180', nombre: 'Agility 180', segmento: 'Scooters', prefijos: ['CB180AGTY'], coincide: re(/\bAGILITY\b(?!\s*X)/) },
  { id: 'agility-x-180', nombre: 'Agility X 180', segmento: 'Scooters', prefijos: ['CB180AGX'], coincide: re(/\bAGILITY\s*X\b/) },
  { id: 'evo-2-180', nombre: 'Evo 2 180', segmento: 'Scooters', prefijos: ['CB180EVO2', 'CB180GHS1'], coincide: re(/(?<!(WING?|TEKKEN)\s*)\bEVO\s*-?\s*2\b(?!\s*200)/), propio: /\bEVO\s*-?\s*2/ },

  // Cuadrón
  { id: 'hunter-200', nombre: 'Hunter 200', segmento: 'Cuadrón', prefijos: ['CB200HTR', 'CB250HTR', 'CB250THR'], coincide: re(/(?<!\bTK\s*)\bHUNTER\b/) }, // "TK HUNTER 180" es otra marca

  // Líneas que la importadora también trae
  { id: 'panther-150', nombre: 'Panther 150', segmento: 'Otros modelos', prefijos: ['CG150PTH'], coincide: re(/\bPANTHER\b/) },
  { id: 'indy-150', nombre: 'Indy 150', segmento: 'Otros modelos', prefijos: ['CG150IND'], coincide: re(/\bINDY\b/) },
  { id: 'zero-150', nombre: 'Zero 150', segmento: 'Otros modelos', prefijos: [], coincide: re(/\bZERO\b/) },
  { id: 'speed-200', nombre: 'Speed 200', segmento: 'Otros modelos', prefijos: ['CG200SPE', 'CG150SPE'], coincide: re(/\bSPEED(?![A-Z])/) },
  // El código CB150GHS1 junta la S1 150 con el scooter "GH" (Ghost): su carrocería no es de la S1.
  { id: 'ghost-150', nombre: 'Ghost (GH) 150', segmento: 'Otros modelos', prefijos: [], coincide: re(/(?<!TUNDRA\s*)\bGHOST\b(?!\s*250)|\bGH\s*150\b/) }, // "TUNDRA GHOST 250" es otra moto
  { id: 'eivissa-150', nombre: 'Eivissa 150', segmento: 'Otros modelos', prefijos: ['CB150EIV'], coincide: re(/\bEIVISSA\b/) },
  { id: 'boneville-150', nombre: 'Boneville 150', segmento: 'Otros modelos', prefijos: ['CB150BON'], coincide: re(/\bBONEVILLE\b/) },
  { id: 'maverick-250', nombre: 'Maverick 250', segmento: 'Otros modelos', prefijos: ['CB250MVK', 'INCOMCB250MVK'], coincide: re(/\bMAVERICK\b/) },
  // Moto Morini: sus códigos son los de fábrica ("461300-P14A-0000"), sin prefijo de modelo.
  { id: 'xcape-650', nombre: 'Moto Morini X-Cape 650', segmento: 'Otros modelos', prefijos: [], coincide: re(/\bX\s*-?\s*CAPE\b/) },
  { id: 'seiemmezzo-650', nombre: 'Moto Morini Seiemmezzo 650', segmento: 'Otros modelos', prefijos: [], coincide: re(/\bSEIE?M+EZZO\b/) },
];

/** Errores de escritura de la importadora que esconden la moto: "SAHRK", "CRUCER 150", "RX/SHARKBULL". */
const ERRATAS: [RegExp, string][] = [
  [/\bSAHA?RK/g, 'SHARK'],
  [/\bSHARK(?=BULL|SCO)/g, 'SHARK/'],
  [/\bBULL(?=SHARK)/g, 'BULL/'],
  [/\bCRUCER\b/g, 'CRUCERO'],
  [/\bEIVISA\b/g, 'EIVISSA'],
  [/\bARTICK\b/g, 'ARTIC'],
  // La moto pegada a la cilindrada: "EVEREST300", "TRACKER250", "WING150CC", "PR300XPEDITION".
  [/\b([A-Z]{3,})(?=\d{3}(?!\d))/g, '$1 '],
  [/(\d{3})(?=[A-Z]{4,})/g, '$1 '],
];

/** El nombre listo para buscarle motos: normalizado y sin las erratas conocidas. */
export const nombreParaMotos = (nombre: string) => ERRATAS.reduce((n, [errata, bien]) => n.replace(errata, bien), normalizar(nombre));

/** ¿El nombre dice que la pieza es de este modelo? `coincide`, o la mención a secas si el código no es de otro motor. */
export const nombra = (modelo: ModeloDespiece, n: string, prefijo = '') =>
  modelo.coincide(n) || Boolean(modelo.aSecas?.nombre.test(n) && !modelo.aSecas.salvoPrefijo.test(prefijo));

/**
 * Piezas que sólo nombran el motor ("CIGÜEÑAL ... FE250 4V", código `FE250-…`)
 * y ninguna moto: son de todas las motos que lo llevan. Sólo motores de un
 * único diseño: "CG150 UNIVERSAL" no entra, bajo ese nombre hay pistones de
 * pin 13 y de pin 15.
 */
const MOTORES: { nombre: RegExp; prefijos: string[]; modelos: string[] }[] = [
  // La lista de la importadora: "FE250 4V TEKKEN EVO/GP1R/XPOWER/ARTIC/GP1/FEROCE/.../WOLF EVOL.".
  { nombre: /\bFE\s*-?\s*250\b.*\b4\s*V/, prefijos: ['FE250'], modelos: ['gp1-250', 'gp1-r-250', 'xpower-250', 'feroce-250', 'wolf-evolution-250', 'tekken-evo-250', 'arctic-250'] },
];

/** Los ids de las motos que lleva el motor que nombra la pieza (vacío si no nombra uno). */
export const modelosDelMotor = (n: string, prefijo = '') =>
  MOTORES.find(motor => motor.nombre.test(n) || motor.prefijos.includes(prefijo))?.modelos ?? [];

/** Líneas eléctricas y artículos de tienda: sus nombres comparten palabras con motos ("B-E AGILITY"). */
const SIN_COMPARTIDAS = new Set(['RBE', 'RME', 'RKX', 'MDY', 'MFP', 'REDAY', 'CED', 'POP']);

type Origen = 'propia' | 'compartida';

/** Las motos de un producto, con la misma lógica que armarDespieces del ERP. */
function asignar(producto: ProductoDespiece, dueño: Map<string, ModeloDespiece[]>): [ModeloDespiece, Origen][] {
  const n = nombreParaMotos(producto.name || '');
  if (/^[^A-Z]*NUEVO[^A-Z]*$/.test(n) || /^FREE\s*DELIVERY/.test(n)) return [];
  const codigo = leerCodigo(producto.sku);
  const propios = (codigo && dueño.get(codigo.prefijo)) || [];
  const compartible = !SIN_COMPARTIDAS.has(codigo?.prefijo ?? '');
  let nombrados = compartible ? MODELOS_DESPIECE.filter(m => nombra(m, n, codigo?.prefijo)) : [];
  // Sin moto en el nombre ni dueño por código: las del motor que nombra ("CARTER IZQ FE250 4V").
  if (compartible && !nombrados.length && !propios.length) {
    const delMotor = modelosDelMotor(n, codigo?.prefijo);
    nombrados = MODELOS_DESPIECE.filter(m => delMotor.includes(m.id));
  }
  const out: [ModeloDespiece, Origen][] = [];
  const dueños: ModeloDespiece[] = [];
  for (const modelo of propios) {
    if (nombrados.length && !nombrados.includes(modelo) && !modelo.propio?.test(n)) continue;
    dueños.push(modelo);
    out.push([modelo, 'propia']);
  }
  for (const modelo of nombrados) {
    if (propios.includes(modelo)) continue;
    const deOtraVersion = modelo.familia && dueños.some(d => d.familia === modelo.familia);
    if (deOtraVersion && modelo.explicito && !modelo.explicito.test(n)) continue;
    out.push([modelo, 'compartida']);
  }
  return out;
}

let indice: Map<string, ModeloDespiece[]> | null = null;
const dueñoPorPrefijo = () => {
  if (!indice) {
    indice = new Map();
    for (const m of MODELOS_DESPIECE) for (const p of m.prefijos) indice.set(p, [...(indice.get(p) ?? []), m]);
  }
  return indice;
};

export const modeloPorId = (id: string) => MODELOS_DESPIECE.find(m => m.id === id);

/**
 * Las piezas de una sola moto (id del producto -> propia o compartida).
 * Sólo se analiza a fondo lo que puede ser de ella, para no recorrer las 80
 * motos con cada uno de los ~6.400 productos en el celular del cliente.
 */
export function piezasDeModelo(productos: ProductoDespiece[], id: string): Map<string | number, Origen> {
  const modelo = modeloPorId(id);
  const out = new Map<string | number, Origen>();
  if (!modelo) return out;
  const dueño = dueñoPorPrefijo();
  for (const p of productos) {
    const prefijo = leerCodigo(p.sku)?.prefijo;
    const n = nombreParaMotos(p.name || '');
    const candidato = (prefijo && modelo.prefijos.includes(prefijo)) || nombra(modelo, n, prefijo) || modelosDelMotor(n, prefijo).includes(modelo.id);
    if (!candidato) continue;
    const suya = asignar(p, dueño).find(([m]) => m.id === modelo.id);
    if (suya) out.set(p.id, suya[1]);
  }
  return out;
}
