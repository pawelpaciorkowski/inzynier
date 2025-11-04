/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

interface Tag {
    id: number;
    name: string;
    color?: string;
}

interface User {
    id: number;
    username: string;
    email: string;
}

export function AddClientPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [representativeUserId, setRepresentativeUserId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { openModal, openToast } = useModal();

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await api.get('/Tags/');
                setAllTags(response.data.$values || response.data);
            } catch (err) {
                console.error("Error fetching tags:", err);
                openToast('Nie udało się pobrać tagów.', 'error');
            }
        };
        const fetchUsers = async () => {
            try {
                const response = await api.get('/Profile/users-list');
                setUsers(response.data || []);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };
        fetchTags();
        fetchUsers();
    }, []);

    const handleTagToggle = (tagId: number) => {
        setSelectedTagIds(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const newClient = {
            name, email, phone, company,
            representativeUserId: representativeUserId || null,
            tagIds: selectedTagIds // Include selected tags
        };

        try {
            await api.post('/Customers/', newClient);
            navigate('/klienci');
            openToast('Nowy klient został dodany.', 'success');
        } catch (err: any) {
            // Backend Python zwraca błędy w polu 'error', nie 'message'
            const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Nie udało się dodać klienta.';
            openModal({ type: 'error', title: 'Błąd', message: errorMessage });
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">👤 Dodaj nowego klienta</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Imię i nazwisko / Nazwa</label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Telefon</label>
                    <input id="phone" type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
                </div>
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Firma</label>
                    <input id="company" type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
                </div>
                <div>
                    <label htmlFor="representative" className="block text-sm font-medium text-gray-300 mb-1">Przedstawiciel (pracownik firmy)</label>
                    <select
                        id="representative"
                        value={representativeUserId || ''}
                        onChange={e => setRepresentativeUserId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full p-2 rounded bg-gray-700 text-white border-gray-600"
                    >
                        <option value="">-- Wybierz przedstawiciela --</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tagi (kliknij aby wybrać)</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-600 rounded bg-gray-700 p-2">
                        {allTags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => handleTagToggle(tag.id)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedTagIds.includes(tag.id)
                                            ? 'ring-2 ring-white ring-opacity-50'
                                            : 'opacity-70 hover:opacity-100'
                                            }`}
                                        style={{
                                            backgroundColor: tag.color || '#3B82F6',
                                            color: 'white'
                                        }}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm">Brak dostępnych tagów</p>
                        )}
                    </div>
                    {selectedTagIds.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-400 mb-1">Wybrane tagi:</p>
                            <div className="flex flex-wrap gap-1">
                                {selectedTagIds.map(tagId => {
                                    const tag = allTags.find(t => t.id === tagId);
                                    return tag ? (
                                        <span
                                            key={tag.id}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: tag.color || '#3B82F6',
                                                color: 'white'
                                            }}
                                        >
                                            {tag.name}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-between pt-4">
                    <button type="button" onClick={() => navigate('/klienci')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors">
                        Powrót
                    </button>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
                        Zapisz klienta
                    </button>
                </div>
            </form>
        </div>
    );
}
