import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'my-jwt';

// ✅ Ten adres będzie teraz używany wszędzie
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';

// ✅ Ustawiamy bazowy URL dla wszystkich zapytań axios w całej aplikacji
axios.defaults.baseURL = API_URL;

// --- Helpery do przechowywania, których użyliśmy wcześniej (bez zmian) ---
const storage = {
    async setItem(key: string, value: string) {
        if (Platform.OS === 'web') {
            try { localStorage.setItem(key, value); } catch (e) { console.error('LocalStorage is unavailable', e); }
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    async getItem(key: string) {
        if (Platform.OS === 'web') {
            try { return localStorage.getItem(key); } catch (e) { console.error('LocalStorage is unavailable', e); return null; }
        } else {
            return await SecureStore.getItemAsync(key);
        }
    },
    async deleteItem(key: string) {
        if (Platform.OS === 'web') {
            try { localStorage.removeItem(key); } catch (e) { console.error('LocalStorage is unavailable', e); }
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    },
};

// --- Reszta kontekstu (bez zmian) ---
interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
interface AuthContextType extends AuthState {
    login: (username: any, password: any) => Promise<void>;
    logout: () => void;
}
const AuthContext = createContext<AuthContextType>({
    token: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => { },
    logout: () => { },
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authState, setAuthState] = useState<AuthState>({
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        const loadToken = async () => {
            const token = await storage.getItem(TOKEN_KEY);
            if (token) {
                try {
                    const decodedToken: any = jwtDecode(token);
                    if (decodedToken.exp * 1000 < Date.now()) {
                        await storage.deleteItem(TOKEN_KEY);
                        setAuthState({ token: null, isAuthenticated: false, isLoading: false });
                    } else {
                        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        setAuthState({ token: token, isAuthenticated: true, isLoading: false });
                    }
                } catch (e) {
                    await storage.deleteItem(TOKEN_KEY);
                    setAuthState({ token: null, isAuthenticated: false, isLoading: false });
                }
            } else {
                setAuthState({ token: null, isAuthenticated: false, isLoading: false });
            }
        };
        loadToken();
    }, []);

    const login = async (username: any, password: any) => {
        try {
            // Teraz wystarczy podać tylko ścieżkę
            const result = await axios.post('/api/Auth/login', { username, password });
            const token = result.data.token;

            await storage.setItem(TOKEN_KEY, token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setAuthState({
                token: token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (e) {
            console.error("Błąd logowania:", e);
            throw new Error("Logowanie nie powiodło się");
        }
    };

    const logout = async () => {
        await storage.deleteItem(TOKEN_KEY);
        delete axios.defaults.headers.common['Authorization'];
        setAuthState({
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    const value = { ...authState, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};