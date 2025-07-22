/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import { useModal } from '../context/ModalContext';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ClientSelectModal from '../components/ClientSelectModal';

interface TaskItem {
    id: number;
    title: string;
    description?: string;
    dueDate?: string;
    completed: boolean;
    user?: { username: string };
}
interface Customer { id: number; name: string; }
interface UpdateTaskDto { title: string; description?: string; dueDate?: string; completed: boolean; }

export default function TasksPage() {
    const { user } = useAuth();
    const { openModal, openToast } = useModal();
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<TaskItem[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'pending'>('all');
    const api = import.meta.env.VITE_API_URL;

    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskDueDate, setNewTaskDueDate] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState("");

    const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const fetchInitialData = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!user || !token) return;
        setLoading(true);
        try {
            const tasksUrl = user.role === "admin" ? `${api}/admin/tasks` : `${api}/user/tasks`;
            const customersUrl = `${api}/customers`;

            const [tasksRes, customersRes] = await Promise.all([
                axios.get(tasksUrl, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(customersUrl, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const tasksData = tasksRes.data;
            if (tasksData && Array.isArray((tasksData as any).$values)) {
                setTasks((tasksData as any).$values);
                setFilteredTasks((tasksData as any).$values);
            }
            else if (Array.isArray(tasksData)) {
                setTasks(tasksData);
                setFilteredTasks(tasksData);
            }
            else {
                setTasks([]);
                setFilteredTasks([]);
            }

            const customerData = customersRes.data;
            if (customerData && Array.isArray((customerData as any).$values)) setCustomers((customerData as any).$values);
            else if (Array.isArray(customerData)) setCustomers(customerData);
            else setCustomers([]);

        } catch (err) {
            setError("Nie udało się pobrać danych.");
        } finally {
            setLoading(false);
        }
    }, [api, user]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Filtrowanie zadań na podstawie wyszukiwania
    useEffect(() => {
        let filtered = tasks;

        // Filtrowanie po tytule
        if (search.trim() !== '') {
            const lowercasedQuery = search.toLowerCase();
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(lowercasedQuery) ||
                (task.description && task.description.toLowerCase().includes(lowercasedQuery)) ||
                (task.user && task.user.username.toLowerCase().includes(lowercasedQuery))
            );
        }

        // Filtrowanie po wykonalności
        switch (completionFilter) {
            case 'completed':
                filtered = filtered.filter(task => task.completed);
                break;
            case 'pending':
                filtered = filtered.filter(task => !task.completed);
                break;
            case 'all':
            default:
                // Brak filtrowania - pokazujemy wszystkie
                break;
        }

        setFilteredTasks(filtered);
    }, [tasks, search, completionFilter]);

    const addTask = async () => {
        const token = localStorage.getItem("token");
        if (!newTaskTitle.trim() || !token || !selectedCustomerId) {
            openModal({ type: 'error', title: 'Błąd', message: 'Tytuł i klient są wymagane.' });
            return;
        }
        try {
            const res = await axios.post(`${api}/user/tasks`, {
                title: newTaskTitle,
                description: newTaskDescription,
                dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
                customerId: parseInt(selectedCustomerId),
            }, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });

            await fetchInitialData();
            setNewTaskTitle("");
            setNewTaskDescription("");
            setNewTaskDueDate("");
            setSelectedCustomerId("");
        } catch {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się dodać zadania.' });
        }
    };

    const handleUpdate = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask) return;

        const token = localStorage.getItem("token");
        const updateDto: UpdateTaskDto = {
            title: editingTask.title,
            description: editingTask.description,
            dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString() : undefined,
            completed: editingTask.completed,
        };

        try {
            await axios.put(`${api}/user/tasks/${editingTask.id}`, updateDto, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });
            setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
            setEditingTask(null);
        } catch (err) {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się zaktualizować zadania.' });
        }
    }, [api, editingTask, openModal]);

    const handleDelete = (task: TaskItem) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: `Czy na pewno chcesz usunąć zadanie "${task.title}"?`,
            confirmText: 'Usuń',
            onConfirm: async () => {
                const token = localStorage.getItem("token");
                try {
                    await axios.delete(`${api}/user/tasks/${task.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    setTasks(prev => prev.filter(t => t.id !== task.id));
                    openToast('Zadanie zostało pomyślnie usunięte.', 'success');
                } catch {
                    openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się usunąć zadania.' });
                }
            }
        });
    };

    const toggleComplete = useCallback(async (task: TaskItem) => {
        const token = localStorage.getItem("token");
        const updateDto: UpdateTaskDto = {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            completed: !task.completed,
        };
        try {
            await axios.put(`${api}/user/tasks/${task.id}`, updateDto, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
        } catch (err) {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się zmienić statusu zadania.' });
        }
    }, [api, openModal]);

    if (loading) return <p className="p-6 text-gray-400">Ładowanie zadań...</p>;

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
            <h1 className="text-4xl font-bold mb-6 text-indigo-400">Zadania</h1>
            {error && <p className="mb-4 text-red-500 font-semibold">{error}</p>}

            <div className="mb-8 p-4 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-3">Dodaj nowe zadanie</h2>
                <div className="flex flex-col gap-3">
                    <input type="text" placeholder="Tytuł zadania" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="rounded-md px-4 py-2 bg-gray-700 text-white border border-gray-600" />
                    <textarea placeholder="Opis zadania" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} className="rounded-md px-4 py-2 bg-gray-700 text-white border border-gray-600 resize-none" rows={2} />
                    <button type="button" onClick={() => setShowClientModal(true)} className="rounded-md px-4 py-2 bg-gray-700 text-white border border-gray-600 text-left">
                        {selectedCustomer ? `Klient: ${selectedCustomer.name}` : '-- Wybierz klienta --'}
                    </button>
                    {showClientModal && (
                        <ClientSelectModal
                            clients={customers}
                            onSelect={client => {
                                setSelectedCustomer(client);
                                setSelectedCustomerId(client.id.toString());
                                setShowClientModal(false);
                            }}
                            onClose={() => setShowClientModal(false)}
                        />
                    )}
                    <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="rounded-md px-4 py-2 bg-gray-700 text-white border border-gray-600" />
                    <button onClick={addTask} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-md font-semibold transition self-start">Dodaj</button>
                </div>
            </div>

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

            <ul className="space-y-3">
                {filteredTasks.map((task) => (
                    editingTask?.id === task.id ? (
                        <li key={task.id} className="p-4 rounded-md border border-yellow-400 bg-gray-800">
                            <form onSubmit={handleUpdate} className="flex flex-col gap-3">
                                <input type="text" value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} className="rounded-md px-4 py-2 bg-gray-700 text-white border border-gray-600" />
                                <textarea value={editingTask.description || ''} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} className="rounded-md px-4 py-2 bg-gray-700 text-white border border-gray-600 resize-none" rows={2} />
                                <input type="date" value={editingTask.dueDate ? editingTask.dueDate.split('T')[0] : ''} onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })} className="rounded-md px-4 py-2 bg-gray-700 text-white border border-gray-600" />
                                <div className="flex gap-2 self-start">
                                    <button type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded-md">Zapisz</button>
                                    <button type="button" onClick={() => setEditingTask(null)} className="bg-gray-600 hover:bg-gray-500 px-4 py-1 rounded-md">Anuluj</button>
                                </div>
                            </form>
                        </li>
                    ) : (
                        <li key={task.id} className={`p-4 rounded-md border border-gray-700 ${task.completed ? "bg-gray-700/50" : "bg-gray-800"} flex flex-col gap-1`}>
                            <div className="flex justify-between items-start">
                                <div className={`font-semibold ${task.completed && "line-through text-gray-400"}`}>{task.title}</div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setEditingTask(task)} title="Edytuj"><PencilIcon className="w-5 h-5 text-gray-400 hover:text-yellow-400" /></button>
                                    <button onClick={() => handleDelete(task)} title="Usuń"><TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" /></button>
                                    <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task)} className="w-5 h-5 text-indigo-500 bg-gray-900 border-gray-600 rounded" />
                                </div>
                            </div>
                            {task.description && <p className={`text-sm text-gray-400 ${task.completed && "line-through"}`}>{task.description}</p>}
                            {task.dueDate && <p className={`text-xs text-gray-500 ${task.completed && "line-through"}`}>Termin: {new Date(task.dueDate).toLocaleDateString()}</p>}
                            {user?.role === "admin" && task.user && <p className="text-xs text-gray-400">Użytkownik: {task.user.username}</p>}
                        </li>
                    )
                ))}
            </ul>
        </div>
    );
}