import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

interface Note {
    id: number;
    content: string;
    customerId?: number;
    userId: number;
    createdAt: string;
}

interface Customer {
    id: number;
    name: string;
}

export function EditNotePage() {
    const { id } = useParams<{ id: string }>();
    const noteId = Number(id);
    const [content, setContent] = useState('');
    const [customerId, setCustomerId] = useState<number | undefined>(undefined);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const navigate = useNavigate();
    const { openModal, openToast } = useModal();

    useEffect(() => {
        const fetchNoteAndCustomers = async () => {
            try {
                const noteResponse = await api.get<Note>(`/Notes/${noteId}`);
                setContent(noteResponse.data.content);
                setCustomerId(noteResponse.data.customerId || undefined);

                // Fetch customers
                const customersResponse = await api.get<Customer[]>('/Customers/');
                const customerData = customersResponse.data;
                let customersData: Customer[] = [];

                if (customerData && typeof customerData === 'object' && '$values' in customerData && Array.isArray(customerData.$values)) {
                    customersData = customerData.$values;
                } else if (Array.isArray(customerData)) {
                    customersData = customerData;
                }

                setCustomers(customersData);
            } catch (err) {
                console.error('Failed to fetch note or customers:', err);
                let errorMessage = 'Nie udało się pobrać danych notatki lub klientów.';
                if (err && typeof err === 'object' && 'response' in err) {
                    const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
                    errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
                }
                openModal({ type: 'error', title: 'Błąd', message: errorMessage });
                navigate('/notatki'); // Go back to notes list on error
            }
        };
        fetchNoteAndCustomers();
    }, [noteId, navigate, openModal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Treść notatki nie może być pusta.' });
            return;
        }

        try {
            await api.put(`/Notes/${noteId}`, { id: noteId, content, customerId: customerId || null });
            openToast('Notatka została zaktualizowana.', 'success');
            navigate('/notatki');
        } catch (err) {
            let errorMessage = 'Wystąpił nieoczekiwany błąd podczas aktualizacji notatki.';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
                errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
            }
            openModal({ type: 'error', title: 'Błąd', message: errorMessage });
        }
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Edytuj notatkę</h1>
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
                <div className="flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/notatki')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Powrót
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Zapisz zmiany
                    </button>
                </div>
            </form>
        </div>
    );
}
