import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react' // Upewnij się, że masz tę wtyczkę, jeśli używasz Reacta

export default defineConfig({
  // Jeśli używasz Reacta, potrzebujesz tej wtyczki. 
  // Jeśli to czysty projekt Vite z Tailwind, możesz ją pominąć.
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
        secure: false, // Dobre na czas developmentu
      },
    },
  },
});