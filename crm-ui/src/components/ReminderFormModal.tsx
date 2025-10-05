import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useModal } from '../context/ModalContext';
import { parseBackendDate } from '../utils/dateUtils';
import api from '../services/api';

interface Reminder {
    id: number;
    note: string;
    remind_at: string;
    user_id: number;
}

interface ReminderFormModalProps {
    currentReminder: Reminder | null;
    onSaveSuccess: () => void;
    onClose: () => void;
}

export const ReminderFormModal: React.FC<ReminderFormModalProps> = ({ currentReminder, onSaveSuccess, onClose }) => {
    const [note, setNote] = useState('');
    const [remindAt, setRemindAt] = useState('');
    const { openModal } = useModal();
    useEffect(() => {
        if (currentReminder) {
            setNote(currentReminder.note);
            // Konwertuj UTC z backendu na czas lokalny dla input datetime-local
            const utcDate = parseBackendDate(currentReminder.remind_at);
            setRemindAt(format(utcDate, "yyyy-MM-dd'T'HH:mm"));
        } else {
            setNote('');
            setRemindAt('');
        }
    }, [currentReminder]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note || !remindAt) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Wszystkie pola są wymagane.' });
            return;
        }

        // remindAt z input datetime-local jest w strefie lokalnej
        // Wysyłamy go jako czas lokalny (bez konwersji na UTC)
        const reminderData = {
            id: currentReminder?.id ?? 0,
            note,
            remind_at: remindAt + ':00', // Format: YYYY-MM-DDTHH:mm:00
        };

        try {
            if (currentReminder) {
                await api.put(`/Reminders/${currentReminder.id}`, reminderData);
            } else {
                await api.post('/Reminders/', reminderData);
            }
            onSaveSuccess();
            onClose();
        } catch (err: unknown) {
            const errorMessage = (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error ||
                (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message ||
                'Wystąpił błąd.';
            openModal({ type: 'error', title: 'Błąd zapisu', message: errorMessage });
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-2xl text-white">
            <h2 className="text-2xl font-bold mb-6">{currentReminder ? 'Edytuj' : 'Dodaj'} przypomnienie</h2>
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
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Anuluj
                    </button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Zapisz
                    </button>
                </div>
            </form>
        </div>
    );
};