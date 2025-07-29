/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

interface Service { id: number; name: string; price: number; }
interface InvoiceItem { serviceId: number; name: string; quantity: number; price: number; total: number; }

export default function EditInvoicePage() {
    const { id } = useParams<{ id: string }>();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const [invoiceCustomerId, setInvoiceCustomerId] = useState<string>('');
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    const [showServiceModal, setShowServiceModal] = useState(false);

    const navigate = useNavigate();
    const { openModal, openToast } = useModal();
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token || !id) return;
            const headers = { Authorization: `Bearer ${token}` };
            try {
                const [servicesRes, invoiceRes] = await Promise.all([
                    axios.get(`${api}/services`, { headers }),
                    axios.get(`${api}/invoices/${id}`, { headers }),
                ]);

                const servicesData = servicesRes.data;
                setServices(Array.isArray(servicesData.$values) ? servicesData.$values : servicesData);

                const invoice = invoiceRes.data;
                console.log('DEBUG: Invoice data:', invoice);

                const customerId = invoice.customerId || 0;
                const customerName = invoice.customerName || 'Klient nie znaleziony';
                const invoiceNum = invoice.invoiceNumber || invoice.number || '';

                setSelectedCustomerId(customerId.toString());
                setInvoiceCustomerId(customerName);
                setInvoiceNumber(invoiceNum);

                console.log('DEBUG: customerId:', customerId);
                console.log('DEBUG: customerName:', customerName);
                console.log('DEBUG: invoiceNum:', invoiceNum);

                setInvoiceItems((invoice.items?.$values || invoice.items || []).map((item: any) => ({
                    serviceId: item.serviceId, // Dodajemy serviceId
                    name: item.name || item.description || '',
                    quantity: item.quantity,
                    price: item.unitPrice || item.price || 0,
                    total: (item.unitPrice || item.price || 0) * item.quantity,
                }) as InvoiceItem));
            } catch (err: unknown) {
                let errorMessage = 'Nie udało się załadować danych faktury.';
                if (axios.isAxiosError(err) && err.response) {
                    errorMessage = err.response.data?.message || err.message;
                }
                openModal({ type: 'error', title: 'Błąd', message: errorMessage });
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [api, id, openModal]);

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
        setSelectedService(null);
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
        const token = localStorage.getItem("token");
        const invoiceData = {
            invoiceNumber,
            customerId: parseInt(selectedCustomerId, 10),
            items: invoiceItems.map(item => ({
                serviceId: item.serviceId,
                quantity: item.quantity,
            })),
        };
        try {
            await axios.put(`${api}/invoices/${id}`, invoiceData, { headers: { Authorization: `Bearer ${token}` } });
            openToast('Faktura została zaktualizowana.', 'success');
            navigate(`/faktury/${id}`);
        } catch (err: unknown) {
            let errorMessage = 'Wystąpił błąd podczas zapisywania faktury.';
            if (axios.isAxiosError(err) && err.response) {
                errorMessage = err.response.data?.message || err.message;
            }
            openModal({ type: 'error', title: 'Błąd', message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-6"><h1 className="text-3xl font-bold text-white mb-6">✏️ Edytuj fakturę</h1><p>Ładowanie danych...</p></div>;
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">✏️ Edytuj fakturę</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md">
                {error && <p className="mb-4 text-center text-red-500">{error}</p>}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Klient</label>
                        <div className="w-full p-2 rounded bg-gray-600 text-white border border-gray-500">
                            {invoiceCustomerId || 'Ładowanie...'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Numer faktury</label>
                        <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" required />
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-6 pt-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Pozycje na fakturze</h2>
                    <div className="flex gap-4 items-end mb-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Usługa</label>
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
                            <label className="block text-sm font-medium text-gray-300 mb-1">Ilość</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className="w-24 p-2 rounded bg-gray-700 text-white border-gray-600" />
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
                <div className="flex justify-end pt-4 gap-3">
                    <button type="button" onClick={() => navigate(`/faktury/${id}`)} className="text-gray-400 hover:text-white px-6 py-2 rounded-md transition-colors">Anuluj</button>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors" disabled={isSubmitting}>
                        Zapisz zmiany
                    </button>
                </div>
            </form>
        </div>
    );
}

// Modal do wyboru usługi (lokalny)
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