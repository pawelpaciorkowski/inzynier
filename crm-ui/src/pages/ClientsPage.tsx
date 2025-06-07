/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Plik: crm-ui/src/pages/ClientsPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';

type Customer = {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    createdAt: string;
};

export default function ClientsPage() {
    const [clients, setClients] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const api = import.meta.env.VITE_API_URL;
    const { openModal } = useModal();

    const fetchClients = async () => {
        const token = localStorage.getItem('token');
        try {
            setLoading(true);
            const res = await axios.get(`${api}/customers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.data;
            if (data && Array.isArray((data as any).$values)) {
                setClients((data as any).$values);
            } else if (Array.isArray(data)) {
                setClients(data);
            }
        } catch (err) {
            setError('Nie udało się pobrać listy klientów.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    // To jest Twoja funkcja handleDelete
    // To jest Twoja funkcja handleDelete
    const handleDelete = (customer: Customer) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: `Czy na pewno chcesz usunąć klienta "${customer.name}"?`,
            confirmText: 'Usuń',
            onConfirm: async () => {
                const token = localStorage.getItem('token');
                try {
                    await axios.delete(`${api}/customers/${customer.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    fetchClients();
                } catch (err) {
                    openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się usunąć klienta.' });
                }
            }
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">📋 Klienci</h1>
                <Link to="/klienci/dodaj">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                        + Dodaj klienta
                    </button>
                </Link>
            </div>

            {loading && <p className="text-center text-gray-400">Ładowanie...</p>}
            {error && <p className="text-center text-red-500 bg-red-900/50 p-3 rounded-md">{error}</p>}

            {!loading && !error && (
                <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal text-white">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Nazwa / Imię i nazwisko</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Telefon</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Firma</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-center text-xs font-semibold uppercase tracking-wider">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length > 0 ? (
                                clients.map(client => (
                                    <tr key={client.id} className="hover:bg-gray-700">
                                        <td className="px-5 py-4 border-b border-gray-700 font-medium">{client.name}</td>
                                        <td className="px-5 py-4 border-b border-gray-700">{client.email}</td>
                                        <td className="px-5 py-4 border-b border-gray-700">{client.phone}</td>
                                        <td className="px-5 py-4 border-b border-gray-700">{client.company}</td>
                                        <td className="px-5 py-4 border-b border-gray-700 text-center">
                                            <div className="flex justify-center gap-4">
                                                <Link to={`/klienci/edytuj/${client.id}`} title="Edytuj">
                                                    <PencilIcon className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                                                </Link>
                                                <button onClick={() => handleDelete(client)} title="Usuń">
                                                    <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">Brak klientów w bazie.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}