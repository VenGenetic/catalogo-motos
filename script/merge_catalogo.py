import pandas as pd
import os

# Define file paths
TEMPLATE_PATH = r'C:\Users\ASUS\Documents\catalogo-motos-main\catalogo-motos\script\plantilla_catalogo_vendor.xlsx'
PRICELIST_PATH = r'C:\Users\ASUS\Documents\catalogo-motos-main\catalogo-motos\script\PVP DAYTONA AXXO MARZ 2026 (2).xlsx'
OUTPUT_PATH = r'C:\Users\ASUS\Documents\catalogo-motos-main\catalogo-motos\script\catalogo_actualizado.xlsx'

def merge_catalogs():
    print("Loading template...")
    # Template has header at row 0, codes are in 'SKU'
    df_template = pd.read_excel(TEMPLATE_PATH)
    skus = df_template[['SKU']].drop_duplicates()
    print(f"Loaded {len(skus)} unique SKUs from template.")

    print("Loading price list...")
    # Price list has headers at row 4 (0-indexed)
    df_prices = pd.read_excel(PRICELIST_PATH, header=4)
    
    # Clean column names just in case there are leading/trailing spaces
    df_prices.columns = df_prices.columns.str.strip()
    
    # We need CODIGO, DESCRIPCION, COSTO S/I, FECHA
    # Note: my research saw 'DESCRIPCION ' with a space, but I'm stripping it now.
    required_cols = ['CODIGO', 'DESCRIPCION', 'COSTO S/I', 'FECHA']
    for col in required_cols:
        if col not in df_prices.columns:
            print(f"Warning: Column '{col}' not found in price list. Available: {df_prices.columns.tolist()}")

    # Filter out rows with null CODIGO
    df_prices = df_prices.dropna(subset=['CODIGO'])
    
    # Convert FECHA to datetime
    print("Converting dates...")
    df_prices['FECHA'] = pd.to_datetime(df_prices['FECHA'], errors='coerce')
    
    # Drop rows with invalid dates if any
    df_prices = df_prices.dropna(subset=['FECHA'])
    
    # Sort by CODIGO and FECHA (descending) to get the latest first
    print("Sorting and finding latest prices...")
    df_prices = df_prices.sort_values(by=['CODIGO', 'FECHA'], ascending=[True, False])
    
    # Keep only the first record for each unique CODIGO (which is the latest due to sort)
    df_latest_prices = df_prices.drop_duplicates(subset=['CODIGO'], keep='first')
    
    print(f"Found {len(df_latest_prices)} unique products in price list.")

    # Merge template SKUs with latest prices
    print("Merging data...")
    result = pd.merge(
        skus, 
        df_latest_prices[['CODIGO', 'DESCRIPCION', 'COSTO S/I']], 
        left_on='SKU', 
        right_on='CODIGO', 
        how='left'
    )
    
    # Final cleanup: keep only CODIGO (from SKU), DESCRIPCION, COSTO S/I
    # We'll use the SKU from template as the primary CODIGO
    result_final = result[['SKU', 'DESCRIPCION', 'COSTO S/I']].copy()
    result_final.columns = ['CODIGO', 'DESCRIPCION', 'COSTO S/I']

    print(f"Saving result to {OUTPUT_PATH}...")
    result_final.to_excel(OUTPUT_PATH, index=False)
    print("Success!")

if __name__ == "__main__":
    if not os.path.exists(TEMPLATE_PATH):
        print(f"Error: Template file not found at {TEMPLATE_PATH}")
    elif not os.path.exists(PRICELIST_PATH):
        print(f"Error: Price list file not found at {PRICELIST_PATH}")
    else:
        merge_catalogs()
