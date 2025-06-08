/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Plik: crm-ui/src/pages/NotesPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Note {
    id: number;
    content: string;
    customerName: string;
}

export function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('/api/notes', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    setNotes((data as any).$values);
                } else if (Array.isArray(data)) {
                    setNotes(data);
                }
            } catch (err) {
                setError('Nie udało się pobrać notatek.');
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">📝 Notatki</h1>
                <Link to="/notatki/dodaj">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                        + Dodaj notatkę
                    </button>
                </Link>
            </div>

            {loading && <p className="text-center text-gray-400">Ładowanie danych...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal text-white">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Treść (fragment)</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Klient</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-center text-xs font-semibold uppercase tracking-wider">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notes.length > 0 ? (
                                notes.map((note) => (
                                    <tr key={note.id} className="hover:bg-gray-700">
                                        <td className="px-5 py-4 border-b border-gray-700">{note.content}</td>
                                        <td className="px-5 py-4 border-b border-gray-700">{note.customerName}</td>
                                        <td className="px-5 py-4 border-b border-gray-700 text-center">
                                            <div className="flex justify-center gap-4">
                                                <button title="Edytuj"><PencilIcon className="w-5 h-5 text-gray-400 hover:text-yellow-400" /></button>
                                                <button title="Usuń"><TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-10 text-gray-500">
                                        Brak notatek do wyświetlenia.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}