import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useModal } from '../context/ModalContext';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

type User = {
    id: number;
    username: string;
    email: string;
    role: string; // Zmieniono typ roli na string
};

type ApiResponse = {
    $values: User[];
}

export default function UsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const { openModal, openToast } = useModal();
    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<ApiResponse | User[]>('/admin/users');
            const data = '$values' in res.data ? res.data.$values : res.data;
            setUsers(data);
            setFilteredUsers(data);
        } catch (err) {
            console.error('Błąd ładowania użytkowników:', err);
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się załadować użytkowników.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user =>
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.role.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [users, search]);

    if (user?.role === 'Sprzedawca') {
        return <div className="p-6 text-center text-red-500">Brak dostępu do tej sekcji.</div>;
    }

    // ✅ This is the corrected delete handler
    const handleDelete = (user: User) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: `Czy na pewno chcesz usunąć użytkownika "${user.username}"?`,
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/users/${user.id}`);
                    openToast('Użytkownik usunięty.', 'success');
                    fetchUsers();
                } catch (err) {
                    console.error('Błąd usuwania użytkownika:', err);
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

            {/* Wyszukiwarka */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Wyszukaj użytkowników..."
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

            <ul className="space-y-4">
                {filteredUsers.map(user => (
                    <li key={user.id} className="bg-gray-800 p-4 rounded-md text-white shadow flex justify-between items-center">
                        <div>
                            <strong className="text-xl">{user.username}</strong><br />
                            <span className="text-gray-400">📧 {user.email}</span><br />
                            <span className="italic text-indigo-400">🎭 {user.role || 'Brak roli'}</span>
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