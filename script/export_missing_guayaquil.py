import json
import pandas as pd
import os

def create_missing_report():
    # Paths
    data_path = os.path.join('public', 'data.json')
    guayaquil_path = os.path.join('public', 'data_guayaquil.json')
    output_path = os.path.join('public', 'faltantes_guayaquil.xlsx')

    print(f"Reading {data_path}...")
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Reading {guayaquil_path}...")
    with open(guayaquil_path, 'r', encoding='utf-8') as f:
        data_guayaquil = json.load(f)

    # Extract lists
    items_all = data.get('RAW_SCRAPED_DATA', [])
    items_guayaquil = data_guayaquil.get('RAW_SCRAPED_DATA', [])

    # Get set of IDs in Guayaquil for fast lookup
    guayaquil_ids = {item.get('id') for item in items_guayaquil if item.get('id')}
    
    print(f"Total items in data.json: {len(items_all)}")
    print(f"Total items in data_guayaquil.json: {len(items_guayaquil)}")

    # Find items in data.json but not in data_guayaquil.json
    missing_items = []
    for item in items_all:
        item_id = item.get('id')
        if item_id and item_id not in guayaquil_ids:
            missing_items.append({
                'codigo': item_id,
                'nombre': item.get('nombre', ''),
                'precio': item.get('precio', 0)
            })

    print(f"Found {len(missing_items)} missing items.")

    if missing_items:
        # Create DataFrame and Export to Excel
        df = pd.DataFrame(missing_items)
        print(f"Exporting to {output_path}...")
        df.to_excel(output_path, index=False)
        print("Success!")
    else:
        print("No missing items found.")

if __name__ == "__main__":
    try:
        create_missing_report()
    except Exception as e:
        print(f"An error occurred: {e}")
