-- Activar Row Level Security en la tabla products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública (anon)
-- Permite que cualquier persona (incluido el frontend) pueda leer los productos
CREATE POLICY "public_read"
ON public.products
FOR SELECT
TO anon
USING (true);

-- Política de escritura mediante service_role (solo backend / ERP)
-- Permite que los scripts con la clave service_role puedan insertar, actualizar o borrar
CREATE POLICY "service_write"
ON public.products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
