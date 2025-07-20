/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

interface Tag {
    id: number;
    name: string;
    color?: string;
}

export function AddClientPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const navigate = useNavigate();
    const { openModal, openToast } = useModal();
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTags = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${api}/tags`, { headers: { Authorization: `Bearer ${token}` } });
                setAllTags(response.data.$values || response.data);
            } catch (err) {
                console.error("Error fetching tags:", err);
                openToast('Nie udało się pobrać tagów.', 'error');
            }
        };
        fetchTags();
    }, []);

    const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions);
        const values = options.map(option => Number(option.value));
        setSelectedTagIds(values);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const newClient = {
            name, email, phone, company,
            tagIds: selectedTagIds // Include selected tags
        };

        try {
            await axios.post(`${api}/customers`, newClient, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/klienci');
            openToast('Nowy klient został dodany.', 'success');
        } catch (err: any) {
            openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Nie udało się dodać klienta.' });
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
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">Tagi</label>
                    <select
                        id="tags"
                        multiple
                        value={selectedTagIds.map(String)} // Convert numbers to strings for select value
                        onChange={handleTagChange}
                        className="w-full p-2 rounded bg-gray-700 text-white border-gray-600 h-32"
                    >
                        {allTags.map(tag => (
                            <option key={tag.id} value={tag.id}>
                                {tag.name}
                            </option>
                        ))}
                    </select>
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
