// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/ImagesToSatisfactoryBlueprints/',
  plugins: [vue()],
  optimizeDeps: {
    include: ['@etothepii/satisfactory-file-parser']
  },
  build: {
    commonjsOptions: {
      include: [/@etothepii/, /node_modules/]
    }
  }
})
