import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
// plugins: [visualizer(), react()],
plugins: [react()],
build: {
    chunkSizeWarningLimit: 1000, // Increase this value (in kB) as needed
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
      host: true,
      port: 5173,
  },
})
