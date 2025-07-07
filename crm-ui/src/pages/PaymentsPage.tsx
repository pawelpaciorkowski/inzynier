/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { CreditCardIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useModal } from '../context/ModalContext';

interface Payment {
    id: number;
    invoiceId: number;
    invoiceNumber: string;
    paidAt: string;
    amount: number;
}

export function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useModal();

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<any>('/api/Payments');
            const paymentsData = response.data.$values || response.data;
            setPayments(paymentsData);
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
            <h1 className="text-3xl font-bold mb-6">Płatności</h1>
            <div className="mb-4">
                <Link
                    to="/platnosci/dodaj"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Dodaj Płatność
                </Link>
            </div>
            {payments.length === 0 ? (
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
                            {payments.map((payment) => (
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
        </div>
    );
}
