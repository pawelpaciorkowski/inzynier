/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // <--- Krok 1: Import Link
import axios from 'axios';

type Role = {
    id: number;
    name: string;
};

type User = {
    id: number;
    username: string;
    email: string;
    role: Role;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const api = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
        axios.get(`${api}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    setUsers((data as any).$values);
                } else if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error("Niepoprawny format users:", data);
                    setUsers([]);
                }
            })
            .catch(err => {
                console.error('❌ Błąd ładowania użytkowników:', err);
                setUsers([]);
            });
    }, [api, token]); // Dodano zależności do hooka

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await axios.delete(`${api}/admin/users/${userToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            setUserToDelete(null);
        } catch (err) {
            console.error('❌ Błąd usuwania użytkownika:', err);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">👤 Użytkownicy</h1>

            <ul className="space-y-4">
                {users.map(user => (
                    <li key={user.id} className="bg-gray-800 p-4 rounded-md text-white shadow">
                        <strong className="text-xl">{user.username}</strong><br />
                        📧 {user.email}<br />
                        🎭 <span className="italic">{user.role.name}</span><br />

                        <div className="mt-2 flex gap-2">
                            {/* Krok 2: Zamiana <button> na <Link> */}
                            <Link
                                to={`/uzytkownicy/edytuj/${user.id}`}
                                className="bg-yellow-400 text-black px-3 py-1 rounded inline-block text-center"
                            >
                                ✏️ Edytuj
                            </Link>
                            <button
                                onClick={() => setUserToDelete(user)}
                                className="bg-red-600 text-white px-3 py-1 rounded"
                            >
                                🗑 Usuń
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Modal do usuwania pozostaje bez zmian */}
            {userToDelete && (
                <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
                    <div className="bg-gray-800 text-white p-6 rounded-md shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-2">🗑 Potwierdź usunięcie</h2>
                        <p>Czy na pewno chcesz usunąć użytkownika <strong>{userToDelete.username}</strong>?</p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button className="bg-gray-600 px-4 py-2 rounded" onClick={() => setUserToDelete(null)}>Anuluj</button>
                            <button className="bg-red-600 px-4 py-2 rounded" onClick={handleDelete}>Usuń</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}