/* eslint-disable @typescript-eslint/no-explicit-any */
// Plik: crm-ui/src/pages/AddNotePage.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

interface Customer {
    id: number;
    name: string;
}
interface ApiResponse<T> {
    $values: T[];
}

export function AddNotePage() {
    const [content, setContent] = useState('');
    const [customerId, setCustomerId] = useState<string>('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const navigate = useNavigate();
    const { openModal } = useModal();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get<ApiResponse<Customer> | Customer[]>('/api/Customers');
                const data = '$values' in response.data ? response.data.$values : response.data;
                setCustomers(data);
            } catch (err) {
                console.error("Błąd pobierania klientów:", err);
            }
        };
        fetchCustomers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !customerId) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Wszystkie pola są wymagane.' });
            return;
        }

        try {
            await axios.post('/api/Notes', {
                content,
                customerId: parseInt(customerId)
            });
            openModal({ type: 'success', title: 'Sukces', message: 'Notatka została dodana.' });
            navigate('/notatki');
        } catch (err: any) {
            openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Nie udało się dodać notatki.' });
        }
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Dodaj Nową Notatkę</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="customerId" className="block text-gray-300 text-sm font-bold mb-2">Klient:</label>
                        <select
                            id="customerId"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                            required
                        >
                            <option value="">-- Wybierz klienta --</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="content" className="block text-gray-300 text-sm font-bold mb-2">Treść notatki:</label>
                        <textarea
                            id="content"
                            rows={6}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            placeholder="Wpisz treść notatki..."
                            required
                        />
                    </div>
                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Dodaj Notatkę
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}