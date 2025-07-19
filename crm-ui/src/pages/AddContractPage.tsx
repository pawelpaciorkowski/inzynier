/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import ClientSelectModal from '../components/ClientSelectModal';

interface Customer {
    id: number;
    name: string;
}

export function AddContractPage() {
    const [formData, setFormData] = useState({
        title: '',
        customerId: '',
        contractNumber: '',
        placeOfSigning: 'Warszawa',
        signedAt: new Date().toISOString().split('T')[0],
        startDate: '',
        endDate: '',
        scopeOfServices: '',
        netAmount: '',
        paymentTermDays: '14',
    });

    const [customers, setCustomers] = useState<Customer[]>([]);
    const navigate = useNavigate();
    const { openModal } = useModal();
    const api = import.meta.env.VITE_API_URL;
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${api}/customers`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    setCustomers((data as any).$values);
                } else if (Array.isArray(data)) {
                    setCustomers(data);
                }
            } catch (err: any) {
                openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Nie udało się pobrać klientów.' });
                console.error('Błąd pobierania klientów', err);
            }
        };
        fetchCustomers();
    }, [api]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerId) {
            openModal({ type: 'error', title: 'Błąd Walidacji', message: 'Proszę wybrać klienta.' });
            return;
        }

        const token = localStorage.getItem('token');
        const newContract = {
            ...formData,
            customerId: parseInt(formData.customerId),
            netAmount: parseFloat(formData.netAmount),
            paymentTermDays: parseInt(formData.paymentTermDays),
            signedAt: new Date(formData.signedAt),
            startDate: formData.startDate ? new Date(formData.startDate) : null,
            endDate: formData.endDate ? new Date(formData.endDate) : null,
        };

        try {
            await axios.post(`${api}/contracts`, newContract, {
                headers: { Authorization: `Bearer ${token}` }
            });
            openModal({
                type: 'success',
                title: 'Sukces!',
                message: 'Nowy kontrakt został pomyślnie dodany.',
                onConfirm: () => navigate('/kontrakty')
            });
        } catch (err: any) {
            openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Nie udało się dodać kontraktu.' });
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">➕ Dodaj nowy kontrakt</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md space-y-4">

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Tytuł kontraktu</label>
                        <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label htmlFor="customerId" className="block text-sm font-medium text-gray-300 mb-1">Klient</label>
                        <button type="button" onClick={() => setShowClientModal(true)} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 text-left">
                            {selectedCustomer ? `Klient: ${selectedCustomer.name}` : '-- Wybierz klienta --'}
                        </button>
                        {showClientModal && (
                            <ClientSelectModal
                                clients={customers}
                                onSelect={client => {
                                    setSelectedCustomer(client);
                                    setFormData(prev => ({ ...prev, customerId: client.id.toString() }));
                                    setShowClientModal(false);
                                }}
                                onClose={() => setShowClientModal(false)}
                            />
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="contractNumber" className="block text-sm font-medium text-gray-300 mb-1">Numer umowy</label>
                        <input id="contractNumber" name="contractNumber" type="text" value={formData.contractNumber} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label htmlFor="placeOfSigning" className="block text-sm font-medium text-gray-300 mb-1">Miejsce zawarcia</label>
                        <input id="placeOfSigning" name="placeOfSigning" type="text" value={formData.placeOfSigning} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                </div>

                <div>
                    <label htmlFor="scopeOfServices" className="block text-sm font-medium text-gray-300 mb-1">Szczegółowy zakres usług</label>
                    <textarea id="scopeOfServices" name="scopeOfServices" value={formData.scopeOfServices} onChange={handleChange} rows={4} className="w-full p-2 rounded bg-gray-700 text-white resize-y" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="signedAt" className="block text-sm font-medium text-gray-300 mb-1">Data podpisania</label>
                        <input id="signedAt" name="signedAt" type="date" value={formData.signedAt} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Data rozpoczęcia</label>
                        <input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">Data zakończenia</label>
                        <input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="netAmount" className="block text-sm font-medium text-gray-300 mb-1">Wartość netto (PLN)</label>
                        <input id="netAmount" name="netAmount" type="number" step="0.01" value={formData.netAmount} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label htmlFor="paymentTermDays" className="block text-sm font-medium text-gray-300 mb-1">Termin płatności (dni)</label>
                        <input id="paymentTermDays" name="paymentTermDays" type="number" value={formData.paymentTermDays} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                    <Link to="/kontrakty" className="text-gray-400 hover:text-white px-6 py-2 rounded-md transition-colors">Anuluj</Link>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
                        Zapisz kontrakt
                    </button>
                </div>
            </form>
        </div>
    );
}