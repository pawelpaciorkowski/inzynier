// Import funkcji defineConfig z Vite do konfiguracji bundlera
import { defineConfig } from 'vite'
// Import pluginu Tailwind CSS dla Vite do przetwarzania stylów
import tailwindcss from '@tailwindcss/vite'
// Import pluginu React dla Vite do obsługi komponentów React i JSX
import react from '@vitejs/plugin-react' 

// Eksport domyślnej konfiguracji Vite dla aplikacji React
export default defineConfig({
  // Lista pluginów używanych przez Vite
  plugins: [
    // Plugin React - obsługuje transpilację JSX/TSX i React Fast Refresh
    react(), 
    // Plugin Tailwind CSS - integruje Tailwind z procesem budowania
    tailwindcss(),
  ],
  // Konfiguracja serwera deweloperskiego Vite
  server: {
    // Konfiguracja proxy - przekierowanie zapytań do backendu
    proxy: {
      // Wszystkie zapytania zaczynające się od '/api' będą proxowane
      '/api': {
        // Adres docelowy backendu - zmień port na właściwy dla Twojego API
        target: 'http://localhost:5000', 
        // Zmiana nagłówka Origin na target URL (potrzebne dla CORS)
        changeOrigin: true,
        // Wyłączenie weryfikacji certyfikatów SSL (dla developmentu)
        secure: false, 
      },
    },
  },
});