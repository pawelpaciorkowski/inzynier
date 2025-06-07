import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

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
    loading: boolean; // <-- NOWY STAN
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true, // <-- WARTOŚĆ POCZĄTKOWA
    logout: () => { }
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // <-- NOWY STAN

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                setUser({
                    username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                    role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
                });
            } catch (error) {
                console.error("Błąd dekodowania tokena:", error);
                localStorage.removeItem("token");
                setUser(null);
            }
        }
        setLoading(false); // <-- ZAWSZE KOŃCZYMY ŁADOWANIE
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);