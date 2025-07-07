/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axios from 'axios';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const api = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`${api}/admin/tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data;

                if (data && Array.isArray((data as any).$values)) {
                    setTasks((data as any).$values);
                } else if (Array.isArray(data)) {
                    setTasks(data);
                } else {
                    console.warn("Otrzymano nieoczekiwany format danych dla zadań:", data);
                    setTasks([]);
                }

            } catch (err) {
                setError('Nie udało się pobrać zadań lub nie masz uprawnień.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [api, token]);

    if (loading) return <p className="p-6 text-gray-400">Ładowanie...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Wszystkie zadania w systemie</h1>
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
                        {tasks.map(task => (
                            <tr key={task.id} className="hover:bg-gray-700">
                                <td className="px-5 py-4 border-b border-gray-600 text-sm">{task.title}</td>
                                <td className="px-5 py-4 border-b border-gray-600 text-sm">{task.user.username}</td>
                                <td className="px-5 py-4 border-b border-gray-600 text-sm">{task.customer?.name || 'Brak'}</td>
                                <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Brak'}
                                </td>
                                <td className="px-5 py-4 border-b border-gray-600 text-sm">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.completed ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'}`}>
                                        {task.completed ? 'Ukończone' : 'W trakcie'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}