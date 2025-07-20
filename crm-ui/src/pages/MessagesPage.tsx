/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';
import { PaperAirplaneIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';

interface Message {
    id: number;
    subject: string;
    body: string;
    sentAt: string;
    isRead: boolean;
    senderUsername?: string; // Dla wiadomości odebranych
    recipientUsername?: string; // Dla wiadomości wysłanych
}

interface User {
    id: number;
    username: string;
}

interface CreateMessageDto {
    recipientUserId: number;
    subject: string;
    body: string;
}

export function MessagesPage() {
    const { user } = useAuth();
    const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
    const [sentMessages, setSentMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'sent'
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [newMessage, setNewMessage] = useState<CreateMessageDto>({
        recipientUserId: 0,
        subject: '',
        body: '',
    });
    const { openModal, openToast } = useModal();
    const { fetchNotifications: globalFetchNotifications } = useOutletContext<{ fetchNotifications: () => void }>();

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const inboxRes = await axios.get<any>('/api/Messages/inbox');
            setInboxMessages(inboxRes.data.$values || inboxRes.data);

            const sentRes = await axios.get<any>('/api/Messages/sent');
            setSentMessages(sentRes.data.$values || sentRes.data);
        } catch (err: any) {
            console.error('Błąd pobierania wiadomości:', err);
            openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Nie udało się pobrać wiadomości.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get<any>('/api/admin/users'); // Zakładamy, że ten endpoint zwraca listę użytkowników
            setUsers(res.data.$values || res.data);
        } catch (err) {
            console.error('Błąd pobierania użytkowników:', err);
        }
    };

    useEffect(() => {
        fetchMessages();
        if (user?.role === 'Admin' || user?.role === 'Sprzedawca') {
            fetchUsers();
        }
    }, [user]);

    const handleMarkAsRead = async (id: number) => {
        try {
            await axios.put(`/api/Messages/${id}/read`);
            openToast('Wiadomość oznaczona jako przeczytana.', 'success');
            fetchMessages(); // Odśwież listę
        } catch (err: any) {
            console.error('Błąd oznaczania jako przeczytane:', err);
            openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Nie udało się oznaczyć wiadomości jako przeczytanej.' });
        }
    };

    const handleDelete = async (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć tę wiadomość?',
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/Messages/${id}`);
                    fetchMessages(); // Odśwież listę
                } catch (err: any) {
                    console.error('Błąd usuwania wiadomości:', err);
                    openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Nie udało się usunąć wiadomości.' });
                }
            },
        });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/Messages', newMessage);
            setShowNewMessageModal(false);
            setNewMessage({ recipientUserId: 0, subject: '', body: '' });
            fetchMessages(); // Odśwież listę
            globalFetchNotifications(); // Odśwież licznik powiadomień
        } catch (err: any) {
            console.error('Błąd wysyłania wiadomości:', err);
            openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Nie udało się wysłać wiadomości.' });
        }
    };

    if (loading) {
        return <p className="p-6 text-white">Ładowanie wiadomości...</p>;
    }

    const messagesToDisplay = activeTab === 'inbox' ? inboxMessages : sentMessages;

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">💬 Wiadomości</h1>

            <div className="mb-4 flex space-x-4">
                <button
                    onClick={() => setActiveTab('inbox')}
                    className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'inbox' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    Odebrane ({inboxMessages.filter(m => !m.isRead).length})
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    Wysłane ({sentMessages.length})
                </button>
                <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="ml-auto px-4 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700"
                >
                    <PaperAirplaneIcon className="h-5 w-5 inline-block mr-2" /> Nowa wiadomość
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                {messagesToDisplay.length === 0 ? (
                    <p className="text-gray-400">Brak wiadomości w tej kategorii.</p>
                ) : (
                    <ul className="space-y-4">
                        {messagesToDisplay.map(message => (
                            <li key={message.id} className={`p-4 rounded-md shadow ${message.isRead ? 'bg-gray-700' : 'bg-blue-900'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-semibold">
                                        {activeTab === 'inbox' ? `Od: ${message.senderUsername}` : `Do: ${message.recipientUsername}`}
                                    </span>
                                    <span className="text-sm text-gray-400">{new Date(message.sentAt).toLocaleString()}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{message.subject}</h3>
                                <p className="text-gray-300 mb-4">{message.body}</p>
                                <div className="flex space-x-2 justify-end">
                                    {activeTab === 'inbox' && !message.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(message.id)}
                                            className="p-2 rounded-full hover:bg-gray-600 text-blue-400"
                                            title="Oznacz jako przeczytane"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(message.id)}
                                        className="p-2 rounded-full hover:bg-gray-600 text-red-400"
                                        title="Usuń wiadomość"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* New Message Modal */}
            {showNewMessageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-white">Nowa wiadomość</h2>
                        <form onSubmit={handleSendMessage}>
                            <div className="mb-4">
                                <label htmlFor="recipient" className="block text-gray-300 text-sm font-bold mb-2">Do:</label>
                                {user?.role === 'Admin' || user?.role === 'Sprzedawca' ? (
                                    <select
                                        id="recipient"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                                        value={newMessage.recipientUserId}
                                        onChange={(e) => setNewMessage({ ...newMessage, recipientUserId: parseInt(e.target.value) })}
                                        required
                                    >
                                        <option value={0}>-- Wybierz użytkownika --</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.username}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        className="w-full p-2 rounded bg-gray-700 text-white border-gray-600"
                                        value="Tylko admin może wysyłać wiadomości do innych użytkowników."
                                        disabled
                                    />
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="subject" className="block text-gray-300 text-sm font-bold mb-2">Temat:</label>
                                <input
                                    type="text"
                                    id="subject"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                                    value={newMessage.subject}
                                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="body" className="block text-gray-300 text-sm font-bold mb-2">Treść:</label>
                                <textarea
                                    id="body"
                                    rows={5}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                                    value={newMessage.body}
                                    onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowNewMessageModal(false)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Wyślij
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
