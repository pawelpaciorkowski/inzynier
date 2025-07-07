// Plik: crm-ui/src/pages/ClientsPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // Używamy nowej instancji axios
import { useModal } from '../context/ModalContext'; // Importujemy hooka do modali
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

// Definicja typu dla klienta
interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface ApiResponse<T> {
    $values: T[];
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const { openModal } = useModal(); // Używamy globalnego modala

    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get<ApiResponse<Client> | Client[]>('/Customers');
            const data = '$values' in response.data ? response.data.$values : response.data;
            setClients(data);
        } catch (error) {
            console.error("Błąd pobierania klientów:", error);
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się załadować listy klientów.' });
        } finally {
            setLoading(false);
        }
    }, [openModal]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleDelete = (client: Client) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: `Czy na pewno chcesz usunąć klienta "${client.name}"? Spowoduje to usunięcie wszystkich powiązanych danych (faktur, umów itd.).`,
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await api.delete(`/Customers/${client.id}`);
                    openModal({ type: 'success', title: 'Sukces', message: 'Klient został pomyślnie usunięty.' });
                    fetchClients(); // Odśwież listę
                } catch {
                    openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się usunąć klienta.' });
                }
            }
        });
    };

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

            <ul className="space-y-4">
                {clients.map(client => (
                    <li key={client.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <p className="text-xl font-semibold">{client.name}</p>
                            <p className="text-gray-400">{client.email}</p>
                            <p className="text-gray-400">{client.phone}</p>
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
            {/* Usunęliśmy stąd lokalny, zduplikowany modal */}
        </div>
    );
}