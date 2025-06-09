/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Plik: crm-ui/src/pages/EditContractPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

// ... (interfejsy Customer i ContractFormData pozostają bez zmian) ...
interface Customer { id: number; name: string; }
interface ContractFormData {
    title: string;
    customerId: number;
    contractNumber: string;
    placeOfSigning: string;
    signedAt: string;
    startDate: string;
    endDate: string;
    scopeOfServices: string;
    netAmount: number;
    paymentTermDays: number;
}


export function EditContractPage() {
    const [formData, setFormData] = useState<Partial<ContractFormData>>({});
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openModal } = useModal();
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        // ✅ POPRAWKA: Użycie backticków (`) do poprawnego formatowania URL
        const fetchCustomers = axios.get(`${api}/customers`, { headers: { Authorization: `Bearer ${token}` } });
        const fetchContract = axios.get(`${api}/contracts/${id}`, { headers: { Authorization: `Bearer ${token}` } });

        Promise.all([fetchCustomers, fetchContract]).then(([customersRes, contractRes]) => {
            const customerData = customersRes.data;
            if (customerData && Array.isArray((customerData as any).$values)) {
                setCustomers((customerData as any).$values);
            } else if (Array.isArray(customerData)) {
                setCustomers(customerData);
            }

            const contractData = contractRes.data;
            setFormData({
                ...contractData,
                signedAt: contractData.signedAt ? new Date(contractData.signedAt).toISOString().split('T')[0] : '',
                startDate: contractData.startDate ? new Date(contractData.startDate).toISOString().split('T')[0] : '',
                endDate: contractData.endDate ? new Date(contractData.endDate).toISOString().split('T')[0] : '',
            });

        }).catch(() => {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się załadować danych.' });
        }).finally(() => setLoading(false));
    }, [api, id, openModal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const updatedContract = {
            ...formData,
            customerId: parseInt(String(formData.customerId)),
            netAmount: parseFloat(String(formData.netAmount)),
            paymentTermDays: parseInt(String(formData.paymentTermDays)),
            signedAt: new Date(formData.signedAt!),
            startDate: formData.startDate ? new Date(formData.startDate) : null,
            endDate: formData.endDate ? new Date(formData.endDate) : null,
        };

        try {
            // ✅ POPRAWKA: Użycie backticków (`) do poprawnego formatowania URL
            await axios.put(`${api}/contracts/${id}`, updatedContract, {
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

    if (loading) return <div className="p-6 text-center text-gray-400">Ładowanie danych...</div>;


    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">✏️ Edytuj kontrakt</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Tytuł kontraktu</label>
                        <input id="title" name="title" type="text" value={formData.title || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label htmlFor="customerId" className="block text-sm font-medium text-gray-300 mb-1">Klient</label>
                        <select id="customerId" name="customerId" value={formData.customerId || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 text-white">
                            <option value="">-- Wybierz klienta --</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="contractNumber" className="block text-sm font-medium text-gray-300 mb-1">Numer umowy</label>
                        <input id="contractNumber" name="contractNumber" type="text" value={formData.contractNumber || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label htmlFor="placeOfSigning" className="block text-sm font-medium text-gray-300 mb-1">Miejsce zawarcia</label>
                        <input id="placeOfSigning" name="placeOfSigning" type="text" value={formData.placeOfSigning || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                </div>
                <div>
                    <label htmlFor="scopeOfServices" className="block text-sm font-medium text-gray-300 mb-1">Szczegółowy zakres usług</label>
                    <textarea id="scopeOfServices" name="scopeOfServices" value={formData.scopeOfServices || ''} onChange={handleChange} rows={4} className="w-full p-2 rounded bg-gray-700 text-white resize-y" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="signedAt" className="block text-sm font-medium text-gray-300 mb-1">Data podpisania</label>
                        <input id="signedAt" name="signedAt" type="date" value={formData.signedAt || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Data rozpoczęcia</label>
                        <input id="startDate" name="startDate" type="date" value={formData.startDate || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">Data zakończenia</label>
                        <input id="endDate" name="endDate" type="date" value={formData.endDate || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="netAmount" className="block text-sm font-medium text-gray-300 mb-1">Wartość netto (PLN)</label>
                        <input id="netAmount" name="netAmount" type="number" step="0.01" value={formData.netAmount || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label htmlFor="paymentTermDays" className="block text-sm font-medium text-gray-300 mb-1">Termin płatności (dni)</label>
                        <input id="paymentTermDays" name="paymentTermDays" type="number" value={formData.paymentTermDays || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                </div>
                <div className="flex justify-end pt-4 gap-3">
                    <Link to="/kontrakty" className="text-gray-400 hover:text-white px-6 py-2 rounded-md transition-colors">Anuluj</Link>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
                        Zapisz zmiany
                    </button>
                </div>
            </form>
        </div>
    );
}