/*
  Sistema de cada repuesto (Motor, Frenos, Sistema eléctrico…): las secciones
  del catálogo y las pestañas del despiece de cada moto.

  COPIA de la clasificación de Sistema_ERP/apartamentos/bodega/despiece.ts
  (de SISTEMAS y de "Sistema de cada pieza") y de `tipoPieza` de
  scripts/meta/clasificador.js. Si cambias una regla allá, cámbiala aquí
  igual: el ERP y la web tienen que poner la misma pieza en el mismo sistema.

  Vive aparte de despiece.ts porque se usa al cargar los productos y no tiene
  lookbehind: carga en cualquier navegador (ver utils/cargarDespiece.ts).
*/

export const SISTEMAS = [
  'Motor',
  'Transmisión',
  'Sistema eléctrico',
  'Frenos',
  'Suspensión y dirección',
  'Ruedas',
  'Chasis y carrocería',
  'Escape',
  'Manubrio y mandos',
  'Accesorios',
  'Otros',
] as const;
export type Sistema = typeof SISTEMAS[number];

/** Mayúsculas y sin tildes: los nombres vienen escritos de las dos formas. */
export const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

// --- Tipo de pieza (copia de scripts/meta/clasificador.js) -------------------

// Orden IMPORTA: lo mas especifico primero, se toma la primera coincidencia.
const TIPOS: [string, RegExp[]][] = [
  ['Suspension > Telescopicas',       [/telescopic/i, /barras? de suspension/i]],
  ['Suspension > Monoshock',          [/monoshock/i, /amortiguador/i]],
  ['Suspension > Mesa de direccion',  [/mesa (de )?direccion/i, /\btija\b/i]],
  ['Motor > Cilindro y piston',       [/cilindro y piston/i, /cilindro-piston/i, /\bcilindro\b/i, /\bpiston\b/i]],
  ['Motor > Culata',                  [/culata/i, /cabezote/i]],
  ['Motor > Cigueñal',                [/cigue[nñ]al/i]],
  ['Motor > Embrague',                [/embrague/i, /\bclutch\b/i, /disco[s]? de friccion/i]],
  ['Motor > Valvulas y arbol',        [/valvula/i, /arbol de leva/i, /balancin/i]],
  ['Motor > Empaques y retenes',      [/empaque/i, /\breten\b/i, /kit de junta/i]],
  ['Motor > Tapas y protectores',     [/tapa motor/i, /tapa de motor/i, /protec.{0,4} motor/i]],
  ['Motor > Arranque',                [/arranque/i, /bendix/i]],
  ['Motor > Radiador',                [/radiador/i, /bomba de agua/i]],
  ['Motor > Carburacion e inyeccion', [/carburador/i, /inyector/i, /cuerpo de acelera/i, /\btbi\b/i]],
  ['Motor > Filtros',                 [/filtro/i]],
  ['Motor > Lubricacion',             [/\baceite\b/i, /lubricante/i]],
  ['Transmision > Kit de arrastre',   [/kit de arrastre/i, /kit arrastre/i]],
  ['Transmision > Piñon y corona',    [/pi[nñ]on/i, /corona/i, /\bcatalina\b/i]],
  ['Transmision > Cadena',            [/cadena/i]],
  ['Transmision > Caja de cambios',   [/caja de cambio/i, /\bpi[nñ]oneria\b/i, /horquilla de cambio/i]],
  ['Frenos > Pastillas y zapatas',    [/pastilla/i, /zapata/i, /banda de freno/i]],
  ['Frenos > Disco',                  [/disco (de )?freno/i, /disco del/i, /disco post/i]],
  ['Frenos > Bomba y mordaza',        [/bomba (de )?freno/i, /mordaza/i, /caliper/i]],
  ['Frenos > Otros',                  [/freno/i]],
  ['Ruedas > Aros',                   [/\baro\b/i, /\baros\b/i, /\brin\b/i, /magnecio/i, /magnesio/i]],
  ['Ruedas > Llantas',                [/llanta/i, /neumatico/i]],
  ['Ruedas > Rodamientos y ejes',     [/rodamiento/i, /\beje\b/i, /ruliman/i]],
  ['Electrico > Faro',                [/\bfaro\b/i, /mascarilla/i, /\bhalogeno\b/i]],
  ['Electrico > Velocimetro',         [/velocimetro/i, /tablero/i, /\bodometro\b/i]],
  ['Electrico > Stop y direccionales',[/\bstop\b/i, /direccional/i, /guia luz/i, /luz post/i]],
  ['Electrico > CDI y bobina',        [/\bcdi\b/i, /bobina/i, /\bstator\b/i, /regulador/i, /rectificador/i, /\bmagneto\b/i]],
  ['Electrico > Bateria',             [/bateria/i]],
  ['Electrico > Switches y cables',   [/switch/i, /\bllaves\b/i, /\barnes\b/i, /\bcable\b/i, /\bsensor\b/i, /\bboya\b/i]],
  // Placas ANTES que Tanque: "PLACA TANQUE (I-D)" es la cacha lateral que va
  // sobre el tanque, no el tanque. Al reves quedaban 22 placas anunciadas como
  // tanques de gasolina -- el cliente llega esperando otra pieza y se cae la venta.
  ['Carroceria > Placas',             [/placa tanque/i, /placa lat/i, /\bplaca\b/i]],
  ['Carroceria > Tanque',             [/tanque/i]],
  ['Carroceria > Guardafango',        [/guardafango/i, /guardabarro/i]],
  ['Carroceria > Carenaje',           [/carenaje/i, /\bcubierta\b/i, /\bcacha\b/i, /\bdeflector\b/i]],
  ['Carroceria > Asiento',            [/asiento/i, /\bsillin\b/i]],
  ['Carroceria > Porta placas',       [/porta placa/i, /portaplaca/i]],
  ['Carroceria > Estribos',           [/estribo/i, /\bpedal\b/i, /\bposapie\b/i]],
  ['Carroceria > Parrilla y baul',    [/parrilla/i, /\bbaul\b/i, /\bmaleta\b/i]],
  ['Escape',                          [/escape/i, /silenciador/i, /\bmofle\b/i]],
  ['Manubrio y mandos',               [/manubrio/i, /manigueta/i, /\bmaneral\b/i, /pu[nñ]o/i, /acelerador/i, /espejo/i]],
  ['Accesorios del piloto',           [/\bcasco\b/i, /guantes?/i, /chompa/i, /\bchaleco\b/i, /rodillera/i]],
];

function tipoPieza(nombre: string): string {
  for (const [tipo, patrones] of TIPOS) {
    if (patrones.some((re) => re.test(nombre))) return tipo;
  }
  return 'Repuestos > Otros';
}

// --- Sistema de cada pieza -------------------------------------------------

/**
 * La pieza es lo primero que dice el nombre; lo demás son atributos. "TANQUE
 * GASOLINA SIN BOYA" es un tanque, no un sensor; "ARO ... ZAPATA", un aro.
 * Se mira el comienzo antes que cualquier palabra suelta.
 */
const EXCEPCIONES: [RegExp, Sistema][] = [
  [/^PASTILLAS?\s*(DE\s*)?CALIBRACION/, 'Motor'],
  [/^PI[NÑ]ON\s*(DE\s*)?VELOCIMETRO|^RUEDA\s*FONICA/, 'Sistema eléctrico'],
  [/^(EJE\s*)?PEDAL\s*(DE\s*)?ARRANQUE|^PI[NÑ]ON(ES)?\s*(DE\s*)?ARRANQUE|^KIT\s*PI[NÑ]ONES\s*(DE\s*)?ARRANQUE/, 'Motor'],
];
const INICIO: [RegExp, Sistema][] = [
  [/^(DISCO\s*(DE\s*)?FRENO|PASTILLAS?\b|ZAPATAS?\b|MORDAZA|BOMBA\s*(DE\s*)?FRENO|KIT\s*(DE\s*)?FRENO|TROMPOS?\s*(DE\s*)?FRENO(?!.*EMBRAGUE)|PORTA\s*ZAPATA|CALIPER|MANGUERA\s*(DE\s*)?FRENO|GALLETA\s*(DE\s*)?FRENO|VARILLA\s*(DE\s*)?FRENO|PEDAL\s*(DE\s*)?FRENO)/, 'Frenos'],
  [/^(CILINDRO|PISTON|KIT\s*(DE\s*)?(PISTON|CILINDRO|EMPAQUE|SELLO|EMBRAGUE)|CABEZOTE|CIGUE[NÑ]AL|CARTER?\b|[AÁ]RBOL|VALVULA|BALANCIN|EMPAQUE|BOMBA\s*(DE\s*)?(ACEITE|AGUA|GASOLINA)|CADENILLA|TENSOR|GUIA\s*CADENILLA|CARBURADOR|BASE\s*CARBURADOR|FILTRO|DEPURADOR|MOTOR\s*(DE\s*)?ARRANQUE|BENDIX|EMBRAGUE|RADIADOR|BUJIA|TAPA\s*(MOTOR|CABEZOTE|FILTRO)|EJE\s*BALANCEADOR|VENTILADOR|BIELA|ANILLOS?\b|RETEN|MEDIDOR\s*(DE\s*)?ACEITE|BAYONETA|TROMPOS?\s*FRENO.*EMBRAGUE)/, 'Motor'],
  [/^(CATALINA|PI[NÑ]ON\s*MOTRIZ|PORTA\s*CATALINA|CADENA\b|KIT\s*(DE\s*)?(ARRASTRE|TRACCION)|CAJA\s*(DE\s*)?CAMBIO|SELECTOR|(EJE\s*)?PEDAL\s*(DE\s*)?CAMBIO|PATINETA|ESTRELLA|TROMPO\s*(DE\s*)?CAMBIO|TAPA\s*PI[NÑ]ON\s*MOTRIZ|CUBRE\s*CADENA|CAUCHO\s*DESLIZ|TEMPLADOR|BANDA\s*(DE\s*)?TRANSMISION|GUIA\s*(DE\s*)?CADENA\b)/, 'Transmisión'],
  [/^(FARO|STOP|DIRECCIONAL|VELOCIMETRO|CD[I1]\b|BOBINA|MAGNETO|RECTIFICADOR|REGULADOR|BATERIA|INST\b|INST\.|INSTALACION|KIT\s*(DE\s*)?(SWITCH|RUN)|SWITCH|FLASH|PITO|BOCINA|LUZ|SENSOR|BOYA|REL[EA]Y?\b|CONTROLADOR|CARGADOR|PARLANTE|EXPLORADORA|ECU\b|CABLE\s*(DE\s*)?VELOCI|BOTON|INTERRUPTOR|MOTOR\s*ELECTRICO|CONVERTIDOR|PUERTO)/, 'Sistema eléctrico'],
  [/^(TELESCOPICA|AMORTIGUADOR|MONOSHOCK|MESA\s*(DE\s*)?DIRECCION|MESA\s*(SUPERIOR|INFERIOR)|KIT\s*(DE\s*)?PISTAS|PISTAS?\s*(DE\s*)?DIRECCION|UNIBOLL|ROTULA|BRAZOS?\s*(DE\s*)?SUSPENSION|BUJES|KIT\s*(DE\s*)?RETENEDORES|COLUMNA\s*(DE\s*)?DIRECCION)/, 'Suspensión y dirección'],
  [/^(AROS?\b|LLANTAS?\b|NEUMATICO|RAYOS?\b|EJE\s*(DEL|POST|TRASERO|DELANTERO)|KIT\s*(DE\s*)?EJES|CAMARA|RIN\b|MANZANA)/, 'Ruedas'],
  [/^(ASIENTO|BASE\s*ASIENTO|TANQUE|GUARDAFANGO|GUARDALODO|PLACA|PORTA\s*PLACA|PARRILLA|ESTRIBO|OSCILANTE|PATA\b|MASCARILLA\s*COMP|PROTEC|CHASIS|SUBFRAME|PARABRISAS|EMBLEMA|ADHESIVO|TAPA\s*(DE\s*)?GASOLINA|LLAVE\s*(DE\s*)?GASOLINA|BAUL|CAJA\s*DE\s*HERRAMIENTAS|SLIDER|CRASHBAR|CUPULA|MALLA|LAMINA|CACHA|CARENAJE|CUBIERTA)/, 'Chasis y carrocería'],
  [/^(ESCAPE|SILENCIADOR|MOFLE|PUNTA\s*(DE\s*)?ESCAPE)/, 'Escape'],
  [/^(BOMBA\s*(DE\s*)?COMBUSTIBLE|CENTRIFUGO|KIT\s*(DE\s*)?DISTRIBUCION|TERMO?S?TATO|TERMOTOSTATO)/, 'Motor'],
  [/^(UNIBALL|BARRAS?\s*(DE\s*)?DIRECCION)/, 'Suspensión y dirección'],
  [/^(KIT\s*(DE\s*)?RINES)/, 'Ruedas'],
  [/^(ALARMA|APAGADOR)/, 'Sistema eléctrico'],
  [/^((TAPA\s*)?LATERAL|BOLSILLO|CANASTA|KIT\s*(DE\s*)?CROMADOS)/, 'Chasis y carrocería'],
  [/^(MANIGUETA|TIMON|MANUBRIO|CABLES?\s*(DE\s*)?(ACELERADOR|EMBRAGUE|AHOGADOR|FRENO|SET)|ESPEJO|RETROVISOR|PU[NÑ]O|APOYA\s*MANOS|CUBRE\s*MANOS|PESAS|ACELERADOR|PALANCA|COMANDO)/, 'Manubrio y mandos'],
];

/** Lo que el clasificador del catálogo de Meta pone donde un despiece no lo pondría. */
const ANTES: [RegExp, Sistema][] = [
  [/MANIGUETA|MANETA/, 'Manubrio y mandos'],
  [/PASTILLA\s*CALIBRACION|\bBALANCEADOR\b/, 'Motor'],
  [/\bARRANQUE\b|\bBENDIX\b/, 'Motor'],
  [/PI[NÑ]ON\s*VELOCIMETRO|RUEDA\s*FONICA/, 'Sistema eléctrico'],
  [/\bLUZ\b|\bLED\b|\bLUCES\b/, 'Sistema eléctrico'],
  [/CAJA\s*(DE\s*)?CAMBIO|SELECTOR|PEDAL\s*(DE\s*)?CAMBIO|PALANCA\s*(DE\s*)?CAMBIO|UNETAS|PATINETA|TAMBOR\s*(DE\s*)?CAMBIO|BANDA\s*(DE\s*)?TRANSMISION/, 'Transmisión'],
  [/DISCOS?\s*Y\s*SEPARADORES|BOMBA\s*(DE\s*)?GASOLINA|ESPARRAGO|KIT\s*MANGUERAS/, 'Motor'],
  [/KIT\s*(DE\s*)?TRACCION|ESTRELLA\s*(DE\s*)?CAMBIO/, 'Transmisión'],
  [/\bMESA\s*(SUPERIOR|INFERIOR)|BRAZOS?\s*(DE\s*)?SUSPENSION|BUJES\s*(DE\s*)?(SUSPENSION|DIRECC?ION)/, 'Suspensión y dirección'],
  [/\bCD[I1]\b|\bECU\b|CENTRALITA|CARGADOR|CONVERTIDOR|BREAKER|INDICADOR/, 'Sistema eléctrico'],
  [/\bCOMANDO\b/, 'Manubrio y mandos'],
  [/\bCABLE\b.*\b(ACELERADOR|EMBRAGUE|AHO|CHOKE|SET\d)|\bCABLE\s*(DE\s*)?FRENO/, 'Manubrio y mandos'],
  [/^(?!.*FARO).*\bMASCARILLA\b/, 'Chasis y carrocería'],
];

const POR_TIPO: Record<string, Sistema> = {
  Motor: 'Motor',
  Transmision: 'Transmisión',
  Frenos: 'Frenos',
  Suspension: 'Suspensión y dirección',
  Ruedas: 'Ruedas',
  Electrico: 'Sistema eléctrico',
  Carroceria: 'Chasis y carrocería',
  Escape: 'Escape',
  'Manubrio y mandos': 'Manubrio y mandos',
  'Accesorios del piloto': 'Accesorios',
};

/** Lo que el clasificador del catálogo deja en "Otros". */
const DESPUES: [RegExp, Sistema][] = [
  [/CARTER|BIELA|TENSOR|CADENILLA|BUJIA|DEPURADOR|TOMA\s*(DE\s*)?AIRE|ADMISION|PALILLO|\bMOTOR\b|\bCKD\b|\bTAPA\s*PI[NÑ]ON|ARBOL\s*(DE\s*)?LEVA|VENTILADOR|BOMBA\s*(DE\s*)?AGUA|TERMOSTATO|REFRIGERANTE|RESERVORIO|INYECCION/, 'Motor'],
  [/INSTALACION|INST\.?\s*ELECTRICA|\bRUN\b|BOTON|PITO|BOCINA|\bREL[EA]Y?\b|\bFLASH\b|CONTROLADOR|PARLANTE|\bUSB\b|ENCENDIDO|INTERRUPTOR|EXPLORADORA|PUERTO\s*(DE\s*)?CARGA|\bRADIO\b/, 'Sistema eléctrico'],
  [/TIMON|MANUBRIO|APOYA\s*MANOS|CUBRE\s*MANOS|CONTRAPESO|\bMANDO|\bPESAS\b|RETROVISOR/, 'Manubrio y mandos'],
  [/PISTAS?\s*(DE\s*)?DIRECCION|COLUMNA\s*(DE\s*)?DIRECCION|UNIBOLL|ROTULA|TRINCHE/, 'Suspensión y dirección'],
  [/\bEJES\b|\bRAYOS?\b/, 'Ruedas'],
  [/OSCILANTE|BASCULANTE|CHASIS|PATA\s*(DE\s*)?(APOYO|LAT|CENTRAL)|CABALLETE|PROTEC|GUARD|PARABRISAS|EMBLEMA|ADHESIVO|STICKER|CUBRE|SOPORTE|BASE|TAPON|SIMBRA|COLA|COLIN|AGARRADERA|ESPALDAR|APOYA\s*PIES|\bPISO\b|PLASTICO|SLIDER|CRASHBAR|SUBFRAME|TUBO|REFLECTIV|\bCAUCHOS?\b|LLAVE\s*(DE\s*)?GASOLINA|TAPA\s*(DE\s*)?GASOLINA|TAPA\s*VIN|PEDALES/, 'Chasis y carrocería'],
  [/DRYBAG|MOCHILA|RELOJ|COMPRESOR|GORRA|CASACA|ROMPETRAFICO|TRABAPERNOS|TOP\s*CASE|TABLET/, 'Accesorios'],
];

export function sistemaDe(nombre: string): Sistema {
  const n = normalizar(nombre).replace(/^[^A-Z0-9]+/, '');
  for (const [patron, sistema] of EXCEPCIONES) if (patron.test(n)) return sistema;
  for (const [patron, sistema] of INICIO) if (patron.test(n)) return sistema;
  for (const [patron, sistema] of ANTES) if (patron.test(n)) return sistema;
  const tipo = tipoPieza(n).split(' > ')[0];
  if (POR_TIPO[tipo]) return POR_TIPO[tipo];
  for (const [patron, sistema] of DESPUES) if (patron.test(n)) return sistema;
  return 'Otros';
}


// --- Secciones anteriores ----------------------------------------------------

/**
 * Las secciones que tenía el catálogo antes de usar los sistemas del despiece.
 * Siguen vivas en enlaces compartidos y anuncios (`?seccion=Motor e Internos`).
 */
const SECCIONES_ANTERIORES: Record<string, Sistema> = {
  'Motor e Internos': 'Motor',
  'Sistema Eléctrico': 'Sistema eléctrico',
  'Sistema de Frenos': 'Frenos',
  'Chasis y Suspensión': 'Suspensión y dirección',
  'Carrocería y Plásticos': 'Chasis y carrocería',
  'Ruedas y Ejes': 'Ruedas',
  'Cables y Mandos': 'Manubrio y mandos',
  'Filtros y Mantenimiento': 'Motor',
  'Otros Repuestos': 'Otros',
};

/** El sistema que pide un enlace (`?seccion=`), o 'Todos' si no es ninguno. */
export const sistemaDeEnlace = (seccion: string | null | undefined): Sistema | 'Todos' => {
  if (!seccion) return 'Todos';
  if ((SISTEMAS as readonly string[]).includes(seccion)) return seccion as Sistema;
  return SECCIONES_ANTERIORES[seccion] ?? 'Todos';
};
