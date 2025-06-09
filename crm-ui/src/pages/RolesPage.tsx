/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axios from 'axios';

type Role = {
    id: number;
    name: string;
    usersCount: number;
    description?: string;
};

type User = {
    id: number;
    username: string;
    email: string;
};

export function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [usersInRole, setUsersInRole] = useState<User[]>([]);
    const [showUsersModal, setShowUsersModal] = useState<number | null>(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');
    const [editRole, setEditRole] = useState<Role | null>(null);
    const [editRoleName, setEditRoleName] = useState('');
    const [editRoleDesc, setEditRoleDesc] = useState('');
    const [deleteRole, setDeleteRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const api = import.meta.env.VITE_API_URL;

    const token = localStorage.getItem('token');

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = () => {
        setLoading(true);
        axios.get(`${api}/admin/roles`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    setRoles((data as any).$values);
                } else if (Array.isArray(data)) {
                    setRoles(data);
                } else {
                    console.error("Otrzymano nieoczekiwany format danych dla ról:", data);
                    setRoles([]);
                }
            })
            .catch(() => setError('Błąd ładowania ról'))
            .finally(() => setLoading(false));
    };

    const showUsers = (roleId: number) => {
        setLoading(true);
        axios.get(`${api}/admin/roles/${roleId}/users`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    setUsersInRole((data as any).$values);
                } else if (Array.isArray(data)) {
                    setUsersInRole(data);
                } else {
                    console.error("Otrzymano nieoczekiwany format danych dla użytkowników w roli:", data);
                    setUsersInRole([]);
                }
                setShowUsersModal(roleId);
            })
            .catch(() => setError('Błąd ładowania użytkowników tej roli'))
            .finally(() => setLoading(false));
    };
    const handleAddRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await axios.post(`${api}/admin/roles`, {
                name: newRoleName,
                description: newRoleDesc,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Dodano nową rolę!');
            setNewRoleName('');
            setNewRoleDesc('');
            loadRoles();
        } catch {
            setError('Błąd dodawania roli');
        }
    };

    const handleEdit = (role: Role) => {
        setEditRole(role);
        setEditRoleName(role.name);
        setEditRoleDesc(role.description || '');
    };

    const handleEditRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editRole) return;
        setError(null);
        try {
            await axios.put(`${api}/admin/roles/${editRole.id}`, {
                name: editRoleName,
                description: editRoleDesc,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Zmieniono nazwę roli');
            setEditRole(null);
            loadRoles();
        } catch {
            setError('Błąd edycji roli');
        }
    };

    const handleDeleteRole = async () => {
        if (!deleteRole) return;
        setError(null);
        try {
            await axios.delete(`${api}/admin/roles/${deleteRole.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Usunięto rolę');
            setDeleteRole(null);
            loadRoles();
        } catch {
            setError('Błąd usuwania roli');
        }
    };


    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">🔐 Role użytkowników</h1>

            {loading && <div className="mb-4">⏳ Ładowanie...</div>}
            {error && <div className="mb-4 p-2 bg-red-700 text-white rounded">{error}</div>}
            {success && <div className="mb-4 p-2 bg-green-700 text-white rounded">{success}</div>}

            {/* Dodawanie nowej roli */}
            <form className="mb-6 flex gap-2" onSubmit={handleAddRole}>
                <input
                    className="p-2 rounded bg-gray-700 text-white"
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                    placeholder="Nazwa nowej roli"
                    required
                />
                <input
                    className="p-2 rounded bg-gray-700 text-white"
                    value={newRoleDesc}
                    onChange={e => setNewRoleDesc(e.target.value)}
                    placeholder="Opis (opcjonalnie)"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                    ➕ Dodaj rolę
                </button>
            </form>

            {/* Lista ról */}
            <table className="w-full bg-gray-800 text-white rounded shadow mb-8">
                <thead>
                    <tr>
                        <th className="p-3">Nazwa roli</th>
                        <th className="p-3">Opis</th>
                        <th className="p-3">Liczba użytkowników</th>
                        <th className="p-3">Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map(role => (
                        <tr key={role.id} className="border-t border-gray-700">
                            <td className="p-3 font-semibold">{role.name}</td>
                            <td className="p-3">{role.description || <span className="text-gray-400">brak</span>}</td>
                            <td className="p-3">{role.usersCount}</td>
                            <td className="p-3 flex gap-2">
                                <button className="bg-gray-700 px-2 py-1 rounded" onClick={() => showUsers(role.id)}>
                                    👀 Pokaż użytkowników
                                </button>
                                <button className="bg-yellow-400 text-black px-2 py-1 rounded" onClick={() => handleEdit(role)}>
                                    ✏️ Edytuj
                                </button>
                                <button
                                    className="bg-red-600 text-white px-2 py-1 rounded"
                                    disabled={role.usersCount > 0}
                                    title={role.usersCount > 0 ? 'Nie można usunąć roli z użytkownikami' : ''}
                                    onClick={() => setDeleteRole(role)}
                                >
                                    🗑 Usuń
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showUsersModal !== null && (
                <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-90">
                    <div className="bg-gray-900 text-white p-8 rounded shadow max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">👥 Użytkownicy roli</h2>
                        {usersInRole.length === 0 ? (
                            <div>Brak użytkowników.</div>
                        ) : (
                            <ul className="space-y-1">
                                {usersInRole.map(u => (
                                    <li key={u.id} className="border-b border-gray-700 py-1">
                                        <strong>{u.username}</strong> <span className="text-gray-400">({u.email})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button className="mt-6 bg-gray-700 px-4 py-1 rounded" onClick={() => setShowUsersModal(null)}>
                            Zamknij
                        </button>
                    </div>
                </div>
            )}

            {/* Modal edycji */}
            {editRole && (
                <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-90">
                    <div className="bg-gray-900 text-white p-8 rounded shadow max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">✏️ Edytuj rolę</h2>
                        <form className="grid gap-4" onSubmit={handleEditRole}>
                            <input
                                className="p-2 rounded bg-gray-700 text-white"
                                value={editRoleName}
                                onChange={e => setEditRoleName(e.target.value)}
                                placeholder="Nazwa roli"
                                required
                            />
                            <input
                                className="p-2 rounded bg-gray-700 text-white"
                                value={editRoleDesc}
                                onChange={e => setEditRoleDesc(e.target.value)}
                                placeholder="Opis (opcjonalnie)"
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="bg-green-600 px-4 py-1 rounded">💾 Zapisz</button>
                                <button type="button" onClick={() => setEditRole(null)} className="bg-gray-500 px-4 py-1 rounded">❌ Anuluj</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteRole && (
                <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-90">
                    <div className="bg-gray-900 text-white p-8 rounded shadow max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">🗑 Potwierdź usunięcie</h2>
                        <p>Czy na pewno chcesz usunąć rolę <strong>{deleteRole.name}</strong>?</p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button className="bg-gray-600 px-4 py-2 rounded" onClick={() => setDeleteRole(null)}>Anuluj</button>
                            <button
                                className="bg-red-600 px-4 py-2 rounded"
                                onClick={handleDeleteRole}
                                disabled={deleteRole.usersCount > 0}
                            >
                                Usuń
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
