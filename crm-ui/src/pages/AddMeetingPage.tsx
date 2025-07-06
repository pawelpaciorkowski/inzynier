import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useModal } from '../context/ModalContext';

interface Customer {
    id: number;
    name: string;
}

export function AddMeetingPage() {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [scheduledAt, setScheduledAt] = useState<string>(format(new Date(), 'yyyy-MM-ddTHH:mm'));
    const [customerId, setCustomerId] = useState<number | string>('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const { openModal } = useModal();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get<any>('/api/Customers');
                const customersData = response.data.$values || response.data;
                setCustomers(customersData);
            } catch (err: any) {
                openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Nie udało się pobrać listy klientów.' });
                console.error('Błąd pobierania klientów:', err);
            }
        };
        fetchCustomers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!topic.trim() || !scheduledAt || !customerId) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Wszystkie pola są wymagane.' });
            setLoading(false);
            return;
        }

        try {
            await axios.post('/api/Meetings', {
                topic,
                scheduledAt: new Date(scheduledAt).toISOString(),
                customerId: parseInt(customerId as string),
            });
            openModal({ type: 'success', title: 'Sukces', message: 'Spotkanie zostało pomyślnie dodane.' });
            navigate('/spotkania');
        } catch (err: any) {
            // Błąd zostanie obsłużony przez interceptor Axios
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Dodaj Spotkanie</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="topic" className="block text-gray-300 text-sm font-bold mb-2">Temat:</label>
                        <input
                            type="text"
                            id="topic"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="scheduledAt" className="block text-gray-300 text-sm font-bold mb-2">Data i Czas:</label>
                        <input
                            type="datetime-local"
                            id="scheduledAt"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="customerId" className="block text-gray-300 text-sm font-bold mb-2">Klient:</label>
                        <select
                            id="customerId"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            required
                        >
                            <option value="">-- Wybierz klienta --</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? 'Dodawanie...' : 'Dodaj Spotkanie'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
