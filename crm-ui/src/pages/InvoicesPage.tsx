/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices, deleteInvoice, type InvoiceListItemDto } from '../services/invoiceService';
import { EyeIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';

export function InvoicesPage() {
    const [invoices, setInvoices] = useState<InvoiceListItemDto[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<InvoiceListItemDto[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useModal();

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const data = await getInvoices();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (data && Array.isArray((data as any).$values)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setInvoices((data as any).$values);
                } else if (Array.isArray(data)) {
                    setInvoices(data);
                } else {
                    setInvoices([]);
                }
                setFilteredInvoices(Array.isArray(data) ? data : (data as { $values: InvoiceListItemDto[] }).$values || []);
                setError(null);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setError('Nie udało się pobrać faktur. Spróbuj ponownie później.');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    // Filtrowanie faktur na podstawie wyszukiwania
    useEffect(() => {
        const filtered = invoices.filter(invoice =>
            invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            invoice.customerName.toLowerCase().includes(search.toLowerCase()) ||
            invoice.totalAmount.toString().includes(search)
        );
        setFilteredInvoices(filtered);
    }, [invoices, search]);

    const handleDelete = (invoiceId: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć tę fakturę? Tej operacji nie można cofnąć.',
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await deleteInvoice(invoiceId);
                    setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
                } catch (err) {
                    setError('Nie udało się usunąć faktury.');
                }
            },
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">🧾 Faktury</h1>
                <Link to="/faktury/dodaj">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                        + Dodaj nową fakturę
                    </button>
                </Link>
            </div>

            {loading && <p className="text-center text-gray-400">Ładowanie danych...</p>}
            {error && <p className="text-center text-red-500 bg-red-900/50 p-3 rounded-md">{error}</p>}

            {!loading && !error && (
                <>
                    {/* Wyszukiwarka */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Wyszukaj faktury..."
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

                    <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal text-white">
                            {/* ... (<thead> pozostaje bez zmian) ... */}
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">
                                        Numer faktury
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">
                                        Klient
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">
                                        Data wystawienia
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">
                                        Kwota
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-center text-xs font-semibold uppercase tracking-wider">
                                        Akcje
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length > 0 ? (
                                    filteredInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-700">
                                            <td className="px-5 py-4 border-b border-gray-700">{invoice.invoiceNumber}</td>
                                            <td className="px-5 py-4 border-b border-gray-700">{invoice.customerName}</td>
                                            <td className="px-5 py-4 border-b border-gray-700">{new Date(invoice.issuedAt).toLocaleDateString()}</td>
                                            <td className="px-5 py-4 border-b border-gray-700">{invoice.totalAmount.toFixed(2)} PLN</td>
                                            {/* ZMIANA TUTAJ: Przyciski zamienione na ikony */}
                                            <td className="px-5 py-4 border-b border-gray-700 text-center">
                                                <div className="flex justify-center gap-4">
                                                    <Link to={`/faktury/${invoice.id}`} title="Szczegóły">
                                                        <EyeIcon className="w-5 h-5 text-gray-400 hover:text-indigo-400 transition-colors" />
                                                    </Link>
                                                    <Link to={`/faktury/edytuj/${invoice.id}`} title="Edytuj">
                                                        <PencilIcon className="w-5 h-5 text-yellow-400 hover:text-yellow-300 transition-colors" />
                                                    </Link>
                                                    <button onClick={() => handleDelete(invoice.id)} title="Usuń">
                                                        <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-500">
                                            {search ? 'Brak faktur pasujących do wyszukiwania.' : 'Brak faktur do wyświetlenia.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}