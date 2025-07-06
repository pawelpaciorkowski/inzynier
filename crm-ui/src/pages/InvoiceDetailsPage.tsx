/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvoiceById, type InvoiceDetailsDto } from '../services/invoiceService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export function InvoiceDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<InvoiceDetailsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchInvoiceDetails = async () => {
            try {
                setLoading(true);
                const data = await getInvoiceById(Number(id));
                setInvoice(data);
                setError(null);
            } catch (err) {
                setError('Nie udało się pobrać danych faktury.');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoiceDetails();
    }, [id]);

    if (loading) return <p className="p-6 text-center text-gray-400">Ładowanie danych...</p>;
    if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
    if (!invoice) return <p className="p-6 text-center text-gray-500">Nie znaleziono faktury.</p>;

    // ✅ POPRAWKA: Sprawdzamy, czy items jest już tablicą, czy obiektem z polem $values
    const itemsToRender = Array.isArray(invoice.items) ? invoice.items : invoice.items?.$values || [];

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <div className="max-w-4xl mx-auto">
                <Link to="/faktury" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Powrót do listy faktur
                </Link>

                <div className="bg-gray-800 rounded-lg shadow-lg p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Faktura nr {invoice.invoiceNumber}</h1>
                            <p className="text-gray-400">Data wystawienia: {new Date(invoice.issuedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-semibold">{invoice.customerName}</h2>
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Pozycje na fakturze</h3>
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="py-2 text-left font-semibold">Opis</th>
                                <th className="py-2 text-right font-semibold">Ilość</th>
                                <th className="py-2 text-right font-semibold">Cena jedn.</th>
                                <th className="py-2 text-right font-semibold">Wartość brutto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Iterujemy po poprawnie wyodrębnionej tablicy */}
                            {itemsToRender.map((item: any) => (
                                <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-700/50">
                                    <td className="py-3">{item.description}</td>
                                    <td className="py-3 text-right">{item.quantity}</td>
                                    <td className="py-3 text-right">{item.unitPrice.toFixed(2)} PLN</td>
                                    <td className="py-3 text-right">{item.grossAmount.toFixed(2)} PLN</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mt-8">
                        <div className="w-full max-w-xs space-y-2 text-right">
                            <div className="flex justify-between text-2xl font-bold border-t border-gray-700 pt-2">
                                <span>Do zapłaty:</span>
                                <span>{invoice.totalAmount.toFixed(2)} PLN</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}