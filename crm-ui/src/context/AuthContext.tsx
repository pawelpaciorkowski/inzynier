// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
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
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, logout: () => { } });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

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
                console.error("Token decoding error:", error);
                localStorage.removeItem("token");
                setUser(null); // Usuń użytkownika, gdy dekodowanie nie uda się
            }
        }
    }, []); // Będzie wykonywane raz, przy pierwszym renderowaniu

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
