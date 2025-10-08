/* eslint-disable @typescript-eslint/no-explicit-any */
// Plik: crm-ui/src/pages/RemindersPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useModal } from '../context/ModalContext';
import api from '../services/api';
import { ReminderFormModal } from '../components/ReminderFormModal';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

// Definicja typu dla pojedynczego przypomnienia
interface Reminder {
    id: number;
    note: string;
    remind_at: string;
    user_id: number;
}

// Typ dla opakowanej odpowiedzi z API
interface ApiResponse<T> {
    $values: T[];
}

export function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { openModal, closeModal, openToast } = useModal();

    const fetchReminders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get<ApiResponse<Reminder> | Reminder[]>('/Reminders/');
            const data = '$values' in response.data ? response.data.$values : response.data;
            const remindersArray = Array.isArray(data) ? data : [];
            setReminders(remindersArray);
            setFilteredReminders(remindersArray);
        } catch {
            setError('Nie udało się pobrać przypomnień. Sprawdź, czy backend jest uruchomiony i czy konfiguracja proxy w vite.config.ts jest poprawna.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReminders();
    }, []); // Usunięto fetchReminders z zależności

    useEffect(() => {
        const filtered = reminders.filter(r =>
            r.note.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredReminders(filtered);
    }, [searchQuery, reminders]);

    const handleOpenFormModal = (reminder: Reminder | null) => {
        openModal({
            type: 'custom',
            content: (
                <ReminderFormModal
                    currentReminder={reminder}
                    onSaveSuccess={fetchReminders}
                    onClose={closeModal}
                />
            ),
        });
    };



    const handleDelete = (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć to przypomnienie?',
            onConfirm: async () => {
                try {
                    await api.delete(`/Reminders/${id}`);
                    fetchReminders();
                    openToast('Przypomnienie zostało pomyślnie usunięte.', 'success');
                } catch (err: any) {
                    // Backend Python zwraca błędy w polu 'error', nie 'message'
                    const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Nie udało się usunąć przypomnienia.';
                    openModal({ type: 'error', title: 'Błąd', message: errorMessage });
                }
            }
        });
    };

    if (loading) return <div className="text-center p-8 text-white">Ładowanie...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="p-6 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">⏰ Przypomnienia</h1>
                {/* Przycisk, który wywołuje funkcję otwierającą modal */}
                <button
                    onClick={() => handleOpenFormModal(null)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Dodaj przypomnienie
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Filtruj przypomnienia..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                />
            </div>

            <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-700">
                    {filteredReminders.length > 0 ? filteredReminders.map(reminder => (
                        <li key={reminder.id} className="p-4 flex justify-between items-center hover:bg-gray-700/50 transition-colors">
                            <div>
                                <p className="font-semibold text-lg">{reminder.note}</p>
                                <p className="text-gray-400 text-sm">
                                    {reminder.remind_at ? format(new Date(reminder.remind_at.endsWith('Z') ? reminder.remind_at : reminder.remind_at + 'Z'), "d MMMM yyyy, HH:mm", { locale: pl }) : 'Brak daty'}
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => handleOpenFormModal(reminder)} className="p-2 text-gray-400 hover:text-white transition-colors">
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDelete(reminder.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    )) : (
                        <li className="p-4 text-center text-gray-500">Brak przypomnień. Dodaj swoje pierwsze!</li>
                    )}
                </ul>
            </div>

            {/* Toast w prawym górnym rogu - USUNIĘTY, bo jest w Layout.tsx */}
        </div>
    );
}