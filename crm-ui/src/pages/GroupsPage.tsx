import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { UsersIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Group {
    id: number;
    name: string;
    description: string | null;
    memberCount: number;
}

export function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [search, setSearch] = useState('');
    const api = import.meta.env.VITE_API_URL;

    const fetchGroups = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${api}/groups`, { headers: { Authorization: `Bearer ${token}` } });
            const groupsData = response.data.$values || response.data;
            setGroups(groupsData);
            setFilteredGroups(groupsData);
        } catch {
            setError("Nie udało się pobrać grup lub nie masz uprawnień.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    // Filtrowanie grup na podstawie wyszukiwania
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
            fetchGroups(); // Odśwież listę
        } catch {
            alert("Wystąpił błąd podczas dodawania grupy.");
        }
    };

    const handleDeleteGroup = async (id: number) => {
        if (!confirm("Czy na pewno chcesz usunąć tę grupę? Spowoduje to usunięcie wszystkich powiązań z użytkownikami.")) return;

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${api}/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchGroups(); // Odśwież listę
        } catch {
            alert("Wystąpił błąd podczas usuwania grupy.");
        }
    }

    if (loading) return <p className="p-6 text-gray-400">Ładowanie...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Grupy użytkowników</h1>

            {/* Formularz dodawania grupy */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl text-white font-semibold mb-4">Stwórz nową grupę</h2>
                <form onSubmit={handleAddGroup} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-300">Nazwa grupy</label>
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            placeholder="np. Sprzedawcy"
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
                            placeholder="np. Dostęp do modułu sprzedaży"
                            className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-md flex justify-center items-center h-10">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Dodaj
                    </button>
                </form>
            </div>

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
                            <div className="flex items-center text-gray-500 mt-4">
                                <UsersIcon className="w-5 h-5 mr-2" />
                                <span>{group.memberCount} członków</span>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 py-1 px-3 rounded-md">Zarządzaj</button>
                            <button onClick={() => handleDeleteGroup(group.id)} className="p-2 bg-red-800 hover:bg-red-700 rounded-md">
                                <TrashIcon className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}