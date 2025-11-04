import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

interface Customer {
    id: number;
    name: string;
}

interface Service {
    id: number;
    name: string;
    price: number;
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
    services?: Array<{ serviceId: number; serviceName: string; price: number; quantity: number }>;
    serviceIds?: number[];
}

export function EditContractPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [contractNumber, setContractNumber] = useState('');
    const [placeOfSigning, setPlaceOfSigning] = useState('');
    const [signedAt, setSignedAt] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [netAmount, setNetAmount] = useState<string>('');
    const [paymentTermDays, setPaymentTermDays] = useState<string>('');
    const [scopeOfServices, setScopeOfServices] = useState('');
    const [customerId, setCustomerId] = useState<number | string>('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
    const [serviceQuantities, setServiceQuantities] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal, openToast } = useModal();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contractRes, customersRes, servicesRes] = await Promise.all([
                    api.get<Contract>(`/Contracts/${id}`),
                    api.get<Customer[]>('/Customers/'),
                    api.get<Service[]>('/Services/'),
                ]);

                setTitle(contractRes.data.title || '');
                setContractNumber(contractRes.data.contractNumber || '');
                setPlaceOfSigning(contractRes.data.placeOfSigning || '');
                setSignedAt(contractRes.data.signedAt ? format(new Date(contractRes.data.signedAt), 'yyyy-MM-dd') : '');
                setStartDate(contractRes.data.startDate ? format(new Date(contractRes.data.startDate), 'yyyy-MM-dd') : '');
                setEndDate(contractRes.data.endDate ? format(new Date(contractRes.data.endDate), 'yyyy-MM-dd') : '');
                setNetAmount(contractRes.data.netAmount ? contractRes.data.netAmount.toString() : '');
                // Ustaw paymentTermDays - obsłuż null/undefined
                setPaymentTermDays(contractRes.data.paymentTermDays != null ? contractRes.data.paymentTermDays.toString() : '');
                // Ustaw scopeOfServices - obsłuż null/undefined
                setScopeOfServices(contractRes.data.scopeOfServices || '');
                setCustomerId(contractRes.data.customerId);

                // Ustaw wybrane usługi z kontraktu
                if (contractRes.data.services && Array.isArray(contractRes.data.services)) {
                    const serviceIds: number[] = [];
                    const quantities: Record<number, number> = {};
                    contractRes.data.services.forEach((service: { serviceId: number; serviceName: string; price: number; quantity: number }) => {
                        serviceIds.push(service.serviceId);
                        quantities[service.serviceId] = service.quantity || 1;
                    });
                    setSelectedServiceIds(serviceIds);
                    setServiceQuantities(quantities);
                } else if (contractRes.data.serviceIds && Array.isArray(contractRes.data.serviceIds)) {
                    setSelectedServiceIds(contractRes.data.serviceIds);
                    contractRes.data.serviceIds.forEach((sid: number) => {
                        setServiceQuantities(prev => ({ ...prev, [sid]: 1 }));
                    });
                }

                const customerData = customersRes.data;
                let customersData: Customer[] = [];

                if (customerData && typeof customerData === 'object' && '$values' in customerData && Array.isArray(customerData.$values)) {
                    customersData = customerData.$values;
                } else if (Array.isArray(customerData)) {
                    customersData = customerData;
                }

                setCustomers(customersData);

                // Pobierz listę wszystkich usług
                const servicesData = servicesRes.data;
                let servicesList: Service[] = [];
                if (servicesData && typeof servicesData === 'object' && '$values' in servicesData && Array.isArray(servicesData.$values)) {
                    servicesList = servicesData.$values;
                } else if (Array.isArray(servicesData)) {
                    servicesList = servicesData;
                }
                setServices(servicesList);
            } catch (err: unknown) {
                const errorMessage = (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data && typeof err.response.data.message === 'string')
                    ? err.response.data.message
                    : 'Nie udało się pobrać danych.';
                openModal({ type: 'error', title: 'Błąd', message: errorMessage });
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, openModal]);

    // Oblicz automatycznie netAmount na podstawie wybranych usług
    const calculateNetAmount = useCallback(() => {
        let total = 0;
        selectedServiceIds.forEach(serviceId => {
            const service = services.find(s => s.id === serviceId);
            const quantity = serviceQuantities[serviceId] || 1;
            if (service && service.price) {
                total += service.price * quantity;
            }
        });
        return total.toFixed(2);
    }, [selectedServiceIds, serviceQuantities, services]);

    // Aktualizuj netAmount gdy zmienią się wybrane usługi lub ilości
    useEffect(() => {
        const calculatedAmount = calculateNetAmount();
        if (selectedServiceIds.length > 0) {
            setNetAmount(calculatedAmount);
        }
    }, [calculateNetAmount, selectedServiceIds]);

    const handleServiceToggle = (serviceId: number) => {
        setSelectedServiceIds(prev => {
            if (prev.includes(serviceId)) {
                // Usuń usługę
                const newQuantities = { ...serviceQuantities };
                delete newQuantities[serviceId];
                setServiceQuantities(newQuantities);
                return prev.filter(id => id !== serviceId);
            } else {
                // Dodaj usługę z domyślną ilością 1
                setServiceQuantities(prev => ({ ...prev, [serviceId]: 1 }));
                return [...prev, serviceId];
            }
        });
    };

    const handleQuantityChange = (serviceId: number, quantity: number) => {
        setServiceQuantities(prev => ({ ...prev, [serviceId]: Math.max(1, quantity) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!title.trim() || !customerId || !signedAt) {
            openModal({ type: 'error', title: 'Błąd walidacji', message: 'Tytuł, klient i data podpisania są wymagane.' });
            setLoading(false);
            return;
        }

        try {
            // Przygotuj listę usług z ilościami
            const servicesData = selectedServiceIds.map(serviceId => ({
                serviceId,
                quantity: serviceQuantities[serviceId] || 1
            }));

            await api.put(`/Contracts/${id}`, {
                id: parseInt(id as string),
                title,
                contractNumber,
                placeOfSigning,
                signedAt: new Date(signedAt).toISOString(),
                startDate: startDate ? new Date(startDate).toISOString() : null,
                endDate: endDate ? new Date(endDate).toISOString() : null,
                netAmount: netAmount ? parseFloat(netAmount) : null,
                paymentTermDays: paymentTermDays ? parseInt(paymentTermDays) : null,
                scopeOfServices,  // Zachowaj dla kompatybilności wstecznej
                services: servicesData,  // Wyślij listę usług z ilościami
                serviceIds: selectedServiceIds,  // Alternatywnie dla kompatybilności
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
                            type="date"
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
                            type="date"
                            id="startDate"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="endDate" className="block text-gray-300 text-sm font-bold mb-2">Data Zakończenia:</label>
                        <input
                            type="date"
                            id="endDate"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="netAmount" className="block text-gray-300 text-sm font-bold mb-2">
                            Kwota Netto {selectedServiceIds.length > 0 && <span className="text-xs text-gray-400">(obliczona automatycznie)</span>}
                        </label>
                        <input
                            type="number"
                            id="netAmount"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400"
                            value={netAmount}
                            onChange={(e) => setNetAmount(e.target.value)}
                            step="0.01"
                            readOnly={selectedServiceIds.length > 0}
                            title={selectedServiceIds.length > 0 ? "Kwota obliczana automatycznie na podstawie wybranych usług" : ""}
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
                        <label className="block text-gray-300 text-sm font-bold mb-2">Wybierz usługi (kwota zostanie obliczona automatycznie)</label>
                        <div className="max-h-64 overflow-y-auto border border-gray-600 rounded bg-gray-700 p-3 space-y-2">
                            {services.length === 0 ? (
                                <p className="text-gray-400 text-sm">Brak dostępnych usług. Dodaj usługi w sekcji "Usługi".</p>
                            ) : (
                                services.map(service => {
                                    const isSelected = selectedServiceIds.includes(service.id);
                                    const quantity = serviceQuantities[service.id] || 1;
                                    const totalPrice = (service.price || 0) * quantity;

                                    return (
                                        <div key={service.id} className={`p-3 rounded border ${isSelected ? 'border-green-500 bg-gray-600' : 'border-gray-600 bg-gray-700'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleServiceToggle(service.id)}
                                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                                    />
                                                    <div className="flex-1">
                                                        <label className="text-white font-medium cursor-pointer" onClick={() => handleServiceToggle(service.id)}>
                                                            {service.name}
                                                        </label>
                                                        <p className="text-gray-400 text-sm">
                                                            Cena: {service.price ? `${service.price.toFixed(2)} PLN` : 'Brak ceny'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex items-center space-x-2">
                                                        <label className="text-gray-300 text-sm">Ilość:</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={quantity}
                                                            onChange={(e) => handleQuantityChange(service.id, parseInt(e.target.value) || 1)}
                                                            className="w-16 p-1 rounded bg-gray-800 text-white text-center border border-gray-600"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <span className="text-green-400 font-semibold min-w-[80px] text-right">
                                                            = {totalPrice.toFixed(2)} PLN
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {selectedServiceIds.length > 0 && (
                            <div className="mt-2 p-2 bg-gray-700 rounded">
                                <p className="text-gray-300 text-sm">
                                    Suma netto: <span className="text-green-400 font-bold text-lg">{calculateNetAmount()} PLN</span>
                                </p>
                            </div>
                        )}
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