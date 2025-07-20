import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react' 

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        // Zmień port na ten, na którym FAKTYCZNIE działa Twój backend
        target: 'http://localhost:5000', 
        changeOrigin: true,
        secure: false, 
      },
    },
  },
});