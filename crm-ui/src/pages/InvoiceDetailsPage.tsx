/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvoiceById, type InvoiceDetailsDto } from '../services/invoiceService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Payment {
    id: number;
    invoiceId: number;
    invoiceNumber: string;
    paidAt: string;
    amount: number;
}

export function InvoiceDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<InvoiceDetailsDto | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchInvoiceDetails = async () => {
            try {
                setLoading(true);
                const invoiceData = await getInvoiceById(Number(id));
                setInvoice(invoiceData);

                const paymentsResponse = await axios.get<any>(`/api/Payments?invoiceId=${id}`);
                const paymentsData = paymentsResponse.data.$values || paymentsResponse.data;
                setPayments(paymentsData);

                setError(null);
            } catch (err) {
                setError('Nie udało się pobrać danych faktury lub płatności.');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoiceDetails();
    }, [id]);

    if (loading) return <p className="p-6 text-center text-gray-400">Ładowanie danych...</p>;
    if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
    if (!invoice) return <p className="p-6 text-center text-gray-500">Nie znaleziono faktury.</p>;

    const itemsToRender = Array.isArray(invoice.items) ? invoice.items : invoice.items?.$values || [];

    const totalPaidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = invoice.totalAmount - totalPaidAmount;

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <div className="max-w-4xl mx-auto">
                <Link to="/faktury" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Powrót do listy faktur
                </Link>

                <div className="bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Faktura nr {invoice.invoiceNumber}
                            </h1>

                            <p className="text-gray-400">
                                Data wystawienia: {format(new Date(invoice.issuedAt), 'dd.MM.yyyy', { locale: pl })}
                            </p>

                            {invoice.dueDate && (
                                <p className="text-gray-400">
                                    Termin płatności: {format(new Date(invoice.dueDate), 'dd.MM.yyyy', { locale: pl })}
                                </p>
                            )}

                            {'isPaid' in invoice && (
                                <p className="text-gray-400">
                                    Status: {invoice.isPaid ? 'Zapłacona' : 'Oczekuje na płatność'}
                                </p>
                            )}
                        </div>

                        <div className="text-right">
                            <h2 className="text-xl font-semibold">
                                {invoice.customerName}
                            </h2>
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
                            <div className="flex justify-between text-lg text-gray-400">
                                <span>Zapłacono:</span>
                                <span>{totalPaidAmount.toFixed(2)} PLN</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Pozostało:</span>
                                <span className={remainingAmount > 0 ? "text-red-400" : "text-green-400"}>
                                    {remainingAmount.toFixed(2)} PLN
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg p-8">
                    <h3 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Historia Płatności</h3>
                    {payments.length === 0 ? (
                        <p className="text-gray-400">Brak płatności dla tej faktury.</p>
                    ) : (
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ID Płatności</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Płatności</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Kwota</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-700">
                                        <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">{payment.id}</td>
                                        <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">{format(new Date(payment.paidAt), 'dd.MM.yyyy HH:mm', { locale: pl })}</td>
                                        <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">{payment.amount.toFixed(2)} PLN</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}