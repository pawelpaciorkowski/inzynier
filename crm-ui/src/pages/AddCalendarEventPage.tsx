import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useModal } from '../context/ModalContext';

export function AddCalendarEventPage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [start, setStart] = useState<string>(format(new Date(), 'yyyy-MM-ddTHH:mm'));
    const [end, setEnd] = useState<string>(format(new Date(), 'yyyy-MM-ddTHH:mm'));
    const [loading, setLoading] = useState(false);
    const { openModal } = useModal();

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
            await axios.post('/api/CalendarEvents', {
                title,
                start: new Date(start).toISOString(),
                end: new Date(end).toISOString(),
            });
            openModal({ type: 'success', title: 'Sukces', message: 'Wydarzenie zostało pomyślnie dodane.' });
            navigate('/wydarzenia');
        } catch (err: any) {
            // Błąd zostanie obsłużony przez interceptor Axios
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
                    <div className="flex items-center justify-between">
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
