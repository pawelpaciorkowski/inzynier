// Plik: crm-ui/src/pages/RemindersPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

// Definicja typu dla pojedynczego przypomnienia (zgodna z API)
interface Reminder {
    id: number;
    note: string;
    remindAt: string;
    userId: number;
}

// Typ dla opakowanej odpowiedzi z API (częsty wzorzec w Twoim projekcie)
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

    // Stany dla modala formularza
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);
    const [note, setNote] = useState('');
    const [remindAt, setRemindAt] = useState('');

    // Nowe stany dla modala przypomnienia
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [reminderToShow, setReminderToShow] = useState<Reminder | null>(null);

    // Funkcja do pobierania danych z lepszą obsługą błędów
    const fetchReminders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<ApiResponse<Reminder> | Reminder[]>('/api/Reminders');
            // Poprawnie obsługuje oba formaty odpowiedzi API
            const data = '$values' in response.data ? response.data.$values : response.data;
            setReminders(data);
            setFilteredReminders(data);
        } catch (err: unknown) { // Używamy 'unknown' dla bezpieczeństwa typów
            let errorMessage = 'Nie udało się pobrać przypomnień.';
            if (axios.isAxiosError(err) && err.response) {
                errorMessage = err.response.data?.message || err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);

    // Logika wyświetlania modala przypomnienia
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            reminders.forEach(reminder => {
                const remindAtDate = new Date(reminder.remindAt);
                // Sprawdź, czy przypomnienie jest w przyszłości i czy jeszcze nie zostało wyświetlone
                if (remindAtDate <= now && !localStorage.getItem(`reminder-${reminder.id}-shown`)) {
                    setReminderToShow(reminder);
                    setIsReminderModalOpen(true);
                    localStorage.setItem(`reminder-${reminder.id}-shown`, 'true'); // Oznacz jako wyświetlone
                }
            });
        }, 1000); // Sprawdzaj co sekundę

        return () => clearInterval(interval); // Czyść interwał przy odmontowaniu komponentu
    }, [reminders]);

    // Filtrowanie listy (bez zmian, działa poprawnie)
    useEffect(() => {
        const filtered = reminders.filter(r =>
            r.note.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredReminders(filtered);
    }, [searchQuery, reminders]);

    // Otwieranie modala formularza
    const handleOpenFormModal = (reminder: Reminder | null) => {
        setCurrentReminder(reminder);
        if (reminder) {
            setNote(reminder.note);
            setRemindAt(format(new Date(reminder.remindAt), "yyyy-MM-dd'T'HH:mm"));
        } else {
            // Resetowanie formularza przy dodawaniu nowego
            setNote('');
            setRemindAt('');
        }
        setIsFormModalOpen(true);
    };

    // Zapisywanie (dodawanie/edycja)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim() || !remindAt) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Wszystkie pola są wymagane.' });
            return;
        }

        const reminderData = {
            id: currentReminder?.id ?? 0,
            note,
            remindAt: new Date(remindAt + ':00Z').toISOString(),
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
            await fetchReminders(); // Ponowne pobranie danych po sukcesie
        } catch (err: unknown) {
            let errorMessage = 'Wystąpił nieoczekiwany błąd.';
            if (axios.isAxiosError(err) && err.response) {
                errorMessage = err.response.data?.message || err.message;
            }
            openModal({ type: 'error', title: 'Błąd zapisu', message: errorMessage });
        }
    };

    // Usuwanie
    const handleDelete = (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć to przypomnienie?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/Reminders/${id}`);
                    openModal({ type: 'success', title: 'Usunięto', message: 'Przypomnienie zostało usunięte.' });
                    await fetchReminders(); // Ponowne pobranie danych
                } catch (err: unknown) {
                    let errorMessage = 'Nie udało się usunąć przypomnienia.';
                    if (axios.isAxiosError(err) && err.response) {
                        errorMessage = err.response.data?.message || err.message;
                    }
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
                        <li className="p-4 text-center text-gray-500">Brak przypomnień do wyświetlenia.</li>
                    )}
                </ul>
            </div>

            {/* Modal do dodawania/edycji przypomnienia */}
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

            {/* Modal wyświetlający przypomnienie */}
            {isReminderModalOpen && reminderToShow && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in">
                    <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-2xl text-white">
                        <h2 className="text-2xl font-bold mb-4">🔔 Przypomnienie!</h2>
                        <p className="text-lg mb-6">{reminderToShow.note}</p>
                        <p className="text-gray-400 text-sm mb-6">
                            Ustawiono na: {format(new Date(reminderToShow.remindAt), "d MMMM yyyy, HH:mm", { locale: pl })}
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsReminderModalOpen(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Zamknij
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RemindersPage; // Dobra praktyka, aby dodać default export