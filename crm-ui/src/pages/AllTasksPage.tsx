import { useEffect, useState } from 'react';
import axios from 'axios';

interface Task {
    id: number;
    title: string;
    description: string | null;
    dueDate: string | null;
    completed: boolean;
    user: {
        username: string;
    };
    customer: {
        name: string;
    };
}

export function AllTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${api}/admin/tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(response.data);
            } catch (err) {
                setError('Nie udało się pobrać zadań lub nie masz uprawnień.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [api]);

    if (loading) return <p className="p-6 text-gray-400">Ładowanie...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Wszystkie zadania w systemie</h1>
            <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal text-white">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left">Tytuł</th>
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left">Użytkownik</th>
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left">Klient</th>
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id} className="hover:bg-gray-700">
                                <td className="px-5 py-4 border-b border-gray-600">{task.title}</td>
                                <td className="px-5 py-4 border-b border-gray-600">{task.user.username}</td>
                                <td className="px-5 py-4 border-b border-gray-600">{task.customer?.name || 'Brak'}</td>
                                <td className="px-5 py-4 border-b border-gray-600">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${task.completed ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'}`}>
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