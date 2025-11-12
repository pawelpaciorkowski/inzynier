import { useEffect, useState } from 'react';
import api from '../services/api';

// Definicja typu dla pojedynczego wpisu w historii
interface LoginEntry {
    id: number;
    loginTime: string;
    ipAddress: string;
    userAgent?: string;
    browser: string;
    operatingSystem: string;
    deviceType: string;
    success: boolean;
    failureReason?: string;
    location?: string;
    userId: number;
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

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get<ApiResponse | LoginEntry[]>('/Profile/login-history');

                const data = response.data;


                if (data && typeof data === 'object' && '$values' in data && Array.isArray(data.$values)) {
                    setHistory(data.$values);
                }
                else if (Array.isArray(data)) {
                    setHistory(data);
                }
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
    }, []);

    if (loading) return <p className="p-6 text-gray-400">Ładowanie...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">⏰ Historia logowań</h1>

            {/* Statystyki */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">{history.length}</div>
                    <div className="text-sm text-gray-400">Wszystkie próby</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">
                        {history.filter(h => h.success).length}
                    </div>
                    <div className="text-sm text-gray-400">Udane logowania</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-500">
                        {history.filter(h => !h.success).length}
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
                                    Status logowania
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
                                <tr key={entry.id} className={`hover:bg-gray-700 ${!entry.success ? 'bg-red-900/20' : ''}`}>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        {entry.loginTime ? new Date(entry.loginTime).toLocaleString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : 'Brak daty'}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${entry.success
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {entry.success ? '✅ Sukces' : '❌ Błąd'}
                                        </span>
                                        {!entry.success && entry.failureReason && (
                                            <div className="text-xs text-red-400 mt-1">
                                                {entry.failureReason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-300">{entry.ipAddress}</span>
                                            {entry.ipAddress === '::1' && (
                                                <span className="text-xs text-gray-500">(lokalne)</span>
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
                                            <span className="text-gray-300">{entry.deviceType === 'Desktop' ? 'Komputer' : entry.deviceType === 'Mobile' ? 'Telefon' : entry.deviceType === 'Tablet' ? 'Tablet' : entry.deviceType || 'Komputer'}</span>
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