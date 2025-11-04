// Plik: crm-ui/src/pages/ClientsPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // Używamy nowej instancji axios
import { useModal } from '../context/ModalContext'; // Importujemy hooka do modali
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Pagination from '../components/Pagination';

// Definicja typu dla klienta
interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    company?: string;
    address?: string;
    nip?: string;
    representative?: { id: number; username: string; email: string; role?: string } | null;
    representativeUserId?: number | null;
    createdAt?: string;
    customerTags?: Array<{
        tagId: number;
        tag: {
            id: number;
            name: string;
            color?: string;
        };
    }>;
}

interface ApiResponse<T> {
    $values: T[];
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const { openModal, openToast } = useModal(); // Używamy globalnego modala
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 10;

    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get<ApiResponse<Client> | Client[]>('/Customers/');
            const data = '$values' in response.data ? response.data.$values : response.data;
            const clientsArray = Array.isArray(data) ? data : [];
            const validClients = clientsArray.filter(client => client && client.name);
            // Sortowanie po stronie frontu na wypadek, gdyby backend nie gwarantował
            const sorted = [...validClients].sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return 0;
            });
            setClients(sorted);
        } catch (error) {
            console.error("Błąd pobierania klientów:", error);

            // Sprawdź czy to błąd autoryzacji
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosErr = error as { response?: { status?: number } };
                const status = axiosErr.response?.status;

                if (status === 401) {
                    openModal({
                        type: 'error',
                        title: 'Błąd autoryzacji',
                        message: 'Sesja wygasła. Zaloguj się ponownie.',
                        onConfirm: () => {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }
                    });
                    return;
                }
            }

            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się załadować listy klientów.' });
        } finally {
            setLoading(false);
        }
    }, []); // Usunięto openModal z zależności

    useEffect(() => {
        fetchClients();
    }, []); // Usunięto fetchClients z zależności

    const handleDelete = (client: Client) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: `Czy na pewno chcesz usunąć klienta "${client.name}"? Spowoduje to usunięcie wszystkich powiązanych danych (faktur, umów itd.).`,
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await api.delete(`/Customers/${client.id}`);
                    openToast('Klient został pomyślnie usunięty.', 'success');
                    fetchClients(); // Odśwież listę
                } catch {
                    openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się usunąć klienta.' });
                }
            }
        });
    };

    // Filtrowanie klientów po wyszukiwaniu
    const filteredClients = clients.filter(client => {
        const q = search.toLowerCase();
        return (
            (client.name ?? '').toLowerCase().includes(q) ||
            (client.email ?? '').toLowerCase().includes(q) ||
            (client.company ?? '').toLowerCase().includes(q) ||
            (client.phone ?? '').toLowerCase().includes(q) ||
            (client.address ?? '').toLowerCase().includes(q) ||
            (client.nip ?? '').toLowerCase().includes(q) ||
            (client.representative?.username ?? '').toLowerCase().includes(q) ||
            (client.representative?.email ?? '').toLowerCase().includes(q)
        );
    });

    // PAGINACJA
    const totalPages = Math.ceil(filteredClients.length / resultsPerPage);
    const paginatedClients = filteredClients.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

    // Resetuj stronę do 1 po zmianie wyszukiwania
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    if (loading) return <p className="p-6 text-white text-center">Ładowanie...</p>;

    return (
        <div className="p-6 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">👥 Klienci</h1>
                <Link to="/klienci/dodaj">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Dodaj klienta
                    </button>
                </Link>
            </div>
            {/* WYSZUKIWARKA */}
            <div className="mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Wyszukaj klienta po imieniu, emailu, firmie..."
                    className="w-full md:w-1/2 p-2 rounded bg-gray-700 text-white border border-gray-600"
                />
            </div>
            <ul className="space-y-4">
                {paginatedClients.map(client => (
                    <li key={client.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <p className="text-xl font-semibold">{client.name}</p>
                            <p className="text-gray-400">{client.email}</p>
                            <p className="text-gray-400">{client.phone}</p>
                            {client.company && <p className="text-gray-400">Firma: {client.company}</p>}
                            {client.address && <p className="text-gray-400">Adres: {client.address}</p>}
                            {client.nip && <p className="text-gray-400">NIP: {client.nip}</p>}
                            {client.representative && <p className="text-gray-400">Przedstawiciel: {client.representative.username} ({client.representative.email})</p>}
                            {client.createdAt && <p className="text-gray-400 text-xs">Dodano: {new Date(client.createdAt.endsWith('Z') ? client.createdAt : client.createdAt + 'Z').toLocaleString('pl-PL')}</p>}

                            {/* Wyświetlanie tagów */}
                            {client.customerTags && client.customerTags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {client.customerTags.map((customerTag) => (
                                        <span
                                            key={customerTag.tagId}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: customerTag.tag.color || '#3B82F6',
                                                color: 'white'
                                            }}
                                        >
                                            {customerTag.tag.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link to={`/klienci/edytuj/${client.id}`} className="p-2 text-gray-400 hover:text-yellow-400 transition-colors" title="Edytuj">
                                <PencilIcon className="h-5 w-5" />
                            </Link>
                            <button onClick={() => handleDelete(client)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Usuń">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}