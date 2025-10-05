// Plik: crm-ui/src/services/api.ts
// Import biblioteki axios do wykonywania zapytań HTTP
import axios from 'axios';

// Tworzymy nową, konfigurowalną instancję axios z określoną konfiguracją
const api = axios.create({
    // Bazowy URL dla wszystkich zapytań - używamy pustego stringa dla względnych ścieżek z proxy
    baseURL: import.meta.env.VITE_API_URL || ''
});

// Konfigurujemy interceptor dla zapytań (request interceptor)
// To jest middleware, które "przechwytuje" każde zapytanie przed wysłaniem
// i automatycznie dodaje token uwierzytelniający z localStorage
api.interceptors.request.use(
    // Funkcja wykonywana dla każdego udanego zapytania
    config => {
        // Pobieramy token JWT z localStorage przeglądarki
        const token = localStorage.getItem('token');
        // Jeśli token istnieje, dodajemy go do nagłówka Authorization
        if (token) {
            // Ustawiamy nagłówek Bearer token dla uwierzytelnienia API
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // Zwracamy zmodyfikowaną konfigurację zapytania
        return config;
    },
    // Funkcja obsługi błędów podczas przygotowywania zapytania
    error => {
        // Przekazujemy błąd dalej w łańcuchu Promise
        return Promise.reject(error);
    }
);

// Eksportujemy skonfigurowaną instancję axios jako domyślny export
// Ta instancja będzie używana we wszystkich innych plikach do komunikacji z API
export default api;