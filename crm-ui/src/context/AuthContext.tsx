// Plik: crm-ui/src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from './ModalContext';

interface AuthContextType {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const navigate = useNavigate();
    const { openModal } = useModal();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        navigate('/dashboard');
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        navigate('/');
        openModal({ type: 'success', title: 'Wylogowano', message: 'Zostałeś pomyślnie wylogowany.' });
    };

    // Prosta flaga określająca, czy użytkownik jest uwierzytelniony
    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};