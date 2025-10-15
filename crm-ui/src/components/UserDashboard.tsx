// Import komponentu Link z React Router do nawigacji
import { Link } from "react-router-dom";

// Interface definiujący props komponentu UserDashboard
interface UserDashboardProps {
    // Dane do wyświetlenia na dashboardzie użytkownika
    data: {
        tasksCount: number; // Liczba zadań przypisanych do użytkownika
        messagesCount: number; // Liczba nowych wiadomości
        remindersCount: number; // Liczba przypomnień
        loginHistory: { date: string; ipAddress: string }[]; // Historia logowań z datą i adresem IP
        notesCount: number; // Liczba notatek
    };
}

// Główny komponent dashboardu użytkownika - wyświetla podsumowanie aktywności
export default function UserDashboard({ data }: UserDashboardProps) {
    // Sprawdza czy dane zostały przekazane - jeśli nie, wyświetla komunikat ładowania
    if (!data) {
        return (
            // Kontener z komunikatem ładowania
            <div className="space-y-8">
                <div className="text-center text-gray-400">
                    <p>Ładowanie danych...</p>
                </div>
            </div>
        );
    }

    return (
        // Główny kontener dashboardu z odstępami między sekcjami
        <div className="space-y-8">
            {/* Siatka widgetów z licznikami - responsywna (1 kolumna na mobile, 2 na tablet, 3 na desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Widget zadań - link do strony zadań */}
                <DashboardWidget title="Twoje zadania" count={data.tasksCount} to="/zadania" />
                {/* Widget wiadomości - link do strony wiadomości */}
                <DashboardWidget title="Nowe wiadomości" count={data.messagesCount} to="/wiadomosci" />
                {/* Widget przypomnień - link do strony przypomnień */}
                <DashboardWidget title="Przypomnienia" count={data.remindersCount} to="/przypomnienia" />
                <DashboardWidget title="Notatki" count={data.notesCount} to="/notatki" />
            </div>

            {/* Sekcja historii logowań */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
                {/* Tytuł sekcji */}
                <h2 className="text-2xl font-semibold text-indigo-400 mb-4">Ostatnie logowania</h2>
                {/* Lista logowań z przewijaniem */}
                <ul className="divide-y divide-gray-700 max-h-56 overflow-y-auto">
                    {/* Sprawdza czy historia logowań istnieje i ma elementy */}
                    {Array.isArray(data.loginHistory) && data.loginHistory.length > 0 ? (
                        // Mapuje każdy wpis historii logowań na element listy
                        data.loginHistory.map((entry, index) => (
                            <li
                                key={index} // Klucz React dla optymalizacji renderowania
                                className="py-3 flex justify-between text-sm text-gray-300 hover:bg-gray-700 rounded transition"
                            >
                                {/* Data logowania - konwertuje na polski format */}
                                <span>{new Date(entry.date.endsWith('Z') ? entry.date : entry.date + 'Z').toLocaleString('pl-PL')}</span>
                                {/* Adres IP z którego nastąpiło logowanie */}
                                <span>{entry.ipAddress}</span>
                            </li>
                        ))
                    ) : (
                        // Komunikat gdy brak danych logowania
                        <li className="py-4 text-center text-gray-400">Brak danych logowania</li>
                    )}
                </ul>

            </div>
        </div>
    );
}

// Komponent widgetu dashboardu - wyświetla licznik z tytułem i opcjonalnym linkiem
function DashboardWidget({ title, count, to }: { title: string; count: number; to?: string }) {
    // Zawartość widgetu - tytuł i licznik
    const content = (
        // Kontener widgetu z tłem, obramowaniem i efektem hover
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-lg flex flex-col justify-center items-center text-center transition-transform hover:scale-[1.03]">
            {/* Tytuł widgetu */}
            <h2 className="text-xl font-semibold text-indigo-400 mb-2">{title}</h2>
            {/* Licznik - duża liczba */}
            <p className="text-4xl font-extrabold text-white">{count}</p>
        </div>
    );

    // Jeśli przekazano ścieżkę (to), owijamy zawartość w Link
    if (to) {
        return <Link to={to}>{content}</Link>;
    }
    // W przeciwnym razie zwracamy tylko zawartość bez linku
    return content;
}
