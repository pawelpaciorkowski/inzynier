
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, ChartBarIcon, UserPlusIcon, XCircleIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';

// --- INTERFEJSY DANYCH ---
interface User {
    id: number;
    username: string;
    email: string;
}

interface Customer {
    id: number;
    name: string;
    email: string;
}

interface GroupDetails {
    id: number;
    name: string;
    description: string | null;
    members: User[];
    assignedCustomers: Customer[];
}

export function GroupDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State dla modali
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const api = import.meta.env.VITE_API_URL;
    const { openToast } = useModal();

    // --- POBIERANIE DANYCH ---
    const fetchAllData = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            // Pobieramy wszystkie dane równolegle
            const [groupResponse, usersResponse, customersResponse] = await Promise.all([
                axios.get(`${api}/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${api}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${api}/customers`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            // Przetwarzanie danych grupy
            const groupData = groupResponse.data;
            if (groupData.members && groupData.members.$values) groupData.members = groupData.members.$values;
            if (groupData.assignedCustomers && groupData.assignedCustomers.$values) groupData.assignedCustomers = groupData.assignedCustomers.$values;
            setGroup(groupData);

            // Przetwarzanie danych użytkowników
            const allUsersData = usersResponse.data.$values || usersResponse.data;
            setAllUsers(allUsersData);

            // Przetwarzanie danych klientów
            const allCustomersData = customersResponse.data.$values || customersResponse.data;
            setAvailableCustomers(allCustomersData.filter((c: any) => c.assignedGroupId === null));

            setError(null);
        } catch (err) {
            console.error(err);
            setError("Wystąpił błąd podczas ładowania danych. Odśwież stronę.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [id]);

    // --- AKCJE UŻYTKOWNIKÓW ---
    const handleAddMember = async () => {
        if (!selectedUserId || !group) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${api}/groups/${group.id}/members/${selectedUserId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            await fetchAllData();
            setShowAddMemberModal(false);
            setSelectedUserId(null);
            openToast('Użytkownik dodany do grupy', 'success');
        } catch { openToast('Błąd podczas dodawania użytkownika', 'error'); }
    };

    const handleRemoveMember = async (userId: number) => {
        if (!group) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${api}/groups/${group.id}/members/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            await fetchAllData();
            openToast('Użytkownik usunięty z grupy', 'success');
        } catch { openToast('Błąd podczas usuwania użytkownika', 'error'); }
    };

    // --- AKCJE KLIENTÓW ---
    const handleAddCustomer = async () => {
        if (!selectedCustomerId || !group) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${api}/groups/${group.id}/customers/${selectedCustomerId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            await fetchAllData();
            setShowAddCustomerModal(false);
            setSelectedCustomerId(null);
            openToast('Klient przypisany do grupy', 'success');
        } catch { openToast('Błąd podczas przypisywania klienta', 'error'); }
    };

    const handleRemoveCustomer = async (customerId: number) => {
        if (!group) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${api}/groups/${group.id}/customers/${customerId}`, { headers: { Authorization: `Bearer ${token}` } });
            await fetchAllData();
            openToast('Klient usunięty z grupy', 'success');
        } catch { openToast('Błąd podczas usuwania klienta', 'error'); }
    };

    // --- RENDEROWANIE ---
    if (loading) return <p className="p-6 text-gray-400">Ładowanie...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;
    if (!group) return <p className="p-6 text-gray-400">Nie znaleziono grupy.</p>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">{group.name}</h1>
                    <p className="text-gray-400 mt-1">{group.description || 'Brak opisu'}</p>
                </div>
                <Link to={`/grupy/${id}/statystyki`} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    Statystyki
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SEKCJA CZŁONKÓW (UŻYTKOWNICY) */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Członkowie grupy ({group.members.length})</h3>
                        <button onClick={() => setShowAddMemberModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm flex items-center">
                            <UserPlusIcon className="w-4 h-4 mr-1" />
                            Dodaj członka
                        </button>
                    </div>
                    <div className="space-y-2">
                        {group.members.map(member => (
                            <div key={member.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                <div>
                                    <div className="text-white font-medium">{member.username}</div>
                                    <div className="text-gray-400 text-sm">{member.email}</div>
                                </div>
                                <button onClick={() => handleRemoveMember(member.id)} className="p-2 bg-red-800 hover:bg-red-700 rounded-md">
                                    <XCircleIcon className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        ))}
                        {group.members.length === 0 && <p className="text-gray-400 text-center py-4">Brak członków w grupie.</p>}
                    </div>
                </div>

                {/* SEKCJA KLIENTÓW */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Przypisani Klienci ({group.assignedCustomers.length})</h3>
                        <button onClick={() => setShowAddCustomerModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center">
                            <UsersIcon className="w-4 h-4 mr-1" />
                            Dodaj klienta
                        </button>
                    </div>
                    <div className="space-y-2">
                        {group.assignedCustomers.map(customer => (
                            <div key={customer.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                <div>
                                    <div className="text-white font-medium">{customer.name}</div>
                                    <div className="text-gray-400 text-sm">{customer.email}</div>
                                </div>
                                <button onClick={() => handleRemoveCustomer(customer.id)} className="p-2 bg-red-800 hover:bg-red-700 rounded-md">
                                    <XCircleIcon className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        ))}
                        {group.assignedCustomers.length === 0 && <p className="text-gray-400 text-center py-4">Brak przypisanych klientów.</p>}
                    </div>
                </div>
            </div>

            {/* MODAL DODAWANIA CZŁONKA (UŻYTKOWNIKA) */}
            {showAddMemberModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Dodaj członka do grupy</h3>
                        <select
                            value={selectedUserId || ''}
                            onChange={(e) => setSelectedUserId(Number(e.target.value))}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white mb-4"
                        >
                            <option value="">Wybierz użytkownika</option>
                            {allUsers
                                .filter(user => !group?.members.some(member => member.id === user.id))
                                .map(user => <option key={user.id} value={user.id}>{user.username}</option>)
                            }
                        </select>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowAddMemberModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md">Anuluj</button>
                            <button onClick={handleAddMember} disabled={!selectedUserId} className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:opacity-50">Dodaj</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DODAWANIA KLIENTA */}
            {showAddCustomerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Dodaj klienta do grupy</h3>
                        <select
                            value={selectedCustomerId || ''}
                            onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white mb-4"
                        >
                            <option value="">Wybierz klienta</option>
                            {availableCustomers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                        </select>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowAddCustomerModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md">Anuluj</button>
                            <button onClick={handleAddCustomer} disabled={!selectedCustomerId} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">Dodaj</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
