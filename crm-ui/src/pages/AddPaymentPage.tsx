/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Invoice {
    id: number;
    invoiceNumber: string;
    totalAmount: number;
    isPaid: boolean;
}

export function AddPaymentPage() {
    const navigate = useNavigate();
    const [invoiceId, setInvoiceId] = useState<number | string>('');
    const [amount, setAmount] = useState<string>('');
    const [paidAt, setPaidAt] = useState<string>(format(new Date(), 'yyyy-MM-ddTHH:mm'));
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await axios.get<any>('/api/Invoices');
                const invoicesData = response.data.$values || response.data;
                setInvoices(invoicesData);
            } catch (err) {
                setError('Nie udało się pobrać listy faktur.');
                console.error('Błąd pobierania faktur:', err);
            }
        };
        fetchInvoices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!invoiceId || !amount || !paidAt) {
            setError('Wszystkie pola są wymagane.');
            setLoading(false);
            return;
        }

        try {
            await axios.post('/api/Payments', {
                invoiceId: parseInt(invoiceId as string),
                amount: parseFloat(amount),
                paidAt: new Date(paidAt).toISOString(),
            });
            navigate('/platnosci'); // Przekierowanie do strony płatności
        } catch (err: any) {
            setError(`Nie udało się dodać płatności: ${err.response?.data?.message || err.message}`);
            console.error('Błąd dodawania płatności:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Dodaj Płatność</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="invoiceId" className="block text-gray-300 text-sm font-bold mb-2">Faktura:</label>
                        <select
                            id="invoiceId"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                            value={invoiceId}
                            onChange={(e) => setInvoiceId(e.target.value)}
                            required
                        >
                            <option value="">-- Wybierz fakturę --</option>
                            {invoices.map(invoice => (
                                <option key={invoice.id} value={invoice.id}>
                                    {invoice.invoiceNumber} (Kwota: {invoice.totalAmount.toFixed(2)} PLN)
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-gray-300 text-sm font-bold mb-2">Kwota:</label>
                        <input
                            type="number"
                            id="amount"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="paidAt" className="block text-gray-300 text-sm font-bold mb-2">Data Płatności:</label>
                        <input
                            type="datetime-local"
                            id="paidAt"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={paidAt}
                            onChange={(e) => setPaidAt(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? 'Dodawanie...' : 'Dodaj Płatność'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
