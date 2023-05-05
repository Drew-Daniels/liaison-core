import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'LiaisonCore',
      fileName: 'index',
      formats: ['es']
    },
  },
  cacheDir: '.vite'
})
