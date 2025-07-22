
import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UsersIcon, TrashIcon, PlusIcon, ChartBarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';

interface Group {
    id: number;
    name: string;
    description: string | null;
    memberCount: number;
    customerCount: number;
    taskCount: number;
    contractCount: number;
    invoiceCount: number;
    meetingCount: number;
}

export function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [search, setSearch] = useState('');
    const [userRole, setUserRole] = useState<string>('');
    const api = import.meta.env.VITE_API_URL;
    const { openToast } = useModal();

    // Sprawdzenie roli użytkownika
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));

                // Sprawdź różne możliwe klucze roli
                const possibleRoleKeys = [
                    'role',
                    'Role',
                    'ROLE',
                    'userRole',
                    'UserRole',
                    'roles',
                    'Roles',
                    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
                ];
                let foundRole = '';

                for (const key of possibleRoleKeys) {
                    if (payload[key]) {
                        foundRole = payload[key];
                        break;
                    }
                }

                // Jeśli nie znaleziono roli, sprawdź czy jest w claims
                if (!foundRole && payload.claims) {
                    for (const claim of payload.claims) {
                        if (claim.type && claim.type.includes('role')) {
                            foundRole = claim.value;
                            break;
                        }
                    }
                }

                // Tymczasowe rozwiązanie - jeśli nie ma roli, sprawdź ID użytkownika
                if (!foundRole && payload.nameid) {
                    // Jeśli ID użytkownika to 1, prawdopodobnie to admin
                    if (payload.nameid === '1') {
                        foundRole = 'Admin';
                    }
                }

                setUserRole(foundRole);
            } catch (error) {
                console.error('Error parsing token:', error);
                setUserRole('');
            }
        }
    }, []);

    const isAdmin = userRole.toLowerCase() === 'admin' ||
        userRole.toLowerCase() === 'administrator' ||
        userRole.toLowerCase() === 'superadmin';

    const fetchGroups = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            // Użyj endpointu my-groups dla nie-adminów
            const endpoint = isAdmin ? 'groups' : 'groups/my-groups';
            const response = await axios.get(`${api}/${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
            const groupsData = response.data.$values || response.data;
            setGroups(groupsData);
            setFilteredGroups(groupsData);
            setError(null);
        } catch {
            setError("Nie udało się pobrać grup. Spróbuj odświeżyć stronę.");
            openToast('Błąd podczas pobierania grup', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        const filtered = groups.filter(group =>
            group.name.toLowerCase().includes(search.toLowerCase()) ||
            (group.description && group.description.toLowerCase().includes(search.toLowerCase()))
        );
        setFilteredGroups(filtered);
    }, [groups, search]);

    const handleAddGroup = async (e: FormEvent) => {
        e.preventDefault();
        if (!newGroupName) return;

        const token = localStorage.getItem('token');
        try {
            await axios.post(`${api}/groups`, { name: newGroupName, description: newGroupDesc }, { headers: { Authorization: `Bearer ${token}` } });
            setNewGroupName('');
            setNewGroupDesc('');
            fetchGroups();
            openToast('Dział/zespół został utworzony pomyślnie', 'success');
        } catch {
            openToast('Wystąpił błąd podczas tworzenia grupy', 'error');
        }
    };

    const handleDeleteGroup = async (id: number) => {
        if (!confirm("Czy na pewno chcesz usunąć ten dział/zespół? Spowoduje to usunięcie wszystkich powiązań z użytkownikami.")) return;

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${api}/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchGroups();
            openToast('Dział/zespół został usunięty pomyślnie', 'success');
        } catch {
            openToast('Wystąpił błąd podczas usuwania grupy', 'error');
        }
    };

    if (loading) return <p className="p-6 text-gray-400">Ładowanie...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">🏢 Działy/Zespoły</h1>
            {!isAdmin && (
                <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-4 mb-6">
                    <p className="text-blue-200 text-sm">
                        <strong>ℹ️ Informacja:</strong> Widzisz tylko działy/zespoły, do których należysz.
                        Tylko administrator może zarządzać grupami i dodawać nowe działy.
                    </p>
                </div>
            )}

            {/* Formularz dodawania grupy */}
            {isAdmin && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">➕ Dodaj nowy dział/zespół</h2>
                    <form onSubmit={handleAddGroup} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-300">Nazwa działu/zespołu</label>
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={e => setNewGroupName(e.target.value)}
                                placeholder="np. Sprzedaż, Support, Finanse"
                                className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-300">Opis (opcjonalnie)</label>
                            <input
                                type="text"
                                value={newGroupDesc}
                                onChange={e => setNewGroupDesc(e.target.value)}
                                placeholder="np. Zespół sprzedaży i obsługi klienta"
                                className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-md flex justify-center items-center h-10">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Dodaj
                        </button>
                    </form>
                </div>
            )}

            {/* Wyszukiwarka */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Wyszukaj grupy..."
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

            {/* Lista istniejących grup */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map(group => (
                    <div key={group.id} className="bg-gray-800 p-5 rounded-lg shadow-lg flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white">{group.name}</h3>
                            <p className="text-gray-400 text-sm mt-1">{group.description || 'Brak opisu'}</p>

                            {/* Statystyki grupy */}
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center text-gray-500 text-sm">
                                    <UsersIcon className="w-4 h-4 mr-2" />
                                    <span>{group.memberCount} członków</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                    <div>Klienci: {group.customerCount}</div>
                                    <div>Zadania: {group.taskCount}</div>
                                    <div>Kontrakty: {group.contractCount}</div>
                                    <div>Faktury: {group.invoiceCount}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end space-x-2">
                            <Link
                                to={`/grupy/${group.id}`}
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md flex items-center"
                            >
                                <EyeIcon className="w-4 h-4 mr-1" />
                                Szczegóły
                            </Link>
                            <Link
                                to={`/grupy/${group.id}/statystyki`}
                                className="text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md flex items-center"
                            >
                                <ChartBarIcon className="w-4 h-4 mr-1" />
                                Statystyki
                            </Link>
                            {isAdmin && (
                                <button onClick={() => handleDeleteGroup(group.id)} className="p-2 bg-red-800 hover:bg-red-700 rounded-md">
                                    <TrashIcon className="w-4 h-4 text-white" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
