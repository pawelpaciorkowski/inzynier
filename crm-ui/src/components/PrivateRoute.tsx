// Import komponentów React Router - Navigate do przekierowania, Outlet do renderowania tras potomnych
import { Navigate, Outlet } from "react-router-dom";
// Import kontekstu uwierzytelnienia do sprawdzania stanu użytkownika
import { useAuth } from "../context/AuthContext";
// Import typu JSX z React do typowania TypeScript
import type { JSX } from "react";

// Komponent zabezpieczający trasy - sprawdza czy użytkownik jest zalogowany
// Jeśli nie, przekierowuje na stronę logowania
const PrivateRoute = ({ children }: { children: JSX.Element }): JSX.Element | null => {
    // Pobieramy stan użytkownika i flagę ładowania z kontekstu uwierzytelnienia
    const { user, loading } = useAuth();

    // Jeśli trwa proces uwierzytelniania, wyświetlamy komunikat ładowania
    if (loading) {
        return (
            // Ekran ładowania z wyśrodkowanym tekstem na ciemnym tle
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
                <p>Uwierzytelnianie...</p>
            </div>
        );
    }

    // Jeśli użytkownik nie jest zalogowany, przekieruj na stronę logowania
    if (!user) {
        // replace=true zastępuje obecną pozycję w historii, zapobiegając powrotowi
        return <Navigate to="/" replace />;
    }

    // Jeśli użytkownik jest zalogowany, renderuj komponenty potomne lub Outlet
    // children - gdy komponent jest bezpośrednio owinięty w PrivateRoute
    // Outlet - gdy PrivateRoute jest używane jako element trasy z trasami potomnymi
    return children ? children : <Outlet />;
};

// Eksport domyślny komponentu PrivateRoute
export default PrivateRoute;