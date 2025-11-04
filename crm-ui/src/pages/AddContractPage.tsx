/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import ClientSelectModal from '../components/ClientSelectModal';
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

export function AddContractPage() {
    const [formData, setFormData] = useState({
        title: '',
        customerId: '',
        contractNumber: '',
        placeOfSigning: 'Warszawa',
        signedAt: new Date().toISOString().split('T')[0],
        startDate: '',
        endDate: '',
        scopeOfServices: '',  // Zachowaj dla kompatybilności wstecznej (opcjonalne)
        netAmount: '',
        paymentTermDays: '14',
    });

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
    const [serviceQuantities, setServiceQuantities] = useState<Record<number, number>>({});
    const navigate = useNavigate();
    const { openModal, openToast } = useModal();
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await api.get('/Customers/');
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
        const fetchServices = async () => {
            try {
                const res = await api.get('/Services/');
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    setServices((data as any).$values);
                } else if (Array.isArray(data)) {
                    setServices(data);
                }
            } catch (err: any) {
                console.error('Błąd pobierania usług', err);
            }
        };
        fetchCustomers();
        fetchServices();
    }, [api]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
            setFormData(prev => ({ ...prev, netAmount: calculatedAmount }));
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
        if (!formData.customerId) {
            openModal({ type: 'error', title: 'Błąd Walidacji', message: 'Proszę wybrać klienta.' });
            return;
        }

        const token = localStorage.getItem('token');
        // Przygotuj listę usług z ilościami
        const servicesData = selectedServiceIds.map(serviceId => ({
            serviceId,
            quantity: serviceQuantities[serviceId] || 1
        }));

        const newContract = {
            ...formData,
            customerId: parseInt(formData.customerId),
            netAmount: parseFloat(formData.netAmount) || 0,
            paymentTermDays: parseInt(formData.paymentTermDays),
            signedAt: new Date(formData.signedAt),
            startDate: formData.startDate ? new Date(formData.startDate) : null,
            endDate: formData.endDate ? new Date(formData.endDate) : null,
            services: servicesData,  // Wyślij listę usług z ilościami
            serviceIds: selectedServiceIds  // Alternatywnie dla kompatybilności
        };

        try {
            await api.post('/Contracts/', newContract);
            openToast('Nowy kontrakt został pomyślnie dodany.', 'success');
            navigate('/kontrakty');
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Wybierz usługi (kwota zostanie obliczona automatycznie)</label>
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
                        <label htmlFor="netAmount" className="block text-sm font-medium text-gray-300 mb-1">
                            Wartość netto (PLN) {selectedServiceIds.length > 0 && <span className="text-xs text-gray-400">(obliczona automatycznie)</span>}
                        </label>
                        <input
                            id="netAmount"
                            name="netAmount"
                            type="number"
                            step="0.01"
                            value={formData.netAmount}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-white"
                            readOnly={selectedServiceIds.length > 0}
                            title={selectedServiceIds.length > 0 ? "Kwota obliczana automatycznie na podstawie wybranych usług" : ""}
                        />
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