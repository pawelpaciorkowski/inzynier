// Plik: crm-ui/src/services/api.ts
import axios from 'axios';

// Tworzymy nową, konfigurowalną instancję axios
const api = axios.create({
    baseURL: 'http://localhost:5000/api' // Bazowy URL dla wszystkich zapytań
});

// To jest interceptor - funkcja, która "przechwytuje" każde zapytanie
// i dodaje do niego aktualny token z localStorage.
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('🔐 Token dodany do requestu:', config.url);
        } else {
            console.warn('⚠️ Brak tokenu dla requestu:', config.url);
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Interceptor odpowiedzi - logowanie błędów
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.error('❌ 401 Unauthorized dla:', error.config?.url, {
                headers: error.config?.headers,
                response: error.response?.data
            });
        }
        return Promise.reject(error);
    }
);

export default api;