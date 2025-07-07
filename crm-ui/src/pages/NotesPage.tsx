import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

// Definicja typu dla notatki, zgodna z DTO z API
interface Note {
    id: number;
    content: string;
    createdAt: string;
    userId: number;
    customerId?: number;
    customer?: { name: string }; // Opcjonalnie, jeśli dołączamy dane klienta
    user?: { username: string }; // Opcjonalnie, jeśli dołączamy dane użytkownika
}

// Typ dla opakowanej odpowiedzi z API
interface ApiResponse<T> {
    $values: T[];
}

export function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useModal();

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<ApiResponse<Note> | Note[]>('/api/Notes');
            const data = '$values' in response.data ? response.data.$values : response.data;
            setNotes(data);
        } catch (err: unknown) {
            let errorMessage = 'Nie udało się pobrać notatek.';
            if (axios.isAxiosError(err) && err.response) {
                errorMessage = err.response.data?.message || err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [openModal]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleDelete = (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć tę notatkę?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/Notes/${id}`);
                    openModal({ type: 'success', title: 'Usunięto', message: 'Notatka została usunięta.' });
                    fetchNotes(); // Odśwież listę
                } catch (err: unknown) {
                    let errorMessage = 'Nie udało się usunąć notatki.';
                    if (axios.isAxiosError(err) && err.response) {
                        errorMessage = err.response.data?.message || err.message;
                    }
                    openModal({ type: 'error', title: 'Błąd', message: errorMessage });
                }
            },
        });
    };

    if (loading) return <p className="p-6 text-center text-gray-400">Ładowanie...</p>;
    if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">📝 Notatki</h1>
                <Link to="/notatki/dodaj">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Dodaj notatkę
                    </button>
                </Link>
            </div>

            <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal text-white">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                Treść
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                Klient
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
                                Data utworzenia
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-600 text-center text-xs font-semibold uppercase tracking-wider">
                                Akcje
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {notes.length > 0 ? (
                            notes.map((note) => (
                                <tr key={note.id} className="hover:bg-gray-700">
                                    <td className="px-5 py-4 border-b border-gray-600">
                                        {note.content.length > 100
                                            ? note.content.substring(0, 100) + "..."
                                            : note.content}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 font-medium text-indigo-400">
                                        {note.customer?.name || "Brak"}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600">
                                        {format(new Date(note.createdAt), "dd.MM.yyyy HH:mm", {
                                            locale: pl,
                                        })}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-center">
                                        <div className="flex justify-center gap-4">
                                            <Link to={`/notatki/edytuj/:id`} title="Edytuj">
                                                <PencilIcon className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(note.id)}
                                                title="Usuń"
                                            >
                                                <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500">
                                    Brak notatek do wyświetlenia.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}