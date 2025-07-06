// Plik: crm-ui/src/services/api.ts
import axios from 'axios';

// Tworzymy nową, konfigurowalną instancję axios
const api = axios.create({
    baseURL: '/api' // Bazowy URL dla wszystkich zapytań
});

// To jest interceptor - funkcja, która "przechwytuje" każde zapytanie
// i dodaje do niego aktualny token z localStorage.
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;