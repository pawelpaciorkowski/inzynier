import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useModal } from '../context/ModalContext';

// Define interfaces for better type safety
interface Customer {
    id: number;
    name: string;
}

interface Meeting {
    id: number;
    topic: string;
    scheduledAt: string;
    customerId: number;
}

// A generic type for your API's wrapped responses
interface ApiResponse<T> {
    $values: T[];
}

export function EditMeetingPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openModal, openToast } = useModal();

    const [topic, setTopic] = useState('');
    const [scheduledAt, setScheduledAt] = useState<string>('');
    const [customerId, setCustomerId] = useState<string>(''); // Default to string for select element
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ This was the missing line
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Define the correct type for the API response
                type CustomerApiResponse = ApiResponse<Customer> | Customer[];

                const [meetingRes, customersRes] = await Promise.all([
                    axios.get<Meeting>(`/api/Meetings/${id}`),
                    axios.get<CustomerApiResponse>('/api/Customers'),
                ]);

                setTopic(meetingRes.data.topic);
                setScheduledAt(format(new Date(meetingRes.data.scheduledAt), "yyyy-MM-dd'T'HH:mm"));
                setCustomerId(meetingRes.data.customerId ? meetingRes.data.customerId.toString() : '');

                // Handle both wrapped and unwrapped API responses
                const customersData = '$values' in customersRes.data ? customersRes.data.$values : customersRes.data;
                setCustomers(customersData);

            } catch (err: unknown) { // Use 'unknown' for better type safety
                let errorMessage = 'Nie udało się pobrać danych.';
                if (axios.isAxiosError(err) && err.response) {
                    errorMessage = err.response.data?.message || err.message;
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }
                setError(errorMessage); // Set the error state
                openModal({ type: 'error', title: 'Błąd', message: errorMessage });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, openModal]); // Added openModal to dependency array

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

            await axios.put(`/api/Meetings/${id}`, {
                id: parseInt(id as string),
                topic,
                scheduledAt: adjustedScheduledAt.toISOString(),
                customerId: parseInt(customerId),
            });
            openToast('Spotkanie zostało pomyślnie zaktualizowane.', 'success');
            navigate('/spotkania');
        } catch {
            // Error is handled by the Axios interceptor or the modal, so we can leave this empty.
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-white flex justify-center items-center h-screen">
                <p>Ładowanie...</p>
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
            <h1 className="text-3xl font-bold mb-6">Edytuj Spotkanie</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
                    {/* The form JSX remains unchanged */}
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
                            {loading ? 'Aktualizowanie...' : 'Zapisz Zmiany'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}