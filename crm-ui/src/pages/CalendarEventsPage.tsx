/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface CalendarEvent {
    id: number;
    title: string;
    start: string;
    end: string;
}

export function CalendarEventsPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useModal();

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<any>('/api/CalendarEvents');
            const eventsData = response.data.$values || response.data;
            setEvents(eventsData);
        } catch (err: any) {
            setError('Nie udało się pobrać wydarzeń kalendarza.');
            console.error('Błąd pobierania wydarzeń:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleDeleteEvent = async (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć to wydarzenie? Tej operacji nie można cofnąć.',
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/CalendarEvents/${id}`);
                    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
                } catch (err) {
                    alert('Nie udało się usunąć wydarzenia.');
                    console.error('Błąd usuwania wydarzenia:', err);
                }
            },
        });
    };

    if (loading) {
        return (
            <div className="p-6 text-white flex justify-center items-center h-screen">
                <p>Ładowanie wydarzeń...</p>
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
            <h1 className="text-3xl font-bold mb-6">Wydarzenia Kalendarza</h1>
            <div className="mb-4">
                <Link to="/wydarzenia/dodaj" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Dodaj Wydarzenie
                </Link>
            </div>
            {events.length === 0 ? (
                <div className="bg-gray-800 p-10 rounded-lg text-center flex flex-col items-center shadow-lg">
                    <img src="/vite.svg" alt="Calendar Icon" className="w-16 h-16 text-blue-400 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Brak Wydarzeń</h2>
                    <p className="text-gray-400 max-w-md">
                        Nie znaleziono żadnych wydarzeń kalendarza. Dodaj pierwsze wydarzenie, aby rozpocząć.
                    </p>
                </div>
            ) : (
                <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Tytuł</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Początek</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Koniec</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-700">
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">{event.title}</td>
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">{format(new Date(event.start), 'dd.MM.yyyy HH:mm', { locale: pl })}</td>
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">{format(new Date(event.end), 'dd.MM.yyyy HH:mm', { locale: pl })}</td>
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                                        <div className="flex justify-center gap-4">
                                            <Link to={`/wydarzenia/edytuj/${event.id}`} className="text-yellow-500 hover:text-yellow-600 mr-3">
                                                <PencilIcon className="w-5 h-5 inline" />
                                            </Link>
                                            <button onClick={() => handleDeleteEvent(event.id)} className="text-red-500 hover:text-red-600">
                                                <TrashIcon className="w-5 h-5 inline" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
