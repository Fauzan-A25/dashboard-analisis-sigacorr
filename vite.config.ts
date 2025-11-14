// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { resolve } from 'path'

export default defineConfig({
  base: '/dashboard-analisis-sigacorr/',   // Sesuai repo GitHub Pages
  plugins: [react()],

  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }]
  },

  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    },
    include: [
      'echarts',
      'echarts-for-react',
      'd3-scale'
    ]
  },

  build: {
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      // 🔥 Fix utama agar GitHub Pages bisa handle refresh route
      input: {
        main: resolve(__dirname, 'index.html')
      },

      output: {
        manualChunks: {
          echarts: ['echarts', 'echarts-for-react']
        }
      }
    }
  }
})
