/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Plik: crm-ui/src/pages/AddContractPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

interface Customer {
    id: number;
    name: string;
}

export function AddContractPage() {
    const [title, setTitle] = useState('');
    const [signedAt, setSignedAt] = useState(new Date().toISOString().split('T')[0]);
    const [customerId, setCustomerId] = useState<string>('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const navigate = useNavigate();
    const { openModal } = useModal();

    useEffect(() => {
        const fetchCustomers = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('/api/customers', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    setCustomers((data as any).$values);
                } else if (Array.isArray(data)) {
                    setCustomers(data);
                }
            } catch (err) {
                console.error('Błąd pobierania klientów', err);
            }
        };
        fetchCustomers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId) {
            openModal({ type: 'error', title: 'Błąd Walidacji', message: 'Proszę wybrać klienta.' });
            return;
        }

        const token = localStorage.getItem('token');
        const newContract = {
            title,
            signedAt: new Date(signedAt),
            customerId: parseInt(customerId)
        };

        try {
            await axios.post('/api/contracts', newContract, {
                headers: { Authorization: `Bearer ${token}` }
            });
            openModal({
                type: 'success',
                title: 'Sukces!',
                message: 'Nowy kontrakt został pomyślnie dodany.',
                onConfirm: () => navigate('/kontrakty')
            });
        } catch (err) {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się dodać kontraktu.' });
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">➕ Dodaj nowy kontrakt</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Tytuł kontraktu</label>
                    <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
                </div>
                <div>
                    <label htmlFor="customer" className="block text-sm font-medium text-gray-300 mb-1">Klient</label>
                    <select id="customer" value={customerId} onChange={e => setCustomerId(e.target.value)} required className="w-full p-2 rounded bg-gray-700 text-white border-gray-600">
                        <option value="">-- Wybierz klienta --</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="signedAt" className="block text-sm font-medium text-gray-300 mb-1">Data podpisania</label>
                    <input id="signedAt" type="date" value={signedAt} onChange={e => setSignedAt(e.target.value)} required className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
                        Zapisz kontrakt
                    </button>
                </div>
            </form>
        </div>
    );
}