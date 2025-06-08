/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Plik: crm-ui/src/pages/EditContractPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

interface Customer {
    id: number;
    name: string;
}

interface ContractData {
    title: string;
    signedAt: string;
    customerId: number;
}

export function EditContractPage() {
    const [formData, setFormData] = useState<Partial<ContractData>>({});
    const [customers, setCustomers] = useState<Customer[]>([]);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openModal } = useModal();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchCustomers = axios.get('/api/customers', { headers: { Authorization: `Bearer ${token}` } });
        const fetchContract = axios.get(`/api/contracts/${id}`, { headers: { Authorization: `Bearer ${token}` } });

        Promise.all([fetchCustomers, fetchContract]).then(([customersRes, contractRes]) => {
            // Klienci
            const customerData = customersRes.data;
            if (customerData && Array.isArray((customerData as any).$values)) {
                setCustomers((customerData as any).$values);
            } else if (Array.isArray(customerData)) {
                setCustomers(customerData);
            }

            // Kontrakt
            const contractData = contractRes.data;
            setFormData({
                title: contractData.title,
                signedAt: new Date(contractData.signedAt).toISOString().split('T')[0],
                customerId: contractData.customerId
            });

        }).catch(err => {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się załadować danych.' });
            console.error(err);
        });
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const updatedContract = {
            ...formData,
            signedAt: new Date(formData.signedAt!),
            customerId: parseInt(String(formData.customerId))
        };

        try {
            await axios.put(`/api/contracts/${id}`, updatedContract, {
                headers: { Authorization: `Bearer ${token}` }
            });
            openModal({
                type: 'success',
                title: 'Sukces!',
                message: 'Kontrakt został pomyślnie zaktualizowany.',
                onConfirm: () => navigate('/kontrakty')
            });
        } catch (err) {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się zaktualizować kontraktu.' });
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">✏️ Edytuj kontrakt</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Tytuł kontraktu</label>
                    <input id="title" name="title" type="text" value={formData.title || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
                </div>
                <div>
                    <label htmlFor="customerId" className="block text-sm font-medium text-gray-300 mb-1">Klient</label>
                    <select id="customerId" name="customerId" value={formData.customerId || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 text-white border-gray-600">
                        <option value="">-- Wybierz klienta --</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="signedAt" className="block text-sm font-medium text-gray-300 mb-1">Data podpisania</label>
                    <input id="signedAt" name="signedAt" type="date" value={formData.signedAt || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
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