import pandas as pd
import math
import json
import os

def convert_excel_to_json(input_file, output_file):
    try:
        # Read Excel file
        df = pd.read_excel(input_file)
        
        # Verify columns exist
        required_columns = ['Codigo', 'Nombre', 'Precio (1 Unidad)']
        for col in required_columns:
            if col not in df.columns:
                print(f"Error: Column '{col}' not found in Excel file.")
                return

        # Prepare JSON data
        data_json = []
        for _, row in df.iterrows():
            try:
                price_str = str(row['Precio (1 Unidad)'])
                # Remove '$', spaces and replace ',' with '.'
                cleaned_price = price_str.replace('$', '').replace(' ', '').replace(',', '.')
                original_price = float(cleaned_price)
                
                # Multiplied by 1.9 and rounded up
                new_price = math.ceil(original_price * 1.9)
                
                item = {
                    "id": str(row['Codigo']),
                    "codigo_referencia": str(row['Codigo']),
                    "nombre": str(row['Nombre']),
                    "marca": "DAYTONA",
                    "precio": new_price,
                    "categoria": "General",
                    "imagen": "sin_imagen.jpg",
                    "stock": True
                }
                data_json.append(item)
            except (ValueError, TypeError) as e:
                # print(f"Skipping row with error: {e} | value: {row['Precio (1 Unidad)']}")
                continue

        # Save to JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data_json, f, indent=4, ensure_ascii=False)
            
        print(f"Successfully converted {input_file} to {output_file}")
        print(f"Total items: {len(data_json)}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    input_path = r"C:\Users\ASUS\Documents\catalogo-motos-main\catalogo-motos\precios_con_nombres.xlsx"
    output_path = r"C:\Users\ASUS\Documents\catalogo-motos-main\catalogo-motos\public\precios_nuevos.json"
    
    # Ensure output directory exists (public folder)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    convert_excel_to_json(input_path, output_path)
