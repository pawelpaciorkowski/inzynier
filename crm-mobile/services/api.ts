import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';


const TOKEN_KEY = 'my-jwt';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8100') + '/api';


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


const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 sekund timeout
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    async (config) => {
        
        const token = await getToken();

        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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


export default api;
