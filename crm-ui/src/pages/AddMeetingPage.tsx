import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useModal } from '../context/ModalContext';
import ClientSelectModal from '../components/ClientSelectModal';

interface Customer {
    id: number;
    name: string;
}

export function AddMeetingPage() {
    const api = import.meta.env.VITE_API_URL;

    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [scheduledAt, setScheduledAt] = useState<string>(
        format(new Date(), "yyyy-MM-dd'T'HH:mm")
    );

    const [customerId, setCustomerId] = useState<number | string>('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const { openModal, openToast } = useModal();
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        type CustomerWrapper = {
            $values: Customer[];
        };

        const fetchCustomers = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${api}/customers`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = res.data;

                if (
                    data &&
                    typeof data === 'object' &&
                    '$values' in data &&
                    Array.isArray((data as CustomerWrapper).$values)
                ) {
                    setCustomers((data as CustomerWrapper).$values);
                } else if (Array.isArray(data)) {
                    setCustomers(data);
                } else {
                    console.warn('Nieoczekiwany format danych klientów:', data);
                    setCustomers([]);
                }

            } catch (err) {
                openModal({
                    type: 'error',
                    title: 'Błąd',
                    message: 'Nie udało się pobrać klientów.'
                });
                console.error('Błąd pobierania klientów:', err);
            }
        };

        fetchCustomers();
    }, [api, openModal]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!topic.trim() || !scheduledAt || !customerId) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Wszystkie pola są wymagane.' });
            setLoading(false);
            return;
        }

        try {
            const adjustedScheduledAt = new Date(scheduledAt);
            adjustedScheduledAt.setMinutes(adjustedScheduledAt.getMinutes() - adjustedScheduledAt.getTimezoneOffset());

            await axios.post('/api/Meetings', {
                topic,
                scheduledAt: adjustedScheduledAt.toISOString(),
                customerId: parseInt(customerId as string),
            });
            openToast('Spotkanie zostało pomyślnie dodane.', 'success');
            navigate('/spotkania');
        } catch {
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
                        <button
                            type="button"
                            onClick={() => setShowClientModal(true)}
                            className="w-full py-2 px-3 rounded bg-gray-700 text-white border border-gray-600 text-left"
                        >
                            {selectedCustomer ? `Klient: ${selectedCustomer.name}` : '-- Wybierz klienta --'}
                        </button>
                        {showClientModal && (
                            <ClientSelectModal
                                clients={customers}
                                onSelect={client => {
                                    setSelectedCustomer(client);
                                    setCustomerId(client.id);
                                    setShowClientModal(false);
                                }}
                                onClose={() => setShowClientModal(false)}
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => navigate('/spotkania')}
                        >
                            Powrót
                        </button>
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