/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';
import { EditRoleModal } from '../components/EditRoleModal';

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
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');
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

    const { openModal, closeModal } = useModal();

    const showUsers = (roleId: number, roleName: string) => {
        setLoading(true);
        axios.get(`${api}/admin/roles/${roleId}/users`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                const data = res.data;
                let users: User[] = [];
                if (data && Array.isArray((data as any).$values)) {
                    users = (data as any).$values;
                } else if (Array.isArray(data)) {
                    users = data;
                } else {
                    console.error("Otrzymano nieoczekiwany format danych dla użytkowników w roli:", data);
                }
                openModal({
                    type: 'custom',
                    content: (
                        <div className="bg-gray-900 text-white p-8 rounded shadow max-w-md w-full">
                            <h2 className="text-xl font-bold mb-4">👥 Użytkownicy roli: {roleName}</h2>
                            {users.length === 0 ? (
                                <div>Brak użytkowników.</div>
                            ) : (
                                <ul className="space-y-1">
                                    {users.map(u => (
                                        <li key={u.id} className="border-b border-gray-700 py-1">
                                            <strong>{u.username}</strong> <span className="text-gray-400">({u.email})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button className="mt-6 bg-gray-700 px-4 py-1 rounded" onClick={closeModal}>
                                Zamknij
                            </button>
                        </div>
                    ),
                });
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
        openModal({
            type: 'custom',
            content: (
                <EditRoleModal
                    role={role}
                    onSaveSuccess={loadRoles}
                    onClose={closeModal}
                />
            ),
        });
    };

    

    const handleDeleteRole = (role: Role) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: `Czy na pewno chcesz usunąć rolę ${role.name}?`,
            onConfirm: async () => {
                try {
                    await axios.delete(`${api}/admin/roles/${role.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    openModal({ type: 'success', title: 'Sukces', message: 'Rola została usunięta.' });
                    loadRoles();
                } catch (err: any) {
                    openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Nie udało się usunąć roli.' });
                }
            }
        });
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
                                <button className="bg-gray-700 px-2 py-1 rounded" onClick={() => showUsers(role.id, role.name)}>
                                    👀 Pokaż użytkowników
                                </button>
                                <button className="bg-yellow-400 text-black px-2 py-1 rounded" onClick={() => handleEdit(role)}>
                                    ✏️ Edytuj
                                </button>
                                <button
                                    className="bg-red-600 text-white px-2 py-1 rounded"
                                    disabled={role.usersCount > 0}
                                    title={role.usersCount > 0 ? 'Nie można usunąć roli z użytkownikami' : ''}
                                    onClick={() => handleDeleteRole(role)}
                                >
                                    🗑 Usuń
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            
        </div>
    );
}
