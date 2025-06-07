import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }): JSX.Element | null => {
    const { user, loading } = useAuth(); // <-- POBIERAMY STAN loading

    // Jeśli weryfikacja tokena wciąż trwa, pokaż ekran ładowania
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
                <p>Uwierzytelnianie...</p>
            </div>
        );
    }

    // Jeśli zakończono weryfikację i nie ma użytkownika, przekieruj
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Jeśli wszystko jest w porządku, pokaż chronioną zawartość
    return children ? children : <Outlet />;
};

export default PrivateRoute;