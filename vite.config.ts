// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  base: '/dashboard-analisis-sigacorr/',
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }] 
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    },
    include: [
      'echarts',              // ✅ Keep - untuk map
      'echarts-for-react',    // ✅ Keep - untuk map
      'd3-scale'              // ✅ Keep - untuk calculations
    ]
    // ❌ REMOVE semua deck.gl references
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'echarts': ['echarts', 'echarts-for-react']  // ✅ Replace deck-gl chunk
        }
      }
    }
  }
})
