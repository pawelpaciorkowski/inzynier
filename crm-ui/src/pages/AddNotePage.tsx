import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

interface Customer {
    id: number;
    name: string;
}

export function AddNotePage() {
    const [content, setContent] = useState('');
    const [customerId, setCustomerId] = useState<number | undefined>(undefined);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const navigate = useNavigate();
    const { openModal } = useModal();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get<Customer[]>('/api/Customers');
                setCustomers(response.data);
            } catch (err) {
                console.error('Failed to fetch customers:', err);
                openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się pobrać listy klientów.' });
            }
        };
        fetchCustomers();
    }, [openModal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Treść notatki nie może być pusta.' });
            return;
        }

        try {
            await axios.post('/api/Notes', { content, customerId: customerId || null });
            openModal({ type: 'success', title: 'Sukces', message: 'Notatka została dodana.' });
            navigate('/notes'); // Przekieruj do listy notatek
        } catch (err) {
            let errorMessage = 'Wystąpił nieoczekiwany błąd podczas dodawania notatki.';
            if (axios.isAxiosError(err) && err.response) {
                errorMessage = err.response.data?.message || err.message;
            }
            openModal({ type: 'error', title: 'Błąd', message: errorMessage });
        }
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Dodaj nową notatkę</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label htmlFor="content" className="block text-gray-300 text-sm font-bold mb-2">Treść notatki:</label>
                    <textarea
                        id="content"
                        rows={5}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                        required
                    ></textarea>
                </div>
                <div className="mb-6">
                    <label htmlFor="customer" className="block text-gray-300 text-sm font-bold mb-2">Powiąż z klientem (opcjonalnie):</label>
                    <select
                        id="customer"
                        value={customerId || ''}
                        onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                    >
                        <option value="">-- Wybierz klienta --</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                                {customer.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/notes')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Anuluj
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Dodaj notatkę
                    </button>
                </div>
            </form>
        </div>
    );
}
