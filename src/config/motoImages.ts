// src/config/motoImages.ts

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