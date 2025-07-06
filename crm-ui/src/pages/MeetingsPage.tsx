/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';

interface Meeting {
    id: number;
    topic: string;
    scheduledAt: string;
    customerName: string;
}

export function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useModal();

    useEffect(() => {
        const fetchMeetings = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get<any>('/api/meetings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    setMeetings((data as any).$values);
                } else if (Array.isArray(data)) {
                    setMeetings(data);
                }
            } catch {
                setError('Nie udało się pobrać spotkań.');
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    const handleDeleteMeeting = async (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć to spotkanie? Tej operacji nie można cofnąć.',
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/Meetings/${id}`);
                    // Odśwież listę po usunięciu
                    setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== id));
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
                            {meetings.length > 0 ? (
                                meetings.map((meeting) => (
                                    <tr key={meeting.id} className="hover:bg-gray-700">
                                        <td className="px-5 py-4 border-b border-gray-700">{meeting.topic}</td>
                                        <td className="px-5 py-4 border-b border-gray-700">{meeting.customerName}</td>
                                        <td className="px-5 py-4 border-b border-gray-700">{new Date(meeting.scheduledAt).toLocaleString()}</td>
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
                                        Brak zaplanowanych spotkań.
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