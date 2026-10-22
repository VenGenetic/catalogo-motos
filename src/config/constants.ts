// src/config/constants.ts
import { SISTEMAS } from '../utils/sistemas';

export const APP_CONFIG = {
  WHATSAPP_NUMBER: "593993279707",
  /** La dirección pública del catálogo, para los enlaces que salen a WhatsApp. */
  SITE_URL: 'https://www.lvparts.ec',
  ITEMS_PER_PAGE: 30,
  LOCAL_STORAGE_KEY_FAVS: 'loveDaytonaFavs',
};

/** Los filtros por sistema: los mismos del despiece del ERP (utils/sistemas.ts). */
export const ORDEN_SECCIONES: string[] = ['Todos', ...SISTEMAS];

export const GRUPOS_MOTO = [
  'Trabajo', 'Caballito', 'Scooters', 'Deportivas', 'Doble propósito', 'Enduro', 'Clásicas', 'Cuadrón', 'Modelos anteriores',
] as const;
export type GrupoMoto = typeof GRUPOS_MOTO[number];

/*
  Motos del filtro. `id` es la moto en src/utils/despiece.ts y va en la
  dirección (/catalogo/wolf-250): elegir "Wolf 250" muestra sólo lo que le
  sirve a la Wolf 250, no todo lo que dice "Wolf" (Super Wolf, Wolf 200,
  Wolf Evolution). Las versiones que comparten las mismas piezas van juntas.
*/
export const MODELOS_CATALOGO: { nombre: string; id: string; grupo: GrupoMoto }[] = [
  { nombre: 'Workforce 150 CC (S / Anniversary)', id: 'workforce-150', grupo: 'Trabajo' },
  { nombre: 'Delta 150 CC', id: 'delta-150', grupo: 'Trabajo' },
  { nombre: 'Crucero 150 CC', id: 'crucero-150', grupo: 'Trabajo' },
  { nombre: 'Spitfire 150 CC', id: 'spitfire-150', grupo: 'Trabajo' },
  { nombre: 'Crucero 200 CC', id: 'crucero-200', grupo: 'Trabajo' },
  { nombre: 'CX7 Evo / Pro 125 CC', id: 'cx7-125', grupo: 'Caballito' },
  { nombre: 'TANQ 125 CC', id: 'tanq-125', grupo: 'Caballito' },
  { nombre: 'BIT 125 CC', id: 'bit-125', grupo: 'Scooters' },
  { nombre: 'Dynamic Pro 150 CC', id: 'dynamic-pro-150', grupo: 'Scooters' },
  { nombre: 'S1 150 CC', id: 's1-150', grupo: 'Scooters' },
  { nombre: 'S1 Adventure 180 CC', id: 's1-adventure-180', grupo: 'Scooters' },
  { nombre: 'S1 180 Crossover', id: 's1-crossover-180', grupo: 'Scooters' },
  { nombre: 'Agility-X 180 CC', id: 'agility-x-180', grupo: 'Scooters' },
  { nombre: 'Wing Evo 2 200 CC', id: 'wing-evo-2', grupo: 'Deportivas' },
  { nombre: 'GTR 200 CC', id: 'gtr-200', grupo: 'Deportivas' },
  { nombre: 'GTR Roadster 200 CC', id: 'gtr-roadster-200', grupo: 'Deportivas' },
  { nombre: 'Predator 200 CC', id: 'predator-200', grupo: 'Deportivas' },
  { nombre: 'Spitfire 250 CC', id: 'spitfire-250', grupo: 'Deportivas' },
  { nombre: 'Crossfire 250 CC', id: 'crossfire-250', grupo: 'Deportivas' },
  { nombre: 'Wolf 250 CC', id: 'wolf-250', grupo: 'Deportivas' },
  { nombre: 'Wolf Evolution 250 CC', id: 'wolf-evolution-250', grupo: 'Deportivas' },
  { nombre: 'GP1 250 CC', id: 'gp1-250', grupo: 'Deportivas' },
  { nombre: 'Xpower 250 CC', id: 'xpower-250', grupo: 'Deportivas' },
  { nombre: 'GP1 R 250 CC', id: 'gp1-r-250', grupo: 'Deportivas' },
  { nombre: 'Feroce 250 CC', id: 'feroce-250', grupo: 'Deportivas' },
  { nombre: 'Super Wolf 300 CC', id: 'super-wolf-300', grupo: 'Deportivas' },
  { nombre: 'GP1 S 300 CC', id: 'gp1-s-300', grupo: 'Deportivas' },
  { nombre: 'GP1 RR 370 CC', id: 'gp1-rr-370', grupo: 'Deportivas' },
  { nombre: 'Montana 150 CC', id: 'montana-150', grupo: 'Doble propósito' },
  { nombre: 'Shark 1 200 CC', id: 'shark-1-200', grupo: 'Doble propósito' },
  { nombre: 'Shark 2 200 CC', id: 'shark-2-200', grupo: 'Doble propósito' },
  { nombre: 'Shark 3 200 CC', id: 'shark-3-200', grupo: 'Doble propósito' },
  { nombre: 'Force DS 200 CC', id: 'force-ds-200', grupo: 'Doble propósito' },
  { nombre: 'Tekken Evo 250 CC', id: 'tekken-evo-250', grupo: 'Doble propósito' },
  { nombre: 'Arctic 250 CC', id: 'arctic-250', grupo: 'Doble propósito' },
  { nombre: 'Adventure 300 CC', id: 'adventure-300', grupo: 'Doble propósito' },
  { nombre: 'Adventure R 250 / 300 CC', id: 'adventure-300r', grupo: 'Doble propósito' },
  { nombre: 'Everest 300 CC (Off Road / Dual Sport)', id: 'everest-300', grupo: 'Doble propósito' },
  { nombre: 'Tekken Discovery 300 CC', id: 'tekken-discovery-300', grupo: 'Doble propósito' },
  { nombre: 'Xpedition 300 CC', id: 'xpedition-300', grupo: 'Doble propósito' },
  { nombre: 'Terrex 300 CC', id: 'terrex-300', grupo: 'Doble propósito' },
  { nombre: 'Eagle 3 150 CC', id: 'eagle-150', grupo: 'Enduro' },
  { nombre: 'Eagle 5 150 CC', id: 'eagle-5-150', grupo: 'Enduro' },
  { nombre: 'Eagle Z 200 CC', id: 'eagle-z-200', grupo: 'Enduro' },
  { nombre: 'Scorpion 200 / 250 CC', id: 'scorpion-200-250', grupo: 'Enduro' },
  { nombre: 'Cafe Racer 170 CC', id: 'cafe-racer-170', grupo: 'Clásicas' },
  { nombre: 'Commander 200 CC', id: 'commander-200', grupo: 'Clásicas' },
  { nombre: 'Scrambler Revolution 250 CC', id: 'scrambler-250', grupo: 'Clásicas' },
  { nombre: 'Scrambler Max 300 CC', id: 'scrambler-max-300', grupo: 'Clásicas' },
  { nombre: 'Hunter 4 200 CC', id: 'hunter-200', grupo: 'Cuadrón' },
  // Modelos anteriores que siguen rodando
  { nombre: 'Tekken 250 CC (anterior)', id: 'tekken-250', grupo: 'Modelos anteriores' },
  { nombre: 'Wolf 200 CC (anterior)', id: 'wolf-200', grupo: 'Modelos anteriores' },
  { nombre: 'Wing Evo 200 CC (anterior)', id: 'wing-evo-200', grupo: 'Modelos anteriores' },
  { nombre: 'Adventure 200 CC (anterior)', id: 'adventure-200', grupo: 'Modelos anteriores' },
  { nombre: 'Eagle 4 150 CC (anterior)', id: 'eagle-4-150', grupo: 'Modelos anteriores' },
  { nombre: 'Agility 180 CC (anterior)', id: 'agility-180', grupo: 'Modelos anteriores' },
];

/** Las que se muestran primero en el inicio y en el selector. */
export const MOTOS_POPULARES = [
  'workforce-150', 'crucero-200', 'wing-evo-2', 'tekken-evo-250', 'gp1-250', 'shark-3-200', 's1-adventure-180', 'wolf-250',
];

/**
 * El nombre de una moto para el cliente: el del filtro si está en él; si no,
 * el del despiece (las motos que sólo aparecen en "Sirve para"). Las
 * direcciones viejas (/catalogo/Wolf) se muestran tal cual.
 */
export const nombreDeModelo = (id: string, despiece?: { modeloPorId: (id: string) => { nombre: string } | undefined } | null) =>
  MODELOS_CATALOGO.find(m => m.id === id)?.nombre ?? despiece?.modeloPorId(id)?.nombre ?? id;

/*
  Lo que el cliente debe confirmar antes de comprar piezas de una moto. Es el
  `aviso` de cada modelo del despiece, que está escrito para el vendedor
  ("confirma con el cliente"), dicho al cliente.
*/
export const AVISOS_CLIENTE: Record<string, string> = {
  'gp1-250': 'La GP1 250 tuvo dos motores: el de 2 válvulas (2017-2018) y el de 4 válvulas (desde 2023). Para piezas de motor, dinos el año de tu moto.',
  'xpower-250': 'La XPower tuvo motor de 2 válvulas (2019-2022) y después uno de 4 válvulas. Para piezas de motor, dinos el año de tu moto.',
  'tekken-250': 'Hay dos Tekken 250: la anterior (2 válvulas) y la Evo. Revisa cuál tienes antes de pedir.',
  'shark-250': 'Hubo Shark 250 de las tres generaciones (I, II y III), cada una con su carrocería. Dinos cuál tienes antes de pedir faros, tanque, placas o guardafangos.',
  'scrambler-max-300': 'Hay piezas de motor de dos versiones de esta moto. Escríbenos con el año de tu moto y te confirmamos.',
};
