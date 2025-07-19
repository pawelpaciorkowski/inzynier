import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useModal } from '../context/ModalContext';

interface Customer {
    id: number;
    name: string;
}

interface Contract {
    $id?: string; // Entity Framework Core reference
    id: number;
    title: string;
    contractNumber: string;
    placeOfSigning: string;
    signedAt: string;
    startDate: string | null;
    endDate: string | null;
    netAmount: number | null;
    paymentTermDays: number | null;
    scopeOfServices: string;
    customerId: number;
}

export function EditContractPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [contractNumber, setContractNumber] = useState('');
    const [placeOfSigning, setPlaceOfSigning] = useState('');
    const [signedAt, setSignedAt] = useState<string>(format(new Date(), 'yyyy-MM-ddTHH:mm'));
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [netAmount, setNetAmount] = useState<string>('');
    const [paymentTermDays, setPaymentTermDays] = useState<string>('');
    const [scopeOfServices, setScopeOfServices] = useState('');
    const [customerId, setCustomerId] = useState<number | string>('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal, openToast } = useModal();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contractRes, customersRes] = await Promise.all([
                    axios.get<Contract>(`/api/Contracts/${id}`),
                    axios.get<Customer[]>('/api/Customers'),
                ]);

                setTitle(contractRes.data.title);
                setContractNumber(contractRes.data.contractNumber);
                setPlaceOfSigning(contractRes.data.placeOfSigning);
                setSignedAt(format(new Date(contractRes.data.signedAt), 'yyyy-MM-ddTHH:mm'));
                setStartDate(contractRes.data.startDate ? format(new Date(contractRes.data.startDate), 'yyyy-MM-ddTHH:mm') : '');
                setEndDate(contractRes.data.endDate ? format(new Date(contractRes.data.endDate), 'yyyy-MM-ddTHH:mm') : '');
                setNetAmount(contractRes.data.netAmount ? contractRes.data.netAmount.toString() : '');
                setPaymentTermDays(contractRes.data.paymentTermDays ? contractRes.data.paymentTermDays.toString() : '');
                setScopeOfServices(contractRes.data.scopeOfServices);
                setCustomerId(contractRes.data.customerId);

                const customerData = customersRes.data;
                let customersData: Customer[] = [];

                if (customerData && typeof customerData === 'object' && '$values' in customerData && Array.isArray(customerData.$values)) {
                    customersData = customerData.$values;
                } else if (Array.isArray(customerData)) {
                    customersData = customerData;
                }

                setCustomers(customersData);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
                openModal({ type: 'error', title: 'Błąd', message: `Nie udało się pobrać danych: ${errorMessage}` });
                setError(`Nie udało się pobrać danych: ${errorMessage}`);
                console.error('Błąd pobierania danych:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, openModal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!title.trim() || !customerId || !signedAt) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Tytuł, klient i data podpisania są wymagane.' });
            setLoading(false);
            return;
        }

        try {
            await axios.put(`/api/Contracts/${id}`, {
                id: parseInt(id as string),
                title,
                contractNumber,
                placeOfSigning,
                signedAt: new Date(signedAt).toISOString(),
                startDate: startDate ? new Date(startDate).toISOString() : null,
                endDate: endDate ? new Date(endDate).toISOString() : null,
                netAmount: netAmount ? parseFloat(netAmount) : null,
                paymentTermDays: paymentTermDays ? parseInt(paymentTermDays) : null,
                scopeOfServices,
                customerId: parseInt(customerId as string),
            });
            openToast('Kontrakt został pomyślnie zaktualizowany.', 'success');
            navigate('/kontrakty');
        } catch {
            // Błąd zostanie obsłużony przez interceptor Axios
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-white flex justify-center items-center h-screen">
                <p>Ładowanie...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-white flex justify-center items-center h-screen">
                <p className="text-red-500">Błąd: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Edytuj Kontrakt</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-300 text-sm font-bold mb-2">Tytuł:</label>
                        <input
                            type="text"
                            id="title"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="contractNumber" className="block text-gray-300 text-sm font-bold mb-2">Numer Kontraktu:</label>
                        <input
                            type="text"
                            id="contractNumber"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={contractNumber}
                            onChange={(e) => setContractNumber(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="placeOfSigning" className="block text-gray-300 text-sm font-bold mb-2">Miejsce Zawarcia:</label>
                        <input
                            type="text"
                            id="placeOfSigning"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={placeOfSigning}
                            onChange={(e) => setPlaceOfSigning(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="signedAt" className="block text-gray-300 text-sm font-bold mb-2">Data Podpisania:</label>
                        <input
                            type="datetime-local"
                            id="signedAt"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={signedAt}
                            onChange={(e) => setSignedAt(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="startDate" className="block text-gray-300 text-sm font-bold mb-2">Data Rozpoczęcia:</label>
                        <input
                            type="datetime-local"
                            id="startDate"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="endDate" className="block text-gray-300 text-sm font-bold mb-2">Data Zakończenia:</label>
                        <input
                            type="datetime-local"
                            id="endDate"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="netAmount" className="block text-gray-300 text-sm font-bold mb-2">Kwota Netto:</label>
                        <input
                            type="number"
                            id="netAmount"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={netAmount}
                            onChange={(e) => setNetAmount(e.target.value)}
                            step="0.01"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="paymentTermDays" className="block text-gray-300 text-sm font-bold mb-2">Termin Płatności (dni):</label>
                        <input
                            type="number"
                            id="paymentTermDays"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={paymentTermDays}
                            onChange={(e) => setPaymentTermDays(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="scopeOfServices" className="block text-gray-300 text-sm font-bold mb-2">Szczegółowy Zakres Usług:</label>
                        <textarea
                            id="scopeOfServices"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400 h-32"
                            value={scopeOfServices}
                            onChange={(e) => setScopeOfServices(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="customerId" className="block text-gray-300 text-sm font-bold mb-2">Klient:</label>
                        <select
                            id="customerId"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            required
                        >
                            <option value="">-- Wybierz klienta --</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => navigate('/kontrakty')}
                        >
                            Powrót
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? 'Aktualizowanie...' : 'Zapisz Zmiany'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}