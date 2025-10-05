/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

interface Meeting {
    id: number;
    topic: string;
    scheduledAt: string;
    customerName: string;
}

export function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal, openToast } = useModal();

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const res = await api.get<any>('/Meetings');
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    setMeetings((data as any).$values);
                    setFilteredMeetings((data as any).$values);
                } else if (Array.isArray(data)) {
                    setMeetings(data);
                    setFilteredMeetings(data);
                }
            } catch {
                setError('Nie udało się pobrać spotkań.');
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    // Filtrowanie spotkań na podstawie wyszukiwania
    useEffect(() => {
        const filtered = meetings.filter(meeting =>
            meeting.topic.toLowerCase().includes(search.toLowerCase()) ||
            meeting.customerName.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredMeetings(filtered);
    }, [meetings, search]);

    const handleDeleteMeeting = async (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć to spotkanie? Tej operacji nie można cofnąć.',
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await api.delete(`/Meetings/${id}`);
                    // Odśwież listę po usunięciu
                    setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== id));
                    openToast('Spotkanie zostało pomyślnie usunięte.', 'success');
                } catch (err) {
                    alert('Nie udało się usunąć spotkania.');
                    console.error('Błąd usuwania spotkania:', err);
                }
            },
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">🤝 Spotkania</h1>
                <Link to="/spotkania/dodaj">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                        + Zaplanuj spotkanie
                    </button>
                </Link>
            </div>

            {loading && <p className="text-center text-gray-400">Ładowanie danych...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && (
                <>
                    {/* Wyszukiwarka */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Wyszukaj spotkania..."
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
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Temat</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Klient</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Zaplanowano na</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-center text-xs font-semibold uppercase tracking-wider">Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMeetings.length > 0 ? (
                                    filteredMeetings.map((meeting) => (
                                        <tr key={meeting.id} className="hover:bg-gray-700">
                                            <td className="px-5 py-4 border-b border-gray-700">{meeting.topic}</td>
                                            <td className="px-5 py-4 border-b border-gray-700">{meeting.customerName}</td>
                                            <td className="px-5 py-4 border-b border-gray-700">{new Date(meeting.scheduledAt.endsWith('Z') ? meeting.scheduledAt : meeting.scheduledAt + 'Z').toLocaleString('pl-PL')}</td>
                                            <td className="px-5 py-4 border-b border-gray-700 text-center">
                                                <div className="flex justify-center gap-4">
                                                    <Link to={`/spotkania/edytuj/${meeting.id}`} title="Edytuj"><PencilIcon className="w-5 h-5 text-gray-400 hover:text-yellow-400" /></Link>
                                                    <button onClick={() => handleDeleteMeeting(meeting.id)} title="Usuń"><TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-gray-500">
                                            {search ? 'Brak spotkań pasujących do wyszukiwania.' : 'Brak zaplanowanych spotkań.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}