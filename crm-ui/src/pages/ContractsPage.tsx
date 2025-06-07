/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Plik: crm-ui/src/pages/ContractsPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext'; // Import useModal

interface Contract {
    id: number;
    title: string;
    signedAt: string;
    customerName: string;
}

export function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useModal(); // Pobierz funkcję openModal

    const fetchContracts = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('/api/contracts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;
            if (data && Array.isArray((data as any).$values)) {
                setContracts((data as any).$values);
            } else if (Array.isArray(data)) {
                setContracts(data);
            }
        } catch (err) {
            setError('Nie udało się pobrać kontraktów.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const handleDelete = (contract: Contract) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: `Czy na pewno chcesz usunąć kontrakt "${contract.title}"?`,
            confirmText: 'Usuń',
            onConfirm: async () => {
                const token = localStorage.getItem('token');
                try {
                    await axios.delete(`/api/contracts/${contract.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    fetchContracts(); // Odśwież listę po usunięciu
                } catch (err) {
                    openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się usunąć kontraktu.' });
                }
            }
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">📑 Kontrakty</h1>
                <Link to="/kontrakty/dodaj">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                        + Dodaj kontrakt
                    </button>
                </Link>
            </div>

            {loading && <p className="text-center text-gray-400">Ładowanie danych...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal text-white">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Tytuł</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Klient</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Data podpisania</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-center text-xs font-semibold uppercase tracking-wider">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.length > 0 ? (
                                contracts.map((contract) => (
                                    <tr key={contract.id} className="hover:bg-gray-700">
                                        <td className="px-5 py-4 border-b border-gray-700">{contract.title}</td>
                                        <td className="px-5 py-4 border-b border-gray-700">{contract.customerName}</td>
                                        <td className="px-5 py-4 border-b border-gray-700">{new Date(contract.signedAt).toLocaleDateString()}</td>
                                        <td className="px-5 py-4 border-b border-gray-700 text-center">
                                            <div className="flex justify-center gap-4">
                                                <Link to={`/kontrakty/edytuj/${contract.id}`} title="Edytuj">
                                                    <PencilIcon className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                                                </Link>
                                                <button onClick={() => handleDelete(contract)} title="Usuń">
                                                    <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">
                                        Brak kontraktów do wyświetlenia.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}