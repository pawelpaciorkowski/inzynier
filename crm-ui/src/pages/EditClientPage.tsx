/* eslint-disable @typescript-eslint/no-unused-vars */
// Plik: crm-ui/src/pages/EditClientPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

// Ten interfejs definiuje, jakie pola ma formularz
interface CustomerFormData {
    name: string;
    email: string;
    phone: string;
    company: string;
}

export function EditClientPage() {
    // Używamy Partial, bo początkowo stan jest pusty, zanim załadujemy dane
    const [formData, setFormData] = useState<Partial<CustomerFormData>>({});
    const [loading, setLoading] = useState(true);
    const { id } = useParams<{ id: string }>(); // Pobieramy ID klienta z adresu URL
    const navigate = useNavigate();
    const { openModal } = useModal();
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!id) {
            navigate('/klienci'); // Jeśli nie ma ID, wróć do listy
            return;
        }

        axios.get(`${api}/customers/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                // Poprawnie przypisujemy dane klienta do stanu formularza
                const clientData = res.data;
                setFormData({
                    name: clientData.name,
                    email: clientData.email,
                    phone: clientData.phone,
                    company: clientData.company,
                });
            })
            .catch(err => {
                openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się załadować danych klienta.' });
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [api, id, navigate, openModal]); // Dodajemy zależności do hooka

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${api}/customers/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            openModal({
                type: 'success',
                title: 'Sukces!',
                message: 'Dane klienta zostały pomyślnie zaktualizowane.',
                onConfirm: () => navigate('/klienci')
            });
        } catch (err) {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się zaktualizować danych.' });
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
                <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
                        Zapisz zmiany
                    </button>
                </div>
            </form>
        </div>
    );
}