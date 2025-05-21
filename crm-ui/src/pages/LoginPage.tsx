// src/pages/LoginPage.tsx
import { useState } from "react";
import axios from "axios";
import { FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const api = import.meta.env.VITE_API_URL;
    const handleLogin = async () => {
        setError("");
        try {
            const res = await axios.post(`${api}/Auth/login`, {
                username,
                password,
            });

            // Zapisz token do localStorage
            localStorage.setItem("token", res.data.token);
            // Po zalogowaniu przekierowanie na dashboard
            navigate("/dashboard");  // Przekierowanie na dashboard
        } catch {
            setError("Niepoprawna nazwa użytkownika lub hasło.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 px-6">
            <div className="max-w-md w-full bg-gray-800 bg-opacity-90 rounded-xl shadow-xl p-10 backdrop-blur-md border border-gray-700">
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
