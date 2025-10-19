import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  base: '/ImagesToSatisfactoryBlueprints/',
  plugins: [vue(), nodePolyfills()],
  build: {
    commonjsOptions: {
      include: [/node_modules/, /@etothepii/],
    },
  },
})
