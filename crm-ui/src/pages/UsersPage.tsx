import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useModal } from '../context/ModalContext'; // Import useModal
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// Define clear types for your data
type User = {
    id: number;
    username: string;
    email: string;
    role: { name: string; }; // Assuming role is an object with a name property
};

type ApiResponse = {
    $values: User[];
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { openModal } = useModal(); // Use the global modal context
    const api = import.meta.env.VITE_API_URL;

    const fetchUsers = useCallback(async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            const res = await axios.get<ApiResponse | User[]>(`${api}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = '$values' in res.data ? res.data.$values : res.data;
            setUsers(data);
        } catch (err) {
            console.error('❌ Błąd ładowania użytkowników:', err);
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się załadować użytkowników.' });
        } finally {
            setLoading(false);
        }
    }, [api, openModal]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ✅ This is the corrected delete handler
    const handleDelete = (user: User) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: `Czy na pewno chcesz usunąć użytkownika "${user.username}"?`,
            confirmText: 'Usuń',
            onConfirm: async () => {
                const token = localStorage.getItem('token');
                try {
                    await axios.delete(`${api}/admin/users/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    openModal({ type: 'success', title: 'Sukces', message: 'Użytkownik usunięty.' });
                    fetchUsers(); // Refresh the list after deleting
                } catch (err) {
                    console.error('❌ Błąd usuwania użytkownika:', err);
                    openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się usunąć użytkownika.' });
                }
            },
        });
    };

    if (loading) {
        return <p className="p-6 text-center text-gray-400">Ładowanie...</p>
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 text-white">👤 Użytkownicy</h1>

            <ul className="space-y-4">
                {users.map(user => (
                    <li key={user.id} className="bg-gray-800 p-4 rounded-md text-white shadow flex justify-between items-center">
                        <div>
                            <strong className="text-xl">{user.username}</strong><br />
                            <span className="text-gray-400">📧 {user.email}</span><br />
                            <span className="italic text-indigo-400">🎭 {user.role?.name || 'Brak roli'}</span>
                        </div>

                        <div className="flex gap-4">
                            <Link
                                to={`/uzytkownicy/edytuj/${user.id}`}
                                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                                title="Edytuj"
                            >
                                <PencilIcon className="h-5 w-5 text-yellow-400" />
                            </Link>
                            <button
                                onClick={() => handleDelete(user)}
                                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                                title="Usuń"
                            >
                                <TrashIcon className="h-5 w-5 text-red-500" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}