import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useModal } from '../context/ModalContext';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Notification {
    id: number;
    message: string;
    createdAt: string;
    isRead: boolean;
}

export function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useModal();
    const api = import.meta.env.VITE_API_URL;

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${api}/Notifications/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data.$values || response.data;
            setNotifications(data);
        } catch (err) {
            console.error("Błąd pobierania powiadomień:", err);
            setError("Nie udało się załadować powiadomień.");
        } finally {
            setLoading(false);
        }
    }, [api, openModal]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${api}/Notifications/mark-as-read/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            openModal({ type: 'success', title: 'Sukces', message: 'Powiadomienie oznaczone jako przeczytane.' });
            fetchNotifications(); // Odśwież listę powiadomień
        } catch (err) {
            console.error("Błąd oznaczania jako przeczytane:", err);
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się oznaczyć powiadomienia jako przeczytanego.' });
        }
    };

    if (loading) {
        return <p className="text-center p-8 text-white">Ładowanie powiadomień...</p>;
    }

    if (error) {
        return (
            <div className="text-center text-red-400 p-8">
                <BellIcon className="w-12 h-12 mx-auto text-red-500" />
                <p className="mt-4">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">🔔 Powiadomienia</h1>

            {notifications.length === 0 ? (
                <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
                    <p className="text-gray-400">Brak powiadomień do wyświetlenia.</p>
                </div>
            ) : (
                <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-700">
                        {notifications.map((notification) => (
                            <li key={notification.id} className={`p-4 flex justify-between items-center ${notification.isRead ? 'bg-gray-700 text-gray-400' : 'bg-gray-600 text-white'}`}>
                                <div>
                                    <p className="font-semibold">{notification.message}</p>
                                    <p className="text-sm text-gray-400">{format(new Date(notification.createdAt), 'dd.MM.yyyy HH:mm')}</p>
                                </div>
                                {!notification.isRead && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg flex items-center transition-colors"
                                    >
                                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                                        Oznacz jako przeczytane
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
