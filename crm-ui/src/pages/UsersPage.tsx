/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
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
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const api = import.meta.env.VITE_API_URL;

    const token = localStorage.getItem('token');
    const [roles, setRoles] = useState<Role[]>([]);

    // Dodaj do useEffect (obok ładowania użytkowników)
    useEffect(() => {
        axios.get('${api}/admin/roles', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => setRoles(res.data))
            .catch(err => console.error('❌ Błąd ładowania ról:', err));
    }, []);

    useEffect(() => {
        axios.get(`${api}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                console.log("users response:", res.data);
                const data = res.data;

                // POPRAWKA TUTAJ:
                // Sprawdzamy, czy dane mają format z $values
                if (data && Array.isArray((data as any).$values)) {
                    // Jeśli tak, bierzemy tablicę z tego pola
                    setUsers((data as any).$values);
                } else if (Array.isArray(data)) {
                    // Jeśli nie, a są tablicą, używamy ich bezpośrednio
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
    }, []);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData(user);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await axios.delete('${api}/admin/users/${userToDelete.id}', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            setUserToDelete(null);
        } catch (err) {
            console.error('❌ Błąd usuwania użytkownika:', err);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            await axios.put(
                `${api}/admin/users/${editingUser.id}`,
                {
                    username: formData.username,
                    email: formData.email,
                    roleId: formData.role?.id, // KLUCZOWA ZMIANA
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setUsers(prev =>
                prev.map(u => (u.id === editingUser.id ? { ...u, ...formData } : u))
            );
            setEditingUser(null);
        } catch (err) {
            console.error('❌ Błąd edycji użytkownika:', err);
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
                            <button
                                onClick={() => handleEdit(user)}
                                className="bg-yellow-400 text-black px-3 py-1 rounded"
                            >
                                ✏️ Edytuj
                            </button>
                            <button
                                onClick={() => setUserToDelete(user)}
                                className="bg-red-600 text-white px-3 py-1 rounded"
                            >
                                🗑 Usuń
                            </button>
                        </div>

                        {editingUser?.id === user.id && (
                            <form onSubmit={handleUpdate} className="mt-4 grid gap-2">
                                <input
                                    className="p-2 rounded bg-gray-700 text-white"
                                    value={formData.username || ''}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="Nazwa użytkownika"
                                />
                                <input
                                    className="p-2 rounded bg-gray-700 text-white"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Email"
                                />
                                <select
                                    className="p-2 rounded bg-gray-700 text-white"
                                    value={formData.role?.id || ''}
                                    onChange={e => {
                                        const selected = roles.find(r => r.id === Number(e.target.value));
                                        if (selected) {
                                            setFormData({ ...formData, role: selected });
                                        }
                                    }}

                                >
                                    <option value="">-- Wybierz rolę --</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>

                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-green-600 px-4 py-1 rounded">💾 Zapisz</button>
                                    <button type="button" onClick={() => setEditingUser(null)} className="bg-gray-500 px-4 py-1 rounded">❌ Anuluj</button>
                                </div>
                            </form>
                        )}
                    </li>
                ))}
            </ul>

            {userToDelete && (
                <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-90">
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
