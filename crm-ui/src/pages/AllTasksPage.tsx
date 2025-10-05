/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import api from '../services/api';

// Definicja interfejsu, aby TypeScript wiedział, jak wyglądają dane zadania
interface Task {
    id: number;
    title: string;
    description: string | null;
    dueDate: string | null;
    completed: boolean; // Zmieniono z `isCompleted` na `completed`, aby pasowało do API
    user: {
        username: string;
    };
    customer: {
        name: string;
    } | null; // Klient może być opcjonalny
}

export function AllTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'pending'>('all');
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await api.get('/admin/tasks');

                const data = response.data;

                if (data && Array.isArray((data as any).$values)) {
                    const tasksArray = (data as any).$values;
                    setTasks(tasksArray);
                    setFilteredTasks(tasksArray);
                } else if (Array.isArray(data)) {
                    setTasks(data);
                    setFilteredTasks(data);
                } else {
                    console.warn("Otrzymano nieoczekiwany format danych dla zadań:", data);
                    setTasks([]);
                    setFilteredTasks([]);
                }

            } catch (err) {
                setError('Nie udało się pobrać zadań lub nie masz uprawnień.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    // Filtrowanie zadań na podstawie wyszukiwania
    useEffect(() => {
        let filtered = tasks;

        // Filtrowanie po wyszukiwaniu
        if (search.trim() !== '') {
            const lowercasedSearch = search.toLowerCase();
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(lowercasedSearch) ||
                task.user.username.toLowerCase().includes(lowercasedSearch) ||
                (task.customer?.name && task.customer.name.toLowerCase().includes(lowercasedSearch))
            );
        }

        // Filtrowanie po statusie ukończenia
        switch (completionFilter) {
            case 'completed':
                filtered = filtered.filter(task => task.completed);
                break;
            case 'pending':
                filtered = filtered.filter(task => !task.completed);
                break;
            case 'all':
            default:
                // Brak dodatkowego filtrowania
                break;
        }

        setFilteredTasks(filtered);
    }, [tasks, search, completionFilter]);

    if (loading) return <p className="p-6 text-gray-400">Ładowanie...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Wszystkie zadania w systemie</h1>

            {/* Wyszukiwarka */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Wyszukaj zadania..."
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

            {/* Przyciski filtrowania po wykonalności */}
            <div className="flex justify-start gap-4 mb-6">
                <button
                    className={`px-4 py-2 rounded-md font-semibold transition ${completionFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => setCompletionFilter('all')}
                >
                    Wszystkie
                </button>
                <button
                    className={`px-4 py-2 rounded-md font-semibold transition ${completionFilter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => setCompletionFilter('pending')}
                >
                    Do wykonania
                </button>
                <button
                    className={`px-4 py-2 rounded-md font-semibold transition ${completionFilter === 'completed' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => setCompletionFilter('completed')}
                >
                    Ukończone
                </button>
            </div>

            <div className="bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal text-white">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">Tytuł</th>
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">Przypisany do</th>
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">Klient</th>
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">Termin</th>
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <tr key={task.id} className="hover:bg-gray-700">
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">{task.title}</td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">{task.user.username}</td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">{task.customer?.name || 'Brak'}</td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Brak'}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.completed ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'}`}>{task.completed ? 'Ukończone' : 'W trakcie'}</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500">
                                    {search ? 'Brak zadań pasujących do wyszukiwania.' : 'Brak zadań do wyświetlenia.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}