import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl.includes('tu-proyecto') || 
  supabaseAnonKey.includes('tu-anon-key');

if (isPlaceholder) {
  console.warn('⚠️ Supabase credentials are missing or configured as placeholders. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Inicializar el cliente (evita crasheos de inicialización si son placeholders)
export const supabase = createClient(
  isPlaceholder ? 'https://placeholder.supabase.co' : supabaseUrl, 
  isPlaceholder ? 'placeholder-key' : supabaseAnonKey
);
