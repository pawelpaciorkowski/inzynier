// Plik: crm-mobile/services/api.ts
// Import biblioteki axios do wykonywania zapytań HTTP
import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Klucz używany do przechowywania tokena
const TOKEN_KEY = 'my-jwt';

// Bazowy URL API - pobierany z zmiennej środowiskowej lub domyślny dla emulatora
const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8100') + '/api';

/**
 * Helper do pobierania tokena z SecureStore lub localStorage (web)
 */
const getToken = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch (e) {
            console.error('LocalStorage is unavailable', e);
            return null;
        }
    } else {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    }
};

/**
 * Tworzymy skonfigurowaną instancję axios dla aplikacji mobilnej
 * Ta instancja automatycznie:
 * - Dodaje bazowy URL do wszystkich zapytań
 * - Dodaje token Bearer do nagłówka Authorization
 */
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 sekund timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor dla zapytań - automatycznie dodaje token do każdego zapytania
 */
api.interceptors.request.use(
    async (config) => {
        // Pobierz token z bezpiecznego storage
        const token = await getToken();

        // Jeśli token istnieje, dodaj go do nagłówka Authorization
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor dla odpowiedzi - obsługa błędów
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Logowanie błędów autoryzacji
        if (error.response?.status === 401) {
            console.error('❌ 401 Unauthorized dla:', error.config?.url);
        }

        // Logowanie błędów sieciowych
        if (error.message === 'Network Error') {
            console.error('❌ Network Error - sprawdź połączenie z API:', API_URL);
        }

        return Promise.reject(error);
    }
);

// Eksportujemy skonfigurowaną instancję axios
export default api;
