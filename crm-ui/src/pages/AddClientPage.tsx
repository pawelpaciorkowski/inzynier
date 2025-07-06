/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

export function AddClientPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const navigate = useNavigate();
    const { openModal } = useModal();
    const api = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const newClient = { name, email, phone, company };

        try {
            await axios.post(`${api}/customers`, newClient, {
                headers: { Authorization: `Bearer ${token}` }
            });
            openModal({
                type: 'success',
                title: 'Sukces!',
                message: 'Nowy klient został pomyślnie dodany.',
                onConfirm: () => navigate('/klienci')
            });
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
                <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
                        Zapisz klienta
                    </button>
                </div>
            </form>
        </div>
    );
}