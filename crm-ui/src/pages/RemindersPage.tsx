/* eslint-disable @typescript-eslint/no-explicit-any */
// Plik: crm-ui/src/pages/RemindersPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

// Definicja typu dla pojedynczego przypomnienia
interface Reminder {
    id: number;
    note: string;
    remindAt: string;
    userId: number;
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
    const { openModal } = useModal();

    // --- Logika Modala ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);
    const [note, setNote] = useState('');
    const [remindAt, setRemindAt] = useState('');

    const fetchReminders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get<ApiResponse<Reminder> | Reminder[]>('/api/Reminders');
            const data = '$values' in response.data ? response.data.$values : response.data;
            setReminders(data);
            setFilteredReminders(data);
        } catch {
            setError('Nie udało się pobrać przypomnień. Sprawdź, czy backend jest uruchomiony i czy konfiguracja proxy w vite.config.ts jest poprawna.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);

    useEffect(() => {
        const filtered = reminders.filter(r =>
            r.note.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredReminders(filtered);
    }, [searchQuery, reminders]);

    // ✅ POPRAWKA: Ta funkcja jest kluczowa do otwierania modala
    const handleOpenFormModal = (reminder: Reminder | null) => {
        setCurrentReminder(reminder);
        if (reminder) {
            setNote(reminder.note);
            setRemindAt(format(new Date(reminder.remindAt), "yyyy-MM-dd'T'HH:mm"));
        } else {
            setNote('');
            setRemindAt('');
        }
        // Ta linia zmienia stan i powoduje wyświetlenie modala
        setIsFormModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note || !remindAt) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Wszystkie pola są wymagane.' });
            return;
        }

        const reminderData = {
            id: currentReminder?.id ?? 0,
            note,
            remindAt: new Date(remindAt).toISOString(),
        };

        try {
            if (currentReminder) {
                await axios.put(`/api/Reminders/${currentReminder.id}`, reminderData);
                openModal({ type: 'success', title: 'Sukces', message: 'Przypomnienie zaktualizowane.' });
            } else {
                await axios.post('/api/Reminders', reminderData);
                openModal({ type: 'success', title: 'Sukces', message: 'Przypomnienie dodane.' });
            }
            setIsFormModalOpen(false);
            fetchReminders();
        } catch (err: any) {
            openModal({ type: 'error', title: 'Błąd zapisu', message: err.response?.data?.message || 'Wystąpił błąd.' });
        }
    };

    const handleDelete = (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć to przypomnienie?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/Reminders/${id}`);
                    openModal({ type: 'success', title: 'Usunięto', message: 'Przypomnienie zostało usunięte.' });
                    fetchReminders();
                } catch (err: any) {
                    openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Nie udało się usunąć przypomnienia.' });
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
                                    {format(new Date(reminder.remindAt), "d MMMM yyyy, HH:mm", { locale: pl })}
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

            {/* ✅ POPRAWKA: Ten warunek renderuje modal, gdy isFormModalOpen jest true */}
            {isFormModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in">
                    <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-white">{currentReminder ? 'Edytuj' : 'Dodaj'} przypomnienie</h2>
                        <form onSubmit={handleSave}>
                            <div className="mb-4">
                                <label htmlFor="note" className="block text-gray-300 text-sm font-bold mb-2">Treść:</label>
                                <textarea
                                    id="note"
                                    rows={4}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="remindAt" className="block text-gray-300 text-sm font-bold mb-2">Data i godzina:</label>
                                <input
                                    type="datetime-local"
                                    id="remindAt"
                                    value={remindAt}
                                    onChange={(e) => setRemindAt(e.target.value)}
                                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setIsFormModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    Anuluj
                                </button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    Zapisz
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}