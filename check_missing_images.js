import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_Cuenca = path.join(__dirname, 'public', 'data.json');
const DATA_Guayaquil = path.join(__dirname, 'public', 'data_guayaquil.json');
const IMAGES_DIR = path.join(__dirname, 'public', 'imagenes_repuestos');
const OUTPUT_FILE = path.join(__dirname, 'imagenes_faltantes.txt');

function getProducts(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    return data.RAW_SCRAPED_DATA || data.products || (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error(`Error leyendo ${filePath}:`, error.message);
    return [];
  }
}

function checkImages() {
  console.log('--- Iniciando verificación de imágenes ---');
  
  const productsCuenca = getProducts(DATA_Cuenca);
  const productsGuayaquil = getProducts(DATA_Guayaquil);
  
  // Combinar productos y mapear códigos a nombres
  const allProducts = [...productsCuenca, ...productsGuayaquil];
  const codeToName = new Map();
  
  allProducts.forEach(p => {
    if (p.codigo_referencia) {
      const code = p.codigo_referencia.trim().toUpperCase();
      // Guardar el nombre más largo o el primero encontrado
      if (!codeToName.has(code) || (p.nombre && p.nombre.length > codeToName.get(code).length)) {
        codeToName.set(code, p.nombre || 'Sin nombre');
      }
    }
  });

  console.log(`Productos totales analizados: ${allProducts.length}`);
  console.log(`Códigos de referencia únicos: ${codeToName.size}`);

  const missing = [];
  const existing = [];

  for (const [code, name] of codeToName.entries()) {
    const filename = `${code}_cut.webp`;
    const fullPath = path.join(IMAGES_DIR, filename);
    
    if (!fs.existsSync(fullPath)) {
      missing.push({ code, name });
    } else {
      existing.push({ code, name });
    }
  }

  console.log(`Imágenes encontradas: ${existing.length}`);
  console.log(`Imágenes FALTANTES: ${missing.length}`);

  if (missing.length > 0) {
    const outputContent = missing.map(m => `${m.code} - ${m.name}`).join('\n');
    fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');
    console.log(`\nLista de códigos y nombres faltantes guardada en: ${OUTPUT_FILE}`);
    console.log('\nPrimeros 10 faltantes:');
    missing.slice(0, 10).forEach(m => console.log(`${m.code}: ${m.name}`));
  } else {
    console.log('\n¡No faltan imágenes! Todas las referencias tienen su archivo correspondiente.');
  }
  
  console.log('\n--- Verificación completada ---');
}

checkImages();
