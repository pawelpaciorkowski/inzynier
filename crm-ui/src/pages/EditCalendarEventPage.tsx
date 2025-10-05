import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

interface CalendarEvent {
    id: number;
    title: string;
    start: string;
    end: string;
}

export function EditCalendarEventPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { openModal, openToast } = useModal();

    const [title, setTitle] = useState('');
    const [start, setStart] = useState<string>('');
    const [end, setEnd] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // ✅ This was the missing line
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setError("Musisz się zalogować, aby edytować wydarzenia.");
                setLoading(false);
                return;
            }
            if (!id) {
                setError("Brak ID wydarzenia w adresie URL.");
                setLoading(false);
                return;
            }
            try {
                const response = await api.get<CalendarEvent>(`/CalendarEvents/${id}`);
                setTitle(response.data.title);
                setStart(format(new Date(response.data.start), 'yyyy-MM-dd\'T\'HH:mm'));
                setEnd(format(new Date(response.data.end), 'yyyy-MM-dd\'T\'HH:mm'));
            } catch (err: unknown) {
                let errorMessage = 'Nie udało się pobrać danych.';
                if (err && typeof err === 'object' && 'response' in err) {
                    const axiosErr = err as any;
                    errorMessage = axiosErr.response?.data?.message || axiosErr.message;
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                openModal({ type: 'error', title: 'Błąd', message: errorMessage });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, openModal, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validation logic remains the same
        if (!title.trim() || !start || !end) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Wszystkie pola są wymagane.' });
            setLoading(false);
            return;
        }
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (endDate < startDate) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.' });
            setLoading(false);
            return;
        }

        try {
            const adjustedStartDate = new Date(start);
            adjustedStartDate.setMinutes(adjustedStartDate.getMinutes() - adjustedStartDate.getTimezoneOffset());
            const adjustedEndDate = new Date(end);
            adjustedEndDate.setMinutes(adjustedEndDate.getMinutes() - adjustedEndDate.getTimezoneOffset());

            await api.put(`/CalendarEvents/${id}`, {
                id: parseInt(id as string),
                title,
                start: adjustedStartDate.toISOString(),
                end: adjustedEndDate.toISOString(),
            });
            openToast('Wydarzenie zostało pomyślnie zaktualizowane.', 'success');
            navigate('/wydarzenia');
        } catch {
            // Error is handled by the modal/interceptor
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 mb-4">Musisz się zalogować, aby edytować wydarzenia kalendarza.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Przejdź do logowania
                </button>
            </div>
        );
    }

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
            <h1 className="text-3xl font-bold mb-6">Edytuj Wydarzenie Kalendarza</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
                    {/* Form JSX remains unchanged */}
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-300 text-sm font-bold mb-2">Tytuł:</label>
                        <input
                            type="text"
                            id="title"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="start" className="block text-gray-300 text-sm font-bold mb-2">Początek:</label>
                        <input
                            type="datetime-local"
                            id="start"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="end" className="block text-gray-300 text-sm font-bold mb-2">Koniec:</label>
                        <input
                            type="datetime-local"
                            id="end"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => navigate('/wydarzenia')}
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