/* eslint-disable @typescript-eslint/no-explicit-any */
// Plik: crm-ui/src/pages/TasksPage.tsx
import { useEffect, useState, useCallback } from 'react'; // <-- Dodajemy useCallback
import { useAuth } from "../context/AuthContext";

interface TaskItem {
    id: number;
    title: string;
    description?: string;
    dueDate?: string;
    completed: boolean;
    user?: { username: string };
}

export default function TasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskDueDate, setNewTaskDueDate] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) return; // Upewniamy się, że obiekt user istnieje

            const url = user.role === "admin" ? "/api/admin/tasks" : "/api/user/tasks";

            try {
                setLoading(true);
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Odpowiedź sieci nie była pomyślna.");

                const data = await res.json();
                if (data && Array.isArray((data as any).$values)) {
                    setTasks((data as any).$values);
                } else if (Array.isArray(data)) {
                    setTasks(data);
                } else {
                    setTasks([]);
                }
            } catch (err) {
                setError("Nie udało się pobrać zadań.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchTasks();
        } else {
            setLoading(false);
            setError("Brak autoryzacji do pobrania zadań.");
        }
    }, [token, user]); // <-- Używamy całego obiektu `user` jako zależności

    const addTask = useCallback(async () => {
        if (!newTaskTitle.trim() || !token) return;

        try {
            const res = await fetch("/api/user/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: newTaskTitle,
                    description: newTaskDescription,
                    dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
                }),
            });

            if (res.ok) {
                const created = await res.json();
                setTasks((prev) => [...prev, created]);
                setNewTaskTitle("");
                setNewTaskDescription("");
                setNewTaskDueDate("");
            } else {
                setError("Nie udało się dodać zadania.");
            }
        } catch {
            setError("Błąd podczas dodawania zadania.");
        }
    }, [newTaskTitle, newTaskDescription, newTaskDueDate, token]); // <-- Zależności dla `addTask`

    const toggleComplete = useCallback(async (id: number, completed: boolean) => {
        const taskToUpdate = tasks.find((t) => t.id === id);
        if (!taskToUpdate || !token) return;

        const updateDto = {
            title: taskToUpdate.title,
            description: taskToUpdate.description,
            dueDate: taskToUpdate.dueDate,
            completed: completed,
        };

        const updatedTaskInState = { ...taskToUpdate, completed };

        try {
            const res = await fetch(`/api/user/tasks/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateDto),
            });

            if (res.ok) {
                setTasks((prev) =>
                    prev.map((task) =>
                        task.id === id ? updatedTaskInState : task
                    )
                );
            } else {
                setError("Nie udało się zaktualizować zadania.");
            }
        } catch {
            setError("Błąd podczas aktualizacji zadania.");
        }
    }, [tasks, token]); // <-- Zależności dla `toggleComplete`


    if (loading) return <p className="p-6 text-gray-400">Ładowanie zadań...</p>;

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
            {/* ... reszta kodu JSX pozostaje bez zmian ... */}
            <h1 className="text-4xl font-bold mb-6 text-indigo-400">Zadania</h1>
            {error && <p className="mb-4 text-red-500 font-semibold">{error}</p>}
            <div className="mb-6 flex flex-col gap-3">
                <input type="text" placeholder="Tytuł zadania" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="rounded-md px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <textarea placeholder="Opis zadania" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} className="rounded-md px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={3} />
                <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="rounded-md px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={addTask} className="bg-indigo-600 hover:bg-indigo-700 px-6 rounded-md font-semibold transition">Dodaj</button>
            </div>
            <ul className="space-y-3">
                {tasks.map((task) => (
                    <li key={task.id} className={`p-4 rounded-md border border-gray-700 ${task.completed ? "bg-gray-700 line-through" : "bg-gray-800"} flex flex-col gap-1`}>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">{task.title}</span>
                            <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task.id, !task.completed)} className="w-5 h-5 text-indigo-500 bg-gray-900 border-gray-600 rounded" />
                        </div>
                        {task.description && <p className="text-sm text-gray-400">{task.description}</p>}
                        {task.dueDate && <p className="text-xs text-gray-500">Termin: {new Date(task.dueDate).toLocaleDateString()}</p>}
                        {user?.role === "admin" && task.user && <p className="text-xs text-gray-400">Użytkownik: {task.user.username}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}