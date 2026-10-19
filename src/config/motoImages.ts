// src/config/motoImages.ts

const imageByModelId: Record<string, string> = {
  'workforce-150': 'workforce-150-cc.webp', 'delta-150': 'delta-150-cc.webp',
  'crucero-150': 'crucero-150-cc.webp', 'crucero-200': 'crucero-200-cc.webp',
  'spitfire-150': 'spitfire-150-cc.webp', 'spitfire-250': 'spitfire-250-cc.webp',
  'cx7-125': 'cx7-pro-125.webp', 'tanq-125': 'tank-125-cc.webp',
  'bit-125': 'bit-125cc.webp', 'dynamic-pro-150': 'dynamic-pro-150-cc.webp',
  's1-150': 's1-150-cc.webp', 's1-adventure-180': 's1-adventure-180-cc.webp',
  's1-crossover-180': 's1-180-crossover.webp', 'agility-x-180': 'agility-x-180cc.webp',
  'wing-evo-2': 'wing-evo-2-200-cc.webp', 'gtr-200': 'gtr-200-cc.webp',
  'gtr-roadster-200': 'gtr-roadster-200cc.webp', 'predator-200': 'predator-200-cc.webp',
  'crossfire-250': 'crossfire-250-cc.webp', 'wolf-250': 'wolf-250-cc.webp',
  'wolf-evolution-250': 'wolf-evolution-250-cc.webp', 'gp1-250': 'gp1-250-cc.webp',
  'gp1-r-250': 'gp1-r-250cc.webp', 'xpower-250': 'xpower-250-cc.webp',
  'feroce-250': 'feroce-250cc.webp', 'super-wolf-300': 'super-wolf-300-cc.webp',
  'montana-150': 'montana-150cc.webp', 'shark-1-200': 'shark-1-200-cc.webp',
  'shark-2-200': 'shark-2-200-cc.webp', 'shark-3-200': 'shark-3-200cc.webp',
  'force-ds-200': 'force-ds-200cc.webp', 'tekken-evo-250': 'tekken-evo-250-cc.webp',
  'arctic-250': 'arctic-250-cc.webp', 'adventure-300': 'adventure-300-cc.webp',
  'adventure-300r': 'adventure-300r-cc.webp', 'everest-300': 'everest-off-road-300-cc.webp',
  'tekken-discovery-300': 'tekken-discovery-300-cc.webp', 'xpedition-300': 'xpedition-300-cc.webp',
  'eagle-150': 'eagle-3-150-cc.webp', 'eagle-5-150': 'eagle-5-150-cc.webp',
  'eagle-z-200': 'eagle-z-200-cc.webp', 'cafe-racer-170': 'cafe-racer-170-cc.webp',
  'commander-200': 'commander-200-cc.webp', 'scrambler-250': 'scrambler-revolution-250-cc.webp',
  'scrambler-max-300': 'scrambler-max-300-cc.webp', 'hunter-200': 'hunter-4-200-cc.webp', 'scorpion-200-250': 'scorpion-250-cc.webp',
};

export const getMotoImageById = (id: string): string | null => imageByModelId[id] ? `/modelos/${imageByModelId[id]}` : null;

export const getMotoImage = (modelName: string) => {
  const name = modelName.trim().toLowerCase();

  // 1. DICCIONARIO DE MAPEOS PARA LOS FILTROS (Por palabra clave inicial de la moto)
  const categoryMapping: Record<string, string> = {
    "crucero": "crucero-200-cc.webp",
    "wing": "wing-evo-2-200-cc.webp",
    "delta": "delta-150-cc.webp",
    "spitfire": "spitfire-150-cc.webp",
    "cx7": "cx7-pro-125.webp",
    "tanq": "tank-125-cc.webp",
    "work": "workforce-150-cc.webp",
    "workforce": "workforce-150-cc.webp",
    "wolf": "wolf-250-cc.webp",
    "tekken": "tekken-evo-250-cc.webp",
    "predator": "predator-200-cc.webp",
    "adventure": "adventure-300-cc.webp",
    "commander": "commander-200-cc.webp",
    "crossfire": "crossfire-250-cc.webp",
    "dynamic": "dynamic-pro-150-cc.webp",
    "eagle": "eagle-3-150-cc.webp",
    "everest": "everest-off-road-300-cc.webp",
    "feroce": "feroce-250cc.webp",
    "force": "force-ds-200cc.webp",
    "gp1": "gp1-250-cc.webp",
    "gtr": "gtr-200-cc.webp",
    "hunter": "hunter-4-200-cc.webp",
    "montana": "montana-150cc.webp",
    "s1": "s1-150-cc.webp",
    "scorpion": "scorpion-200-cc.webp",
    "scrambler": "scrambler-max-300-cc.webp",
    "shark": "shark-1-200-cc.webp",
    "xpedition": "xpedition-300-cc.webp",
    "xpower": "xpower-250-cc.webp",
    "agility": "agility-x-180cc.webp",
    "arctic": "arctic-250-cc.webp",
    "bit": "bit-125cc.webp",
    "cafe": "cafe-racer-170-cc.webp",
  };

  // Buscar si alguna palabra clave del filtro coincide al inicio
  for (const key in categoryMapping) {
    if (name.startsWith(key)) {
      return `/modelos/${categoryMapping[key]}`;
    }
  }

  // 2. DICCIONARIO DE EXCEPCIONES MANUALES
  const specialNames: Record<string, string> = {
    "tanq 125 cc": "tank-125-cc.webp",
  };

  if (specialNames[name]) {
    return `/modelos/${specialNames[name]}`;
  }

  // 3. RETORNO POR DEFECTO AUTOMÁTICO (Para nombres completos)
  const cleanName = name.replace(/\s+/g, '-');
  return `/modelos/${cleanName}.webp`; 
};
