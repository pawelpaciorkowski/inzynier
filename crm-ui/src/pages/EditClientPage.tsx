/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

interface Tag {
    id: number;
    name: string;
    color?: string;
}

interface CustomerFormData {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    tagIds?: number[]; // Added tagIds to the form data
}

export function EditClientPage() {
    const [formData, setFormData] = useState<Partial<CustomerFormData>>({});
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openModal, openToast } = useModal();
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!id) {
            navigate('/klienci');
            return;
        }

        const fetchClientAndTags = async () => {
            try {
                // Fetch client data
                const clientResponse = await axios.get(`${api}/customers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                const clientData = clientResponse.data;

                // Fetch all tags
                const tagsResponse = await axios.get(`${api}/tags`, { headers: { Authorization: `Bearer ${token}` } });
                const tagsData = tagsResponse.data.$values || tagsResponse.data;

                setAllTags(tagsData);

                // Set form data
                setFormData({
                    name: clientData.name,
                    email: clientData.email,
                    phone: clientData.phone,
                    company: clientData.company,
                });

                // Set selected tags
                if (clientData.customerTags && clientData.customerTags.$values) {
                    setSelectedTagIds(clientData.customerTags.$values.map((ct: { tagId: number }) => ct.tagId));
                } else if (clientData.customerTags) {
                    setSelectedTagIds(clientData.customerTags.map((ct: { tagId: number }) => ct.tagId));
                }

            } catch (err: unknown) {
                let errorMessage = 'Nie udało się załadować danych klienta lub tagów.';
                if (axios.isAxiosError(err) && err.response) {
                    errorMessage = (err.response.data as { message?: string })?.message || err.message;
                }
                openModal({ type: 'error', title: 'Błąd', message: errorMessage });
            } finally {
                setLoading(false);
            }
        };

        fetchClientAndTags();
    }, [api, id, navigate, openModal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
        const updatedClientData = {
            ...formData,
            tagIds: selectedTagIds // Include selected tags
        };

        try {
            await axios.put(`${api}/customers/${id}`, updatedClientData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/klienci');
            openToast('Dane klienta zostały zaktualizowane.', 'success');
        } catch (err: unknown) {
            let errorMessage = 'Nie udało się zaktualizować danych.';
            if (axios.isAxiosError(err) && err.response) {
                errorMessage = (err.response.data as { message?: string })?.message || err.message;
            }
            openModal({ type: 'error', title: 'Błąd', message: errorMessage });
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-400">Ładowanie danych klienta...</div>;
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">✏️ Edytuj klienta</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Imię i nazwisko / Nazwa</label>
                    <input id="name" name="name" type="text" value={formData.name || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Telefon</label>
                    <input id="phone" name="phone" type="text" value={formData.phone || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
                </div>
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Firma</label>
                    <input id="company" name="company" type="text" value={formData.company || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
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
                        Zapisz zmiany
                    </button>
                </div>
            </form>
        </div>
    );
}
