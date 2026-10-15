// src/config/constants.ts

export const APP_CONFIG = {
  WHATSAPP_NUMBER: "593993279707",
  ITEMS_PER_PAGE: 30, 
  LOCAL_STORAGE_KEY_FAVS: 'loveDaytonaFavs',
};

export const ORDEN_SECCIONES = [
  'Todos', 
  'Motor e Internos', 'Transmisión', 'Sistema Eléctrico', 'Sistema de Frenos', 
  'Chasis y Suspensión', 'Carrocería y Plásticos', 'Ruedas y Ejes', 
  'Cables y Mandos', 'Filtros y Mantenimiento', 'Otros Repuestos'
];

/*
  Motos del filtro. `id` es la moto en src/utils/despiece.ts y va en la
  dirección (/catalogo/wolf-250): elegir "Wolf 250" muestra sólo lo que le
  sirve a la Wolf 250, no todo lo que dice "Wolf" (Super Wolf, Wolf 200,
  Wolf Evolution). Las versiones que comparten las mismas piezas van juntas.
*/
export const MODELOS_CATALOGO: { nombre: string; id: string }[] = [
  // Utilitarias
  { nombre: 'Workforce 150 CC (S / Anniversary)', id: 'workforce-150' },
  { nombre: 'Delta 150 CC', id: 'delta-150' },
  { nombre: 'Crucero 150 CC', id: 'crucero-150' },
  { nombre: 'Spitfire 150 CC', id: 'spitfire-150' },
  { nombre: 'Crucero 200 CC', id: 'crucero-200' },
  // Caballito
  { nombre: 'CX7 Evo / Pro 125 CC', id: 'cx7-125' },
  { nombre: 'TANQ 125 CC', id: 'tanq-125' },
  // Scooters
  { nombre: 'BIT 125 CC', id: 'bit-125' },
  { nombre: 'Dynamic Pro 150 CC', id: 'dynamic-pro-150' },
  { nombre: 'S1 150 CC', id: 's1-150' },
  { nombre: 'S1 Adventure 180 CC', id: 's1-adventure-180' },
  { nombre: 'S1 180 Crossover', id: 's1-crossover-180' },
  { nombre: 'Agility-X 180 CC', id: 'agility-x-180' },
  // Deportivas
  { nombre: 'Wing Evo 2 200 CC', id: 'wing-evo-2' },
  { nombre: 'GTR 200 CC', id: 'gtr-200' },
  { nombre: 'GTR Roadster 200 CC', id: 'gtr-roadster-200' },
  { nombre: 'Predator 200 CC', id: 'predator-200' },
  { nombre: 'Spitfire 250 CC', id: 'spitfire-250' },
  { nombre: 'Crossfire 250 CC', id: 'crossfire-250' },
  { nombre: 'Wolf 250 CC', id: 'wolf-250' },
  { nombre: 'Wolf Evolution 250 CC', id: 'wolf-evolution-250' },
  { nombre: 'GP1 250 CC', id: 'gp1-250' },
  { nombre: 'Xpower 250 CC', id: 'xpower-250' },
  { nombre: 'GP1 R 250 CC', id: 'gp1-r-250' },
  { nombre: 'Feroce 250 CC', id: 'feroce-250' },
  { nombre: 'Super Wolf 300 CC', id: 'super-wolf-300' },
  { nombre: 'GP1 S 300 CC', id: 'gp1-s-300' },
  { nombre: 'GP1 RR 370 CC', id: 'gp1-rr-370' },
  // Doble Propósito
  { nombre: 'Montana 150 CC', id: 'montana-150' },
  { nombre: 'Shark 1 200 CC', id: 'shark-1-200' },
  { nombre: 'Shark 2 200 CC', id: 'shark-2-200' },
  { nombre: 'Shark 3 200 CC', id: 'shark-3-200' },
  { nombre: 'Force DS 200 CC', id: 'force-ds-200' },
  { nombre: 'Tekken Evo 250 CC', id: 'tekken-evo-250' },
  { nombre: 'Arctic 250 CC', id: 'arctic-250' },
  { nombre: 'Adventure 300 CC', id: 'adventure-300' },
  { nombre: 'Adventure R 250 / 300 CC', id: 'adventure-300r' },
  { nombre: 'Everest 300 CC (Off Road / Dual Sport)', id: 'everest-300' },
  { nombre: 'Tekken Discovery 300 CC', id: 'tekken-discovery-300' },
  { nombre: 'Xpedition 300 CC', id: 'xpedition-300' },
  { nombre: 'Terrex 300 CC', id: 'terrex-300' },
  // Enduro
  { nombre: 'Eagle 3 150 CC', id: 'eagle-150' },
  { nombre: 'Eagle 5 150 CC', id: 'eagle-5-150' },
  { nombre: 'Eagle Z 200 CC', id: 'eagle-z-200' },
  { nombre: 'Scorpion 200 / 250 CC', id: 'scorpion-200-250' },
  // Clásicas
  { nombre: 'Cafe Racer 170 CC', id: 'cafe-racer-170' },
  { nombre: 'Commander 200 CC', id: 'commander-200' },
  { nombre: 'Scrambler Revolution 250 CC', id: 'scrambler-250' },
  { nombre: 'Scrambler Max 300 CC', id: 'scrambler-max-300' },
  // Cuadrón
  { nombre: 'Hunter 4 200 CC', id: 'hunter-200' },
  // Modelos anteriores que siguen rodando
  { nombre: 'Tekken 250 CC (anterior)', id: 'tekken-250' },
  { nombre: 'Wolf 200 CC (anterior)', id: 'wolf-200' },
  { nombre: 'Wing Evo 200 CC (anterior)', id: 'wing-evo-200' },
  { nombre: 'Adventure 200 CC (anterior)', id: 'adventure-200' },
  { nombre: 'Eagle 4 150 CC (anterior)', id: 'eagle-4-150' },
  { nombre: 'Agility 180 CC (anterior)', id: 'agility-180' },
];

/** El nombre de la moto elegida; las direcciones viejas (/catalogo/Wolf) se muestran tal cual. */
export const nombreDeModelo = (filtro: string) => MODELOS_CATALOGO.find(m => m.id === filtro)?.nombre ?? filtro;