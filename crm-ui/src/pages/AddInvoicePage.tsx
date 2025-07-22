/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { createInvoice, type CreateInvoiceDto } from '../services/invoiceService';
import { useModal } from '../context/ModalContext';
import ClientSelectModal from '../components/ClientSelectModal';

interface Customer { id: number; name: string; }
interface Service { id: number; name: string; price: number; }
interface InvoiceItem { serviceId: number; name: string; quantity: number; price: number; total: number; }

// Modal do wyboru usługi
function ServiceSelectModal({ services, onSelect, onClose }: {
    services: Service[];
    onSelect: (service: Service) => void;
    onClose: () => void;
}) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const RESULTS_PER_PAGE = 10;
    const filtered = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / RESULTS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">&times;</button>
                <h2 className="text-2xl font-bold mb-4 text-white">Wybierz usługę</h2>
                <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Szukaj po nazwie usługi..."
                    className="w-full mb-4 p-2 rounded bg-gray-700 text-white border border-gray-600"
                />
                <ul className="divide-y divide-gray-700 max-h-64 overflow-y-auto mb-4">
                    {paginated.length === 0 && <li className="text-gray-400 p-2">Brak wyników.</li>}
                    {paginated.map(service => (
                        <li key={service.id} className="p-2 hover:bg-gray-700 cursor-pointer rounded flex flex-col" onClick={() => onSelect(service)}>
                            <span className="font-semibold text-white">{service.name}</span>
                            <span className="text-gray-400 text-sm">{service.price.toFixed(2)} PLN</span>
                        </li>
                    ))}
                </ul>
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-2">
                        <button
                            className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >&lt;</button>
                        <span className="text-white">{page} / {totalPages}</span>
                        <button
                            className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >&gt;</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function AddInvoicePage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const navigate = useNavigate();
    const { openModal, openToast } = useModal();
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };
            try {
                const [customersRes, servicesRes] = await Promise.all([
                    axios.get(`${api}/customers`, { headers }),
                    axios.get(`${api}/services`, { headers }),
                ]);

                const customerData = customersRes.data;
                if (customerData && Array.isArray((customerData as any).$values)) {
                    setCustomers((customerData as any).$values);
                } else if (Array.isArray(customerData)) {
                    setCustomers(customerData);
                }

                const servicesData = servicesRes.data;
                if (servicesData && Array.isArray((servicesData as any).$values)) {
                    setServices((servicesData as any).$values);
                } else if (Array.isArray(servicesData)) {
                    setServices(servicesData);
                }
            } catch (err: any) {
                openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || "Nie udało się załadować danych potrzebnych do utworzenia faktury." });
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [api]);

    const handleAddItem = () => {
        if (!selectedServiceId) {
            openModal({ type: 'error', title: 'Błąd', message: 'Proszę wybrać usługę.' });
            return;
        }
        const service = services.find(s => s.id === parseInt(selectedServiceId, 10));
        if (!service) return;

        const newItem: InvoiceItem = {
            serviceId: service.id,
            name: service.name,
            quantity: quantity,
            price: service.price,
            total: service.price * quantity,
        };

        setInvoiceItems(prevItems => [...prevItems, newItem]);
        setSelectedServiceId('');
        setQuantity(1);
    };

    const handleRemoveItem = (serviceIdToRemove: number) => {
        setInvoiceItems(prevItems => prevItems.filter(item => item.serviceId !== serviceIdToRemove));
    };

    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.total, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId || invoiceItems.length === 0) {
            openModal({ type: 'error', title: 'Błąd Walidacji', message: 'Proszę wybrać klienta i dodać co najmniej jedną pozycję.' });
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const invoiceData: CreateInvoiceDto = {
            customerId: parseInt(selectedCustomerId, 10),
            invoiceNumber: invoiceNumber,
            items: invoiceItems.map(item => ({
                serviceId: item.serviceId,
                quantity: item.quantity,
            })),
        };

        try {
            await createInvoice(invoiceData);
            openToast('Faktura została pomyślnie utworzona.', 'success');
            navigate('/faktury');
        } catch (err: any) {
            openModal({ type: 'error', title: 'Błąd', message: err.response?.data?.message || 'Wystąpił błąd podczas zapisywania faktury.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-6"><h1 className="text-3xl font-bold text-white mb-6">➕ Dodaj nową fakturę</h1><p>Ładowanie danych...</p></div>;
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">➕ Dodaj nową fakturę</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md">
                {error && <p className="mb-4 text-center text-red-500">{error}</p>}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="customer" className="block text-sm font-medium text-gray-300 mb-2">Wybierz klienta</label>
                        <button type="button" onClick={() => setShowClientModal(true)} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 text-left">
                            {selectedCustomer ? `Klient: ${selectedCustomer.name}` : '-- Wybierz klienta --'}
                        </button>
                        {showClientModal && (
                            <ClientSelectModal
                                clients={customers}
                                onSelect={client => {
                                    setSelectedCustomer(client);
                                    setSelectedCustomerId(client.id.toString());
                                    setShowClientModal(false);
                                }}
                                onClose={() => setShowClientModal(false)}
                            />
                        )}
                    </div>
                    <div>
                        <label htmlFor="invoice-number" className="block text-sm font-medium text-gray-300 mb-2">Numer faktury</label>
                        <input type="text" id="invoice-number" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" placeholder="np. FV/2025/06/01" required />
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-6 pt-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Pozycje na fakturze</h2>
                    <div className="flex gap-4 items-end mb-4">
                        <div className="flex-grow">
                            <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-1">Usługa</label>
                            <button type="button" onClick={() => setShowServiceModal(true)} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 text-left">
                                {selectedService ? `${selectedService.name} - ${selectedService.price.toFixed(2)} PLN` : '-- Wybierz usługę --'}
                            </button>
                            {showServiceModal && (
                                <ServiceSelectModal
                                    services={services}
                                    onSelect={service => {
                                        setSelectedService(service);
                                        setSelectedServiceId(service.id.toString());
                                        setShowServiceModal(false);
                                    }}
                                    onClose={() => setShowServiceModal(false)}
                                />
                            )}
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">Ilość</label>
                            <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className="w-24 p-2 rounded bg-gray-700 text-white border-gray-600" />
                        </div>
                        <button type="button" onClick={handleAddItem} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors">Dodaj pozycję</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-white">
                            <thead>
                                <tr className="bg-gray-700">
                                    <th className="text-left p-3">Nazwa usługi</th>
                                    <th className="text-right p-3">Ilość</th>
                                    <th className="text-right p-3">Cena jedn.</th>
                                    <th className="text-right p-3">Suma</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceItems.length > 0 ? invoiceItems.map(item => (
                                    <tr key={item.serviceId} className="border-b border-gray-700">
                                        <td className="p-3">{item.name}</td>
                                        <td className="p-3 text-right">{item.quantity}</td>
                                        <td className="p-3 text-right">{item.price.toFixed(2)} PLN</td>
                                        <td className="p-3 text-right">{item.total.toFixed(2)} PLN</td>
                                        <td className="p-3 text-center">
                                            <button type="button" onClick={() => handleRemoveItem(item.serviceId)} className="text-red-500 hover:text-red-400">🗑️</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-gray-500">Brak pozycji na fakturze.</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="font-bold bg-gray-700">
                                    <td colSpan={3} className="text-right p-3">Suma całkowita:</td>
                                    <td className="text-right p-3">{totalAmount.toFixed(2)} PLN</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-700">
                    <Link to="/faktury" className="text-gray-400 hover:text-white transition-colors">Anuluj</Link>
                    <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:bg-gray-500">
                        {isSubmitting ? 'Zapisywanie...' : 'Zapisz fakturę'}
                    </button>
                </div>
            </form>
        </div>
    );
}