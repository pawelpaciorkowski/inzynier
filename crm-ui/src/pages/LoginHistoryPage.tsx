import { useEffect, useState } from 'react';
import axios from 'axios';

// Definicja typu dla pojedynczego wpisu w historii
interface LoginEntry {
    id: number;
    loggedInAt: string;
    ipAddress: string;
    userAgent?: string;
    browser?: string;
    operatingSystem?: string;
    deviceType?: string;
    isSuccessful: boolean;
    failureReason?: string;
    location?: string;
    username: string;
    userEmail: string;
}

// Definicja typu dla odpowiedzi z API, która może być opakowana
interface ApiResponse {
    $id: string;
    $values: LoginEntry[];
}

export function LoginHistoryPage() {
    const [history, setHistory] = useState<LoginEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get<ApiResponse | LoginEntry[]>(`${api}/profile/login-history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data;

                // --- TO JEST POPRAWIONA LOGIKA ---
                // Sprawdzamy, czy dane są 'opakowane' w obiekt z kluczem '$values'
                if (data && typeof data === 'object' && '$values' in data && Array.isArray(data.$values)) {
                    setHistory(data.$values);
                }
                // Sprawdzamy, czy dane są po prostu tablicą
                else if (Array.isArray(data)) {
                    setHistory(data);
                }
                // Jeśli format jest nieznany, ustawiamy błąd
                else {
                    throw new Error("Otrzymano nieprawidłowy format danych.");
                }

            } catch (err) {
                setError('Nie udało się pobrać historii logowań.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [api]);

    if (loading) return <p className="p-6 text-gray-400">Ładowanie...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Historia logowań</h1>

            {/* Statystyki */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">{history.length}</div>
                    <div className="text-sm text-gray-400">Wszystkie próby</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">
                        {history.filter(h => h.isSuccessful).length}
                    </div>
                    <div className="text-sm text-gray-400">Udane logowania</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-500">
                        {history.filter(h => !h.isSuccessful).length}
                    </div>
                    <div className="text-sm text-gray-400">Nieudane próby</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-500">
                        {new Set(history.map(h => h.ipAddress)).size}
                    </div>
                    <div className="text-sm text-gray-400">Unikalne IP</div>
                </div>
            </div>
            <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal text-white">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                    Data i godzina
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                    Adres IP
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                    Przeglądarka
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                    System
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                    Urządzenie
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                    Lokalizacja
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((entry) => (
                                <tr key={entry.id} className={`hover:bg-gray-700 ${!entry.isSuccessful ? 'bg-red-900/20' : ''}`}>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        {new Date(entry.loggedInAt.endsWith('Z') ? entry.loggedInAt : entry.loggedInAt + 'Z').toLocaleString('pl-PL')}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${entry.isSuccessful
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {entry.isSuccessful ? '✅ Sukces' : '❌ Błąd'}
                                        </span>
                                        {!entry.isSuccessful && entry.failureReason && (
                                            <div className="text-xs text-red-400 mt-1">
                                                {entry.failureReason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-300">{entry.ipAddress}</span>
                                            {entry.ipAddress === '::1' && (
                                                <span className="text-xs text-gray-500">(localhost)</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-300">{entry.browser || 'Nieznana'}</span>
                                            {entry.browser && (
                                                <span className="text-xs text-gray-500">
                                                    {entry.browser === 'Chrome' && '🌐'}
                                                    {entry.browser === 'Firefox' && '🦊'}
                                                    {entry.browser === 'Safari' && '🍎'}
                                                    {entry.browser === 'Edge' && '🔷'}
                                                    {entry.browser === 'Opera' && '🔴'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-300">{entry.operatingSystem || 'Nieznany'}</span>
                                            {entry.operatingSystem && (
                                                <span className="text-xs text-gray-500">
                                                    {entry.operatingSystem === 'Windows' && '🪟'}
                                                    {entry.operatingSystem === 'macOS' && '🍎'}
                                                    {entry.operatingSystem === 'Linux' && '🐧'}
                                                    {entry.operatingSystem === 'Android' && '🤖'}
                                                    {entry.operatingSystem === 'iOS' && '📱'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-300">{entry.deviceType || 'Desktop'}</span>
                                            {entry.deviceType && (
                                                <span className="text-xs text-gray-500">
                                                    {entry.deviceType === 'Desktop' && '💻'}
                                                    {entry.deviceType === 'Mobile' && '📱'}
                                                    {entry.deviceType === 'Tablet' && '📱'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        <span className="text-gray-300">{entry.location || 'Lokalne'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}