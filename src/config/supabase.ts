import { PostgrestClient } from '@supabase/postgrest-js';

/*
  Sólo el cliente de consultas (PostgREST), no `@supabase/supabase-js` entero.

  El catálogo nada más lee repuestos (`select`) y guarda el clic del anuncio
  (`insert`). supabase-js trae además el login, Realtime, Storage y Edge
  Functions, que aquí no se usan y pesaban ~40 kB comprimidos en el archivo que
  todo visitante baja antes de ver algo. Las consultas son las mismas: la misma
  URL `/rest/v1`, las mismas cabeceras `apikey` y `Authorization`, y los mismos
  reintentos automáticos de postgrest-js.
*/

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase credentials are missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel.');
}

const clave = supabaseAnonKey || 'placeholder-key';

export const supabase = new PostgrestClient(`${(supabaseUrl || 'https://placeholder.supabase.co').replace(/\/$/, '')}/rest/v1`, {
  headers: {
    apikey: clave,
    Authorization: `Bearer ${clave}`,
  },
});
