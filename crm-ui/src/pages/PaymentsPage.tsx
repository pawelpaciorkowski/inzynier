/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { CreditCardIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useModal } from '../context/ModalContext';
import Pagination from '../components/Pagination';

interface Payment {
    id: number;
    invoiceId: number;
    invoiceNumber: string;
    paidAt: string;
    amount: number;
}

export function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal, openToast } = useModal();
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 10;

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<any>('/api/Payments');
            const paymentsData = response.data.$values || response.data;
            setPayments(paymentsData);
            setFilteredPayments(paymentsData);
        } catch (err: any) {
            setError('Nie udało się pobrać listy płatności.');
            console.error('Błąd pobierania płatności:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // Filtrowanie płatności na podstawie wyszukiwania
    useEffect(() => {
        const filtered = payments.filter(payment =>
            payment.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            payment.amount.toString().includes(search) ||
            payment.id.toString().includes(search)
        );
        setFilteredPayments(filtered);
    }, [payments, search]);

    // PAGINACJA
    const totalPages = Math.ceil(filteredPayments.length / resultsPerPage);
    const paginatedPayments = filteredPayments.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

    // Resetuj stronę do 1 po zmianie wyszukiwania
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const handleDeletePayment = async (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć tę płatność? Tej operacji nie można cofnąć.',
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/Payments/${id}`);
                    fetchPayments(); // Odśwież listę po usunięciu
                    openToast('Płatność została pomyślnie usunięta.', 'success');
                } catch (err) {
                    alert('Nie udało się usunąć płatności.');
                    console.error('Błąd usuwania płatności:', err);
                }
            },
        });
    };

    if (loading) {
        return (
            <div className="p-6 text-white flex justify-center items-center h-screen">
                <p>Ładowanie płatności...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-white flex justify-center items-center h-screen">
                <p className="text-red-500">Błąd: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">💳 Płatności</h1>
                <Link
                    to="/platnosci/dodaj"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Dodaj Płatność
                </Link>
            </div>


            {/* Wyszukiwarka */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Wyszukaj płatności..."
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
            {paginatedPayments.length === 0 ? (
                <div className="bg-gray-800 p-10 rounded-lg text-center flex flex-col items-center shadow-lg">
                    <CreditCardIcon className="w-16 h-16 text-blue-400 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Brak Płatności</h2>
                    <p className="text-gray-400 max-w-md">
                        Nie znaleziono żadnych płatności. Dodaj pierwszą płatność, aby
                        rozpocząć.
                    </p>
                </div>
            ) : (
                <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Numer Faktury
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Data Płatności
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Kwota
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Akcje
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-700">
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                                        {payment.id}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                                        <Link
                                            to={`/faktury/${payment.invoiceId}`}
                                            className="text-blue-400 hover:underline"
                                        >
                                            {payment.invoiceNumber}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                                        {format(new Date(payment.paidAt), "dd.MM.yyyy HH:mm", {
                                            locale: pl,
                                        })}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                                        {payment.amount.toFixed(2)} PLN
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                                        <Link
                                            to={`/platnosci/edytuj/${payment.id}`}
                                            className="text-yellow-500 hover:text-yellow-600 mr-3"
                                        >
                                            <PencilIcon className="w-5 h-5 inline" />
                                        </Link>
                                        <button
                                            onClick={() => handleDeletePayment(payment.id)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <TrashIcon className="w-5 h-5 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {paginatedPayments.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}
