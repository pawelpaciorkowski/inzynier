// Import hooków React - createContext do tworzenia kontekstu, useContext do używania kontekstu
// useEffect do efektów ubocznych, useState do stanu, ReactNode do typowania children
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
// Import biblioteki jwt-decode do dekodowania tokenów JWT
import { jwtDecode } from "jwt-decode";
// Import biblioteki axios do zapytań HTTP
import axios from "axios";
// Import kontekstu modali do wyświetlania komunikatów błędów
import { useModal } from "./ModalContext";

// Interface definiujący strukturę obiektu użytkownika
interface User {
    // Nazwa użytkownika z tokena JWT
    username: string;
    // Rola użytkownika (Admin, Manager, Sprzedawca)
    role: string;
}

// Interface definiujący strukturę payload tokena JWT
// Obsługuje zarówno claims .NET jak i Python backend
interface JwtPayload {
    // Claims .NET (Microsoft)
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
    // Claims Python backend (proste nazwy)
    username?: string;
    role?: string;
    // Dodatkowe pola
    sub?: string;
    user_id?: number;
    exp?: number;
    iat?: number;
}

// Interface definiujący typ kontekstu uwierzytelnienia
interface AuthContextType {
    // Aktualnie zalogowany użytkownik lub null jeśli niezalogowany
    user: User | null;
    // Flaga określająca czy trwa proces ładowania/uwierzytelniania
    loading: boolean;
    // Funkcja wylogowania użytkownika
    logout: () => void;
}

// Utworzenie kontekstu React z domyślnymi wartościami
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: () => { }
});

// Komponent Provider dostarczający kontekst uwierzytelnienia dla całej aplikacji
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Stan przechowujący dane zalogowanego użytkownika
    const [user, setUser] = useState<User | null>(null);
    // Stan określający czy trwa proces uwierzytelniania
    const [loading, setLoading] = useState(true);
    // Hook do wyświetlania modali z błędami
    const { openModal } = useModal();

    // Effect uruchamiany przy pierwszym załadowaniu komponentu
    useEffect(() => {
        // Pobieramy token JWT z localStorage przeglądarki
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // Dekodujemy token JWT aby wyciągnąć dane użytkownika
                const decoded = jwtDecode<JwtPayload>(token);

                // Pobierz dane użytkownika z tokenu
                const username = decoded.username || decoded.sub;
                const role = decoded.role;

                // Ustawiamy dane użytkownika w stanie
                setUser({
                    username: username || '',
                    role: role || '',
                });
            } catch (error) {
                // W przypadku błędu dekodowania (token nieprawidłowy/wygasły)
                console.error("Błąd dekodowania tokena:", error);
                // Usuwamy nieprawidłowy token z localStorage
                localStorage.removeItem("token");
                // Resetujemy stan użytkownika
                setUser(null);
            }
        }
        // Kończymy proces ładowania
        setLoading(false);

        // Konfigurujemy interceptor odpowiedzi axios do globalnej obsługi błędów
        const interceptor = axios.interceptors.response.use(
            // Dla udanych odpowiedzi - przekazuj je dalej bez zmian
            response => response,
            // Dla błędów - obsłuż odpowiednio różne typy błędów
            error => {
                // Sprawdzamy typ błędu i wyświetlamy odpowiedni komunikat
                if (error.response) {
                    const status = error.response.status;

                    // Dla błędów 401 (Unauthorized) - wyloguj użytkownika
                    if (status === 401) {
                        console.log('🔒 Błąd 401 - wylogowywanie użytkownika');
                        localStorage.removeItem('token');
                        delete axios.defaults.headers.common['Authorization'];
                        setUser(null);
                        // Nie pokazuj modala dla 401 - po prostu wyloguj
                        return Promise.reject(error);
                    }

                    // Dla innych błędów serwera - pokaż modal
                    const message = error.response.data?.message || error.response.data || `Błąd serwera: ${status}`;
                    openModal({
                        type: 'error',
                        title: `Błąd ${status}`,
                        message: message,
                    });
                } else if (error.request) {
                    // Błąd sieci - brak odpowiedzi od serwera
                    openModal({
                        type: 'error',
                        title: 'Błąd sieci',
                        message: 'Brak odpowiedzi z serwera. Sprawdź połączenie internetowe.',
                    });
                } else {
                    // Inny typ błędu (konfiguracja, itp.)
                    openModal({
                        type: 'error',
                        title: 'Nieznany błąd',
                        message: error.message,
                    });
                }
                // Przekazujemy błąd dalej w łańcuchu Promise
                return Promise.reject(error);
            }
        );

        // Cleanup function - usuwamy interceptor przy unmount komponentu
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [openModal]); // Effect zależy od openModal

    // Funkcja wylogowania użytkownika
    const logout = () => {
        // Usuwamy token z localStorage przeglądarki
        localStorage.removeItem("token");
        // Resetujemy stan użytkownika
        setUser(null);
    };

    return (
        // Provider dostarczający wartości kontekstu do komponentów potomnych
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook do używania kontekstu uwierzytelnienia w komponentach
// Zapewnia łatwiejszy dostęp do stanu uwierzytelnienia
export const useAuth = () => useContext(AuthContext);