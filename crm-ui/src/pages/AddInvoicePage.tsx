/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { createInvoice, type CreateInvoiceDto } from '../services/invoiceService';
import { useModal } from '../context/ModalContext';

interface Customer { id: number; name: string; }
interface Service { id: number; name: string; price: number; }
interface InvoiceItem { serviceId: number; name: string; quantity: number; price: number; total: number; }

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

    const navigate = useNavigate();
    const { openModal } = useModal();
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
            } catch (err) {
                setError("Nie udało się załadować danych potrzebnych do utworzenia faktury.");
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
            setError('Proszę wybrać klienta i dodać co najmniej jedną pozycję.');
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
            openModal({
                type: 'success',
                title: 'Sukces!',
                message: 'Faktura została pomyślnie utworzona.',
                onConfirm: () => navigate('/faktury')
            });
        } catch (err) {
            setError('Wystąpił błąd podczas zapisywania faktury.');
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
                        <select id="customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" required>
                            <option value="">-- Wybierz --</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </select>
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
                            <select id="service" value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border-gray-600">
                                <option value="">-- Wybierz usługę --</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.price.toFixed(2)} PLN</option>)}
                            </select>
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