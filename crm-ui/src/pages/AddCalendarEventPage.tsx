import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

export function AddCalendarEventPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [title, setTitle] = useState('');
    const [start, setStart] = useState<string>('');
    const [end, setEnd] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { openModal, openToast } = useModal();

    // Inicjalizacja dat z parametrów URL lub dzisiejszej daty
    useEffect(() => {
        const startParam = searchParams.get('start');
        const endParam = searchParams.get('end');

        const formatDateForInput = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        if (startParam) {
            const startDate = new Date(startParam);
            setStart(formatDateForInput(startDate));

            if (endParam) {
                const endDate = new Date(endParam);
                setEnd(formatDateForInput(endDate));
            } else {
                // Jeśli nie ma end, ustaw na godzinę później
                const endDate = new Date(startDate);
                endDate.setHours(endDate.getHours() + 1);
                setEnd(formatDateForInput(endDate));
            }
        } else {
            // Domyślne wartości - dzisiejsza data
            const now = new Date();
            setStart(formatDateForInput(now));

            const endDate = new Date(now);
            endDate.setHours(endDate.getHours() + 1);
            setEnd(formatDateForInput(endDate));
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!title.trim() || !start || !end) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Wszystkie pola są wymagane.' });
            setLoading(false);
            return;
        }

        const startDate = new Date(start);
        const endDate = new Date(end);
        const now = new Date();

        if (startDate < now) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Data rozpoczęcia nie może być z przeszłości.' });
            setLoading(false);
            return;
        }

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

            await axios.post('/api/CalendarEvents', {
                title,
                start: adjustedStartDate.toISOString(),
                end: adjustedEndDate.toISOString(),
            });
            openToast('Wydarzenie zostało pomyślnie dodane.', 'success');
            navigate('/wydarzenia');
        } catch {
            // Błąd zostanie obsłużony przez interceptor Axios
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się dodać wydarzenia.' });
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Dodaj Wydarzenie Kalendarza</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
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
                            {loading ? 'Dodawanie...' : 'Dodaj Wydarzenie'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
