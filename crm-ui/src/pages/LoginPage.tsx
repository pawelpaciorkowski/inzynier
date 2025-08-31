/* eslint-disable @typescript-eslint/no-unused-vars */
// Import hooka useState do zarządzania stanem komponentu
import { useState } from "react";
// Import biblioteki axios do wykonywania zapytań HTTP
import axios from "axios";
// Import ikon z biblioteki React Icons - ikona email i kłódki
import { FiMail, FiLock } from "react-icons/fi";
// Import hooka useNavigate do programowej nawigacji
import { useNavigate } from "react-router-dom";

// Komponent strony logowania - główny punkt wejścia do aplikacji CRM
export default function LoginPage() {
    // Hook do nawigacji po trasach aplikacji
    const navigate = useNavigate();
    // Stan przechowujący wprowadzoną nazwę użytkownika
    const [username, setUsername] = useState("");
    // Stan przechowujący wprowadzone hasło
    const [password, setPassword] = useState("");
    // Stan przechowujący komunikat błędu przy nieudanym logowaniu
    const [error, setError] = useState("");
    // Stan przechowujący stan ładowania podczas logowania
    const [loading, setLoading] = useState(false);

    // Funkcja obsługująca proces logowania użytkownika
    const handleLogin = async () => {
        if (!username || !password) {
            setError('Proszę wypełnić wszystkie pola');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const res = await axios.post('/api/Auth/login', {
                username,
                password,
            });

            // Zapisujemy otrzymany token JWT w localStorage przeglądarki
            localStorage.setItem("token", res.data.token);

            // Przekierowujemy użytkownika na dashboard (pełne przeładowanie strony)
            window.location.href = "/dashboard";

        } catch {
            // W przypadku błędu wyświetlamy komunikat o niepoprawnych danych
            setError("Niepoprawna nazwa użytkownika lub hasło.");
        } finally {
            setLoading(false);
        }
    };

    return (
        // Główny kontener strony logowania - pełna wysokość ekranu z gradientowym tłem
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 px-6">
            {/* Formularz logowania z przezroczystym tłem i rozmyciem */}
            <div className="max-w-md w-full bg-gray-800 bg-opacity-90 rounded-xl shadow-xl p-10 backdrop-blur-md border border-gray-700">
                {/* Nagłówek formularza logowania */}
                <h1 className="text-4xl font-extrabold text-white mb-10 text-center tracking-wide">
                    CRM Login
                </h1>

                <div className="space-y-8">
                    <label className="relative block">
                        <FiMail
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400"
                            size={24}
                        />
                        <input
                            type="text"
                            placeholder="Nazwa użytkownika"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-14 pr-4 py-4 bg-gray-900 text-white rounded-lg border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400 transition"
                            autoComplete="username"
                            required
                        />
                    </label>

                    <label className="relative block">
                        <FiLock
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400"
                            size={24}
                        />
                        <input
                            type="password"
                            placeholder="Hasło"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-14 pr-4 py-4 bg-gray-900 text-white rounded-lg border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400 transition"
                            autoComplete="current-password"
                            required
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </label>

                    {error && (
                        <p className="text-red-400 font-semibold text-center">{error}</p>
                    )}

                    <button
                        onClick={handleLogin}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-lg text-white shadow-lg transition"
                    >
                        Zaloguj się
                    </button>
                </div>

                <p className="mt-8 text-center text-gray-400 text-sm select-none">
                    Dostęp tylko dla uprawnionych użytkowników.
                </p>
            </div>
        </div>
    );
}