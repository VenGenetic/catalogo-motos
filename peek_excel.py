import pandas as pd

file_path = r"C:\Users\ASUS\Documents\catalogo-motos-main\catalogo-motos\precios_con_nombres.xlsx"
df = pd.read_excel(file_path)
print("Columns:", df.columns.tolist())
print("\nPrecio (1 Unidad) data:")
print(df['Precio (1 Unidad)'].head(20))
print("\nTypes:")
print(df['Precio (1 Unidad)'].apply(type).value_counts())
