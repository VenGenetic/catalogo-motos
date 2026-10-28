import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/*
  En producción `api/catalogo.js` es una función de Vercel. En `npm run dev`
  la sirve este mismo servidor, con las variables del .env.
*/
const apiCatalogoLocal = (mode: string): Plugin => ({
  name: 'api-catalogo-local',
  configureServer(server) {
    // Desde la carpeta del .env de Vite, no desde donde se lanzó el proceso.
    const env = loadEnv(mode, server.config.envDir || server.config.root, '')
    for (const clave of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']) {
      if (env[clave] && !process.env[clave]) process.env[clave] = env[clave]
    }
    server.middlewares.use('/api/catalogo', async (req, res) => {
      const { default: atender } = await server.ssrLoadModule('/api/catalogo.js')
      await atender(req, res)
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), apiCatalogoLocal(mode)],
  build: {
    // Keep lazy chunks parseable on iPhones that still run Safari 13-15.
    target: ['es2018', 'safari13'],
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
}))
