import { useEffect, useState } from 'react';
import axios from 'axios';

// Definicja typu dla pojedynczego wpisu w historii
interface LoginEntry {
    id: number;
    loggedInAt: string;
    ipAddress: string;
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
            <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal text-white">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                Data i godzina
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                Adres IP
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-700">
                                <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                    {new Date(entry.loggedInAt).toLocaleString()}
                                </td>
                                <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                    {entry.ipAddress}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}