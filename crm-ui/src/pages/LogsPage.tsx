/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

interface SystemLog {
    details: string;
    id: number;
    timestamp: string;
    level: string;
    message: string;
    source: string;
    exception?: string;
    properties?: string;
}

export function LogsPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const { openModal } = useModal();

    useEffect(() => {
        if (user?.role === 'Sprzedawca') return;

        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get<any>('/api/Logs', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const logsData = response.data.$values || response.data;
                setLogs(logsData);
                setFilteredLogs(logsData);
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
    }, [openModal, user?.role]);

    // Filtrowanie logów na podstawie wyszukiwania
    useEffect(() => {
        const filtered = logs.filter(log =>
            log.message.toLowerCase().includes(search.toLowerCase()) ||
            log.source.toLowerCase().includes(search.toLowerCase()) ||
            log.level.toLowerCase().includes(search.toLowerCase()) ||
            (log.details && log.details.toLowerCase().includes(search.toLowerCase()))
        );
        setFilteredLogs(filtered);
    }, [logs, search]);

    if (user?.role === 'Sprzedawca') {
        return <div className="p-6 text-center text-red-500">Brak dostępu do tej sekcji.</div>;
    }

    if (loading) return <div className="text-center p-8 text-white">Ładowanie logów...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Systemowe Logi</h1>

            {/* Wyszukiwarka */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Wyszukaj logi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

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
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log) => (
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 max-w-xs truncate">{log.details || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    {search ? 'Brak logów pasujących do wyszukiwania.' : 'Brak logów systemowych.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
