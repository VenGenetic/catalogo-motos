// src/config/motoImages.ts

export const getMotoImage = (modelName: string) => {
  // 1. DICCIONARIO DE EXCEPCIONES
  // Aquí ponemos los modelos cuyo nombre en la lista no coincide con el nombre del archivo
  const specialNames: Record<string, string> = {
    "TANQ 125 CC": "tank-125-cc.webp", // La moto se llama TANQ, pero la foto es tank...
    
    // Si encuentras otra que no carga, agrégala aquí siguiendo el ejemplo:
    // "Nombre En La Lista": "nombre-archivo.webp",
  };

  // 2. VERIFICACIÓN MANUAL
  // Si el modelo está en la lista de excepciones, usamos esa imagen específica
  if (specialNames[modelName]) {
    return `/modelos/${specialNames[modelName]}`;
  }

  // 3. LÓGICA AUTOMÁTICA (Para el 99% de los casos)
  // Convierte "Workforce S 150 CC" -> "workforce-s-150-cc.webp"
  // - Reemplaza espacios por guiones
  // - Convierte todo a minúsculas
  const cleanName = modelName.replace(/\s+/g, '-').toLowerCase(); 
  
  // Devuelve la ruta completa a la carpeta pública
  return `/modelos/${cleanName}.webp`; 
};