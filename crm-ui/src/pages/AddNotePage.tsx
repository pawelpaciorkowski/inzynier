/* eslint-disable @typescript-eslint/no-explicit-any */
// Plik: crm-ui/src/pages/AddNotePage.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import ClientSelectModal from '../components/ClientSelectModal';

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
    const { openModal, openToast } = useModal();
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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
            openToast('Notatka została dodana.', 'success');
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
                        <button type="button" onClick={() => setShowClientModal(true)} className="w-full py-2 px-3 rounded bg-gray-700 text-white border border-gray-600 text-left">
                            {selectedCustomer ? `Klient: ${selectedCustomer.name}` : '-- Wybierz klienta --'}
                        </button>
                        {showClientModal && (
                            <ClientSelectModal
                                clients={customers}
                                onSelect={client => {
                                    setSelectedCustomer(client);
                                    setCustomerId(client.id.toString());
                                    setShowClientModal(false);
                                }}
                                onClose={() => setShowClientModal(false)}
                            />
                        )}
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
                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => navigate('/notatki')}
                        >
                            Powrót
                        </button>
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