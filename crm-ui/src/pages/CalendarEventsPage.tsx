/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { pl } from 'date-fns/locale';

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
}

export function CalendarEventsPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [search, setSearch] = useState('');
    const { openModal, openToast, closeModal } = useModal();

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/CalendarEvents');
            const responseData = response.data;
            let data = responseData;

            if (responseData && typeof responseData === 'object' && '$values' in responseData && Array.isArray(responseData.$values)) {
                data = responseData.$values;
            } else if (!Array.isArray(responseData)) {
                data = [];
            }
            const formatted = data.map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));
            setEvents(formatted);
            setFilteredEvents(formatted);
        } catch {
            setError('Nie udało się pobrać wydarzeń kalendarza.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Filtrowanie wydarzeń na podstawie wyszukiwania
    useEffect(() => {
        const filtered = events.filter(event =>
            event.title.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredEvents(filtered);
    }, [events, search]);



    const handleSelectDay = (date: Date) => {
        const dayEvents = getEventsForDay(date);

        if (dayEvents.length === 0) {
            // Brak wydarzeń - przejdź do dodawania
            navigate(`/wydarzenia/dodaj?start=${date.toISOString()}&end=${date.toISOString()}`);
        } else if (dayEvents.length === 1) {
            // Jedno wydarzenie - przejdź do edycji
            navigate(`/wydarzenia/edytuj/${dayEvents[0].id}`);
        } else {
            // Wiele wydarzeń - pokaż modal z listą
            openModal({
                type: 'custom',
                content: (
                    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">
                            📅 Wydarzenia {format(date, 'dd MMMM yyyy', { locale: pl })}
                        </h2>
                        <div className="space-y-3 mb-6">
                            {dayEvents.map(event => (
                                <div key={event.id} className="bg-gray-700 p-3 rounded-lg">
                                    <h3 className="font-semibold mb-1">{event.title}</h3>
                                    <p className="text-gray-400 text-sm">
                                        {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => {
                                                closeModal();
                                                navigate(`/wydarzenia/edytuj/${event.id}`);
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                        >
                                            Edytuj
                                        </button>
                                        <button
                                            onClick={() => {
                                                closeModal();
                                                openModal({
                                                    type: 'confirm',
                                                    title: 'Potwierdź usunięcie',
                                                    message: `Czy na pewno chcesz usunąć wydarzenie "${event.title}"?`,
                                                    onConfirm: async () => {
                                                        try {
                                                            await axios.delete(`/api/CalendarEvents/${event.id}`);
                                                            openToast('Wydarzenie zostało usunięte.', 'success');
                                                            fetchEvents();
                                                        } catch (err: unknown) {
                                                            const errorMessage = err instanceof Error ? err.message : 'Nie udało się usunąć wydarzenia.';
                                                            openModal({ type: 'error', title: 'Błąd', message: errorMessage });
                                                        }
                                                    }
                                                });
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                        >
                                            Usuń
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={() => {
                                    closeModal();
                                    navigate(`/wydarzenia/dodaj?start=${date.toISOString()}&end=${date.toISOString()}`);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                            >
                                ➕ Dodaj nowe
                            </button>
                            <button
                                onClick={closeModal}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                            >
                                Powrót
                            </button>
                        </div>
                    </div>
                )
            });
        }
    };

    // Generowanie dni kalendarza
    const getCalendarDays = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { locale: pl });
        const calendarEnd = endOfWeek(monthEnd, { locale: pl });

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    };

    // Pobieranie wydarzeń dla danego dnia
    const getEventsForDay = (date: Date) => {
        return filteredEvents.filter(event =>
            isSameDay(new Date(event.start), date)
        );
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    if (loading) {
        return <div className="p-6 text-white text-center">Ładowanie wydarzeń...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500 text-center">Błąd: {error}</div>;
    }

    const calendarDays = getCalendarDays();
    const weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">📅 Wydarzenia Kalendarza</h1>

            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Link
                    to="/wydarzenia/dodaj"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Dodaj Wydarzenie
                </Link>

                {/* Wyszukiwarka */}
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Wyszukaj wydarzenia..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Nagłówek kalendarza */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold">
                        {format(currentDate, 'MMMM yyyy', { locale: pl })}
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Dni tygodnia */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {weekDays.map(day => (
                        <div key={day} className="p-3 text-center font-semibold text-gray-400 text-sm">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Kafelki dni */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                        const dayEvents = getEventsForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isCurrentDay = isToday(day);

                        return (
                            <div
                                key={index}
                                className={`
                                    min-h-[120px] p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                                    ${isCurrentMonth
                                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                                        : 'bg-gray-800 border-gray-700 text-gray-500'
                                    }
                                    ${isCurrentDay ? 'border-blue-500 bg-blue-900/20' : ''}
                                `}
                                onClick={() => handleSelectDay(day)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`
                                        text-sm font-semibold
                                        ${isCurrentDay ? 'text-blue-400' : ''}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                            {dayEvents.length}
                                        </span>
                                    )}
                                </div>

                                {/* Wydarzenia */}
                                <div className="space-y-1">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div
                                            key={event.id}
                                            className="bg-blue-600 text-white text-xs p-1 rounded"
                                            title={event.title}
                                        >
                                            <div className="truncate">{event.title}</div>
                                            <div className="text-blue-200 text-xs">
                                                {format(new Date(event.start), 'HH:mm')}
                                            </div>
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="text-xs text-gray-400 text-center">
                                            +{dayEvents.length - 2} więcej
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Przycisk do otwarcia listy wydarzeń w modalu */}
            {filteredEvents.length > 0 && (
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">
                            Wydarzenia w tym miesiącu ({filteredEvents.filter(event => isSameMonth(new Date(event.start), currentDate)).length})
                        </h3>
                        <button
                            onClick={() => {
                                const monthEvents = filteredEvents
                                    .filter(event => isSameMonth(new Date(event.start), currentDate))
                                    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

                                const eventsPerPage = 5;
                                const totalPages = Math.ceil(monthEvents.length / eventsPerPage);

                                const EventsModal = () => {
                                    const [page, setPage] = useState(1);
                                    const startIndex = (page - 1) * eventsPerPage;
                                    const endIndex = startIndex + eventsPerPage;
                                    const paginatedEvents = monthEvents.slice(startIndex, endIndex);

                                    return (
                                        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                                            <h2 className="text-xl font-bold mb-4">
                                                📅 Wydarzenia {format(currentDate, 'MMMM yyyy', { locale: pl })} ({monthEvents.length})
                                            </h2>
                                            <div className="space-y-3 mb-6">
                                                {paginatedEvents.map(event => (
                                                    <div
                                                        key={event.id}
                                                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                                    >
                                                        <div>
                                                            <h4 className="font-semibold">{event.title}</h4>
                                                            <p className="text-gray-400 text-sm">
                                                                {format(new Date(event.start), 'dd MMMM yyyy, HH:mm', { locale: pl })} -
                                                                {format(new Date(event.end), ' HH:mm', { locale: pl })}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    closeModal();
                                                                    navigate(`/wydarzenia/edytuj/${event.id}`);
                                                                }}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                                            >
                                                                Edytuj
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    closeModal();
                                                                    openModal({
                                                                        type: 'confirm',
                                                                        title: 'Potwierdź usunięcie',
                                                                        message: `Czy na pewno chcesz usunąć wydarzenie "${event.title}"?`,
                                                                        onConfirm: async () => {
                                                                            try {
                                                                                await axios.delete(`/api/CalendarEvents/${event.id}`);
                                                                                openToast('Wydarzenie zostało usunięte.', 'success');
                                                                                fetchEvents();
                                                                            } catch (err: unknown) {
                                                                                const errorMessage = err instanceof Error ? err.message : 'Nie udało się usunąć wydarzenia.';
                                                                                openModal({ type: 'error', title: 'Błąd', message: errorMessage });
                                                                            }
                                                                        }
                                                                    });
                                                                }}
                                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                                            >
                                                                Usuń
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Paginacja */}
                                            {totalPages > 1 && (
                                                <div className="flex justify-center items-center gap-2 mb-4">
                                                    <button
                                                        className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                                        disabled={page === 1}
                                                    >
                                                        &lt;
                                                    </button>
                                                    <span className="text-white px-3">
                                                        {page} / {totalPages}
                                                    </span>
                                                    <button
                                                        className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={page === totalPages}
                                                    >
                                                        &gt;
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex justify-end">
                                                <button
                                                    onClick={closeModal}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                                                >
                                                    Zamknij
                                                </button>
                                            </div>
                                        </div>
                                    );
                                };

                                openModal({
                                    type: 'custom',
                                    content: <EventsModal />
                                });
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Wszystkie wydarzenia
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
