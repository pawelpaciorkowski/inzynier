import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react' 

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ],
  server: {
    port: 8100,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8100', 
        changeOrigin: true,
        secure: false, 
      },
    },
  },
});