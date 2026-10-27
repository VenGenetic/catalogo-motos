import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sitemapYFeed } from './vite/sitemapYFeed'

// https://vite.dev/config/
export default defineConfig({
  // sitemapYFeed: sitemap.xml y el feed de Google Merchant en cada build (ver vite/sitemapYFeed.ts).
  plugins: [react(), sitemapYFeed()],
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
})
