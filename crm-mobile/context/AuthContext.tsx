// Plik: crm-mobile/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Upewnij się, że masz `jwt-decode` w package.json

const TOKEN_KEY = 'my-jwt';
const API_URL = 'http://10.0.2.2:5167'; // Użyj tego adresu, aby emulator Androida "zobaczył" Twoje API na localhost

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
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setAuthState({
                    token: token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                setAuthState({
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        };
        loadToken();
    }, []);

    const login = async (username: any, password: any) => {
        try {
            const result = await axios.post(`${API_URL}/api/Auth/login`, { username, password });
            const token = result.data.token;

            await SecureStore.setItemAsync(TOKEN_KEY, token);
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
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        delete axios.defaults.headers.common['Authorization'];
        setAuthState({
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    const value = {
        ...authState,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};