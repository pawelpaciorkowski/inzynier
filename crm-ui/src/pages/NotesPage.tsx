import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
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
    customerName?: string; // Nazwa klienta zwracana przez backend
    customer?: { name: string }; // Opcjonalnie, jeśli dołączamy dane klienta
    user?: { username: string }; // Opcjonalnie, jeśli dołączamy dane użytkownika
}

// Typ dla opakowanej odpowiedzi z API
interface ApiResponse<T> {
    $values: T[];
}

export function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal, openToast } = useModal();

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<ApiResponse<Note> | Note[]>('/Notes');
            const data = '$values' in response.data ? response.data.$values : response.data;
            const notesArray = Array.isArray(data) ? data : [];
            setNotes(notesArray);
            setFilteredNotes(notesArray);
        } catch (err: unknown) {
            let errorMessage = 'Nie udało się pobrać notatek.';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as any;
                const status = axiosErr.response?.status;

                if (status === 401) {
                    errorMessage = 'Błąd autoryzacji. Spróbuj się zalogować ponownie.';
                } else {
                    errorMessage = axiosErr.response?.data?.message || axiosErr.message;
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []); // Usunięto openModal z zależności

    useEffect(() => {
        fetchNotes();
    }, []); // Usunięto fetchNotes z zależności

    // Filtrowanie notatek na podstawie wyszukiwania
    useEffect(() => {
        const filtered = notes.filter(note =>
            note.content.toLowerCase().includes(search.toLowerCase()) ||
            (note.customer?.name && note.customer.name.toLowerCase().includes(search.toLowerCase()))
        );
        setFilteredNotes(filtered);
    }, [notes, search]);

    const handleDelete = (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć tę notatkę?',
            onConfirm: async () => {
                try {
                    await api.delete(`/Notes/${id}`);
                    fetchNotes(); // Odśwież listę
                    openToast('Notatka została pomyślnie usunięta.', 'success');
                } catch (err: unknown) {
                    let errorMessage = 'Nie udało się usunąć notatki.';
                    if (err && typeof err === 'object' && 'response' in err) {
                        const axiosErr = err as any;
                        // Backend Python zwraca błędy w polu 'error', nie 'message'
                        errorMessage = axiosErr.response?.data?.error || axiosErr.response?.data?.message || axiosErr.message;
                    }
                    // Otwórz modal błędu po zamknięciu modal potwierdzenia
                    setTimeout(() => {
                        openModal({ type: 'error', title: 'Błąd', message: errorMessage });
                    }, 100);
                }
            },
        });
    };

    if (loading) return <p className="p-6 text-center text-gray-400">Ładowanie...</p>;
    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                {error.includes('autoryzacji') && (
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Przejdź do logowania
                    </button>
                )}
            </div>
        );
    }

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

            {/* Wyszukiwarka */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Wyszukaj notatki..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
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
                        {filteredNotes.length > 0 ? (
                            filteredNotes.map((note) => (
                                <tr key={note.id} className="hover:bg-gray-700">
                                    <td className="px-5 py-4 border-b border-gray-600">
                                        {note.content.length > 100
                                            ? note.content.substring(0, 100) + "..."
                                            : note.content}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 font-medium text-indigo-400">
                                        {note.customerName || "Brak"}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600">
                                        {format(new Date(note.createdAt), "dd.MM.yyyy HH:mm", {
                                            locale: pl,
                                        })}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-600 text-center">
                                        <div className="flex justify-center gap-4">
                                            <Link to={`/notatki/edytuj/${note.id}`} title="Edytuj">
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
                                    {search ? 'Brak notatek pasujących do wyszukiwania.' : 'Brak notatek do wyświetlenia.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}