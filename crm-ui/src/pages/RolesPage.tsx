/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import api from '../services/api';
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
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadRoles();
    }, []);

    // Filtrowanie ról na podstawie wyszukiwania
    useEffect(() => {
        const filtered = roles.filter(role =>
            role.name.toLowerCase().includes(search.toLowerCase()) ||
            (role.description && role.description.toLowerCase().includes(search.toLowerCase()))
        );
        setFilteredRoles(filtered);
    }, [roles, search]);

    const loadRoles = () => {
        setLoading(true);
        api.get('/admin/Roles')
            .then(res => {
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    const rolesArray = (data as any).$values;
                    setRoles(rolesArray);
                    setFilteredRoles(rolesArray);
                } else if (Array.isArray(data)) {
                    setRoles(data);
                    setFilteredRoles(data);
                } else {
                    console.error("Otrzymano nieoczekiwany format danych dla ról:", data);
                    setRoles([]);
                    setFilteredRoles([]);
                }
            })
            .catch(() => setError('Błąd ładowania ról'))
            .finally(() => setLoading(false));
    };

    const { openModal, closeModal, openToast } = useModal();

    const showUsers = (roleId: number, roleName: string) => {
        setLoading(true);
        api.get(`/admin/Roles/${roleId}/users`)
            .then(res => {
                const data = res.data;
                let users: User[] = [];

                if (data && data.users && Array.isArray(data.users)) {
                    users = data.users;
                } else if (data && Array.isArray((data as any).$values)) {
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
                            <div className="mb-4 text-sm text-gray-400">
                                Liczba użytkowników: {users.length}
                            </div>
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
            await api.post('/admin/Roles', {
                name: newRoleName,
                description: newRoleDesc,
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
                    await api.delete(`/admin/Roles/${role.id}`);
                    openToast('Rola została usunięta.', 'success');
                    loadRoles();
                } catch (err: any) {
                    // Backend Python zwraca błąd w polu 'error', nie 'message'
                    const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Nie udało się usunąć roli.';
                    openModal({ type: 'error', title: 'Błąd', message: errorMessage });
                }
            }
        });
    };


    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">🔐 Role użytkowników</h1>

            {loading && <div className="mb-4 text-center">⏳ Ładowanie...</div>}
            {error && <div className="mb-4 p-3 bg-red-600 text-white rounded-lg">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-600 text-white rounded-lg">{success}</div>}

            {/* Dodawanie nowej roli */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">➕ Dodaj nową rolę</h2>
                <form className="flex gap-4" onSubmit={handleAddRole}>
                    <input
                        className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newRoleName}
                        onChange={e => setNewRoleName(e.target.value)}
                        placeholder="Nazwa nowej roli"
                        required
                    />
                    <input
                        className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newRoleDesc}
                        onChange={e => setNewRoleDesc(e.target.value)}
                        placeholder="Opis (opcjonalnie)"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors" type="submit">
                        Dodaj rolę
                    </button>
                </form>
            </div>

            {/* Wyszukiwarka */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Wyszukaj role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Lista ról */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <table className="w-full text-white">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-4 text-left font-semibold">Nazwa roli</th>
                            <th className="p-4 text-left font-semibold">Opis</th>
                            <th className="p-4 text-left font-semibold">Liczba użytkowników</th>
                            <th className="p-4 text-left font-semibold">Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRoles.map(role => (
                            <tr key={role.id} className="border-t border-gray-700 hover:bg-gray-750">
                                <td className="p-4 font-semibold">{role.name}</td>
                                <td className="p-4">{role.description || <span className="text-gray-400">brak</span>}</td>
                                <td className="p-4">{role.usersCount}</td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button
                                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                                            onClick={() => showUsers(role.id, role.name)}
                                        >
                                            👀 Pokaż użytkowników
                                        </button>
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                                            onClick={() => handleEdit(role)}
                                        >
                                            ✏️ Edytuj
                                        </button>
                                        <button
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed"
                                            disabled={role.usersCount > 0}
                                            title={role.usersCount > 0 ? 'Nie można usunąć roli z użytkownikami' : ''}
                                            onClick={() => handleDeleteRole(role)}
                                        >
                                            🗑️ Usuń
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
