import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// Ganti base ke nama repo di Github
export default defineConfig({
  base: '/dashboard-analisis-sigacorr/', // tambahkan ini!
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }] 
 }
})
