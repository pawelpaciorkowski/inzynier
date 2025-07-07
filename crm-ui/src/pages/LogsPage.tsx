import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useModal } from '../context/ModalContext';

interface SystemLog {
    id: number;
    timestamp: string;
    level: string;
    message: string;
    source: string;
    exception?: string;
    properties?: string;
}

export function LogsPage() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useModal();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get<SystemLog[]>('/api/Logs', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setLogs(response.data);
            } catch {
                setError('Nie udało się załadować logów. Upewnij się, że masz uprawnienia administratora.');
                openModal({
                    type: 'error',
                    title: 'Błąd',
                    message: 'Nie udało się załadować logów. Upewnij się, że masz uprawnienia administratora.'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [openModal]);

    if (loading) return <div className="text-center p-8 text-white">Ładowanie logów...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Systemowe Logi</h1>

            <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exception</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {logs.length > 0 ? (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: pl })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.level === 'Error' ? 'bg-red-100 text-red-800' :
                                                log.level === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {log.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{log.source}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{log.message}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 max-w-xs truncate">{log.exception || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Brak logów systemowych.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
