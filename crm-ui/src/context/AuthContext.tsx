import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useModal } from "./ModalContext";

interface User {
    username: string;
    role: string;
}

interface JwtPayload {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: () => { }
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { openModal } = useModal();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                setUser({
                    username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                    role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
                });
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                console.error("Błąd dekodowania tokena:", error);
                localStorage.removeItem("token");
                setUser(null);
            }
        }
        setLoading(false);

        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response) {
                    const status = error.response.status;
                    const message = error.response.data?.message || error.response.data || `Błąd serwera: ${status}`;
                    openModal({
                        type: 'error',
                        title: `Błąd ${status}`,
                        message: message,
                    });
                } else if (error.request) {
                    openModal({
                        type: 'error',
                        title: 'Błąd sieci',
                        message: 'Brak odpowiedzi z serwera. Sprawdź połączenie internetowe.',
                    });
                } else {
                    openModal({
                        type: 'error',
                        title: 'Nieznany błąd',
                        message: error.message,
                    });
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [openModal]);

    const logout = () => {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);