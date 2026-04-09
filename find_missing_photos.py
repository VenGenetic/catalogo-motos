import json
import os
from pathlib import Path

# Configuración de rutas
BASE_DIR = Path("c:/Users/ASUS/Documents/catalogo-motos-main/catalogo-motos")
DATA_FILES = [
    BASE_DIR / "public" / "data.json",
    BASE_DIR / "public" / "data_guayaquil.json"
]
IMAGES_DIR = BASE_DIR / "public" / "imagenes_repuestos"
OUTPUT_FILE = BASE_DIR / "repuestos_sin_foto_catalogo.txt"

# Placeholders de "sin imagen"
NO_IMAGE_PLACEHOLDERS = ["sin_imagen.jpg", "sin_imagen.webp"]

def get_products(file_path):
    """Carga los productos de un archivo JSON."""
    if not file_path.exists():
        print(f"Advertencia: No se encontró el archivo {file_path}")
        return []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Manejar diferentes estructuras posibles
            return data.get("RAW_SCRAPED_DATA", data.get("products", [] if not isinstance(data, list) else data))
    except Exception as e:
        print(f"Error cargando {file_path}: {e}")
        return []

def main():
    print("--- Iniciando búsqueda de productos sin foto ---")
    
    products_by_code = {}
    
    # Cargar todos los productos de todos los archivos
    for file_path in DATA_FILES:
        products = get_products(file_path)
        print(f"Analizando {file_path.name}: {len(products)} productos encontrados.")
        
        for p in products:
            code = p.get("codigo_referencia") or p.get("id")
            if not code:
                continue
            
            code = str(code).strip().upper()
            name = p.get("nombre") or "Sin nombre"
            image_val = p.get("imagen", "")
            
            # Guardamos el nombre más largo si hay duplicados
            if code not in products_by_code or len(name) > len(products_by_code[code]['name']):
                products_by_code[code] = {
                    'name': name,
                    'image_val': image_val
                }

    print(f"Productos únicos analizados: {len(products_by_code)}")
    
    missing = []
    
    for code, info in products_by_code.items():
        name = info['name']
        image_val = info['image_val']
        
        has_photo = True
        
        # Caso 1: El campo imagen es un placeholder explícito
        if any(placeholder in str(image_val).lower() for placeholder in NO_IMAGE_PLACEHOLDERS):
            has_photo = False
        
        # Caso 2: El campo imagen está vacío
        elif not image_val:
            has_photo = False
            
        # Caso 3: Es un nombre de archivo, verificar si existe localmente
        elif not str(image_val).startswith(("http://", "https://")):
            # Verificar el nombre tal cual viene en la data
            local_path = IMAGES_DIR / image_val
            # Y también verificar el patrón {cod}_cut.webp (estándar de la app)
            pattern_path = IMAGES_DIR / f"{code}.webp"
            
            if not local_path.exists() and not pattern_path.exists():
                has_photo = False
        
        # Caso 4 (Extra): Si es una URL externa, asumimos que TIENE foto (está en la web)
        # a menos que el usuario quiera descargarla localmente, pero aquí buscamos "no tiene foto"
        
        if not has_photo:
            missing.append(f"{code} - {name}")

    # Guardar resultados
    print(f"Productos sin foto detectados: {len(missing)}")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("\n".join(missing))
    
    print(f"\nResultados guardados en: {OUTPUT_FILE}")
    
    # Mostrar los primeros 10 para feedback rápido
    if missing:
        print("\nPrimeros 10 productos sin foto:")
        for line in missing[:10]:
            print(f" - {line}")
    else:
        print("\n¡Felicidades! Todos los productos tienen foto.")

if __name__ == "__main__":
    main()
