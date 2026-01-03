// src/config/constants.ts

export const APP_CONFIG = {
  WHATSAPP_NUMBER: "593993279707",
  ITEMS_PER_PAGE: 30, // Puedes ajustar esto según prefieras (en App.tsx original decía 20)
  LOCAL_STORAGE_KEY_FAVS: 'loveDaytonaFavs',
};

export const ORDEN_SECCIONES = [
  'Todos', // Agregamos 'Todos' al inicio para el filtro
  'Motor e Internos', 'Transmisión', 'Sistema Eléctrico', 'Sistema de Frenos', 
  'Chasis y Suspensión', 'Carrocería y Plásticos', 'Ruedas y Ejes', 
  'Cables y Mandos', 'Filtros y Mantenimiento', 'Otros Repuestos'
];

// Movemos la lista gigante aquí
export const MODELOS = [
  "Tekken", "Tekken Evo", "Axxo Tracker", "DK Nativa", "Scrambler", "Scrambler Clasica", 
  "Scrambler Revolution", "Axxo Scrambler", "Scorpion", "Axxo TRX", "TH Mig25", "DK250-D Sport",
  "Bull", "Shark", "Shark II", "Shark III", "Maverick", "Wolf", "Adventure", "Adventure R 250", 
  "Adventure 200", "Hunter", "GP1", "Tundra Veloce", "Thunder Veloce", "Crossfire", "Xtreem", 
  "Thunder F16", "DK Hornet", "IGM Wind", "Z1 V8200", "Tundra Ghost", "Axxo Asfalt", "Axxo F51",
  "Ranger CFZ", "Honda CB190", "Honda CB1", "Force", "DK XTZ", "Axxo TR1", "DK200B", "SHM Armi150",
  "Axxo Viper", "Ranger 150BWSM", "Bultaco Storm", "Z1 Super", "Sukida Joy", "Agility", "Agility X",
  "Boneville", "Axxo Milano", "Bultaco Freedom", "Tanq", "Dynamic", "Dynamic Pro", "SHM Jedi",
  "Feroce", "Predator", "Elvissa", "Viper", "CX7", "Comander", "Crucero", "Spitfire", "Delta", 
  "Montana", "Workforce", "GTR", "Panther", "Cafe Racer", "Eagle", "Speed", "Everest",
  "Wing Evo", "Wing Evo 200", "Wing Evo 2", "Scooter Evo 2 180", "S1", "S1 Adv", "S1 Crossover 180"
];

// Mantenemos los fijos si los usabas para algo específico, o puedes borrarlos si ya no los necesitas
export const MODELOS_FIJOS = [
  "Tekken", "Crucero", "Spitfire", "Shark", "Adventure", 
  "GP1R", "Delta", "Wing Evo", "Montana", "Scorpion", "Workforce"
];