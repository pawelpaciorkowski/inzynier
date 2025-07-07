/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { pl };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: pl }),
    getDay,
    locales,
});

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
}

export function CalendarEventsPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [currentView, setCurrentView] = useState<View>(Views.MONTH);
    const { openModal } = useModal();

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/CalendarEvents');
            const data = response.data.$values || response.data;
            const formatted = data.map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));
            setEvents(formatted);
        } catch {
            setError('Nie udało się pobrać wydarzeń kalendarza.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);



    const handleSelectEvent = (event: CalendarEvent) => {
        openModal({
            type: 'info',
            title: event.title,
            message: `Początek: ${format(new Date(event.start), 'dd.MM.yyyy HH:mm', { locale: pl })}\nKoniec: ${format(new Date(event.end), 'dd.MM.yyyy HH:mm', { locale: pl })}`,
            confirmText: 'Edytuj',
            onConfirm: () => navigate(`/wydarzenia/edytuj/${event.id}`),
            cancelText: 'Usuń',
            onCancel: async () => {
                await axios.delete(`/api/CalendarEvents/${event.id}`);
                fetchEvents();
            },

        });
    };

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        navigate(`/wydarzenia/dodaj?start=${start.toISOString()}&end=${end.toISOString()}`);
    };

    if (loading) {
        return <div className="p-6 text-white text-center">Ładowanie wydarzeń...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500 text-center">Błąd: {error}</div>;
    }

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Wydarzenia Kalendarza</h1>

            <div className="mb-4">
                <Link
                    to="/wydarzenia/dodaj"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Dodaj Wydarzenie
                </Link>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-4">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    titleAccessor="title"
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    defaultView={Views.MONTH}
                    selectable
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    culture="pl"
                    date={currentDate}
                    view={currentView}
                    onNavigate={(date) => setCurrentDate(date)}
                    onView={(view) => setCurrentView(view)}
                    style={{ height: '700px' }}
                    messages={{
                        next: 'Następny',
                        previous: 'Poprzedni',
                        today: 'Dziś',
                        month: 'Miesiąc',
                        week: 'Tydzień',
                        day: 'Dzień',
                        agenda: 'Agenda',
                        date: 'Data',
                        time: 'Godzina',
                        event: 'Wydarzenie',
                        noEventsInRange: 'Brak wydarzeń w tym zakresie.',
                    }}
                />
            </div>
        </div>
    );
}
