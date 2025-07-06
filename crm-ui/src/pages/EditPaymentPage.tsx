import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useModal } from '../context/ModalContext';

// ✅ Krok 1: Zdefiniuj dokładne typy dla danych z API.
// To eliminuje potrzebę używania 'any'.

// Interfejs dla pojedynczej faktury na liście rozwijanej
interface Invoice {
    id: number;
    invoiceNumber: string;
    totalAmount: number;
    isPaid: boolean; // Nawet jeśli nieużywane, warto mieć pełny typ
}

// Interfejs dla danych płatności, które otrzymujemy z API
interface Payment {
    id: number;
    invoiceId: number;
    paidAt: string;     // Otrzymujemy jako string (data w formacie ISO)
    amount: number;
}

// Interfejs dla "opakowanej" odpowiedzi z API, którą często dostajesz
interface ApiResponse<T> {
    $values: T[];
}

export function EditPaymentPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openModal } = useModal();

    // ✅ Krok 2: Użyj zdefiniowanych typów w stanie komponentu
    const [invoiceId, setInvoiceId] = useState<string>(''); // ID z selecta jest stringiem
    const [amount, setAmount] = useState<string>('');
    const [paidAt, setPaidAt] = useState<string>('');
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Stan do przechowywania wiadomości o błędzie

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setError("Brak ID płatności w adresie URL.");
                setLoading(false);
                return;
            }

            try {
                // Używamy typów w zapytaniach axios dla bezpieczeństwa
                const paymentRes = await axios.get<Payment>(`/api/Payments/${id}`);
                const invoicesRes = await axios.get<ApiResponse<Invoice> | Invoice[]>('/api/Invoices');

                // Przypisanie danych do stanu
                const paymentData = paymentRes.data;
                setInvoiceId(paymentData.invoiceId.toString());
                setAmount(paymentData.amount.toString());
                // Formatowanie daty do użycia w <input type="datetime-local">
                setPaidAt(format(new Date(paymentData.paidAt), 'yyyy-MM-dd\'T\'HH:mm'));

                // Sprawdzamy, czy odpowiedź jest "opakowana" w $values
                const invoicesData = '$values' in invoicesRes.data ? invoicesRes.data.$values : invoicesRes.data;
                setInvoices(invoicesData);

            } catch (err: unknown) { // Używamy 'unknown' zamiast 'any' dla lepszego bezpieczeństwa
                let errorMessage = 'Nie udało się pobrać danych.';
                if (axios.isAxiosError(err) && err.response) {
                    errorMessage = err.response.data?.message || err.message;
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                openModal({ type: 'error', title: 'Błąd', message: errorMessage });
                console.error('Błąd pobierania danych:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, openModal]); // Dodajemy openModal do tablicy zależności

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!invoiceId || !amount || !paidAt) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Wszystkie pola są wymagane.' });
            setLoading(false);
            return;
        }

        try {
            await axios.put(`/api/Payments/${id}`, {
                id: parseInt(id as string),
                invoiceId: parseInt(invoiceId), // invoiceId jest już stringiem
                amount: parseFloat(amount),
                paidAt: new Date(paidAt).toISOString(),
            });
            openModal({ type: 'success', title: 'Sukces', message: 'Płatność została pomyślnie zaktualizowana.' });
            navigate('/platnosci');
        } catch {
            // Interceptor Axios (jeśli go masz) lub hook 'useModal' obsłuży błąd
            // Nie ma potrzeby powielać logiki tutaj
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-white flex justify-center items-center h-screen"><p>Ładowanie...</p></div>;
    }

    // ✅ Krok 3: Poprawnie sprawdzaj stan błędu
    if (error) {
        return <div className="p-6 text-white flex justify-center items-center h-screen"><p className="text-red-500">Błąd: {error}</p></div>;
    }

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Edytuj Płatność</h1>
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
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? 'Aktualizowanie...' : 'Zapisz Zmiany'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
