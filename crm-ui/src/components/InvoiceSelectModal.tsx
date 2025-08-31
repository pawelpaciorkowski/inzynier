import React, { useState, useMemo } from 'react';

export interface InvoiceSelectModalProps {
    invoices: Array<{
        id: number;
        invoiceNumber: string;
        totalAmount: number;
        isPaid: boolean;
        customerName?: string;
        issuedAt?: string;
    }>;
    onSelect: (invoice: { 
        id: number; 
        invoiceNumber: string; 
        totalAmount: number; 
        isPaid: boolean; 
        customerName?: string; 
        issuedAt?: string; 
    }) => void;
    onClose: () => void;
}

const RESULTS_PER_PAGE = 10;

const InvoiceSelectModal: React.FC<InvoiceSelectModalProps> = ({ invoices, onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Filter out invalid invoices and ensure all required properties exist
    const validInvoices = useMemo(() => {
        if (!invoices || !Array.isArray(invoices)) {
            return [];
        }
        const filtered = invoices.filter(invoice =>
            invoice &&
            typeof invoice === 'object' &&
            typeof invoice.id === 'number' &&
            typeof invoice.invoiceNumber === 'string' &&
            invoice.invoiceNumber.trim() !== ''
        );
        return filtered;
    }, [invoices]);

    const filtered = useMemo(() => 
        validInvoices.filter(inv =>
            inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            (inv.customerName && inv.customerName.toLowerCase().includes(search.toLowerCase())) ||
            inv.totalAmount.toString().includes(search)
        ),
        [validInvoices, search]
    );

    const totalPages = Math.ceil(filtered.length / RESULTS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE);

    // Defensive check to ensure invoices is a valid array
    if (!invoices || !Array.isArray(invoices)) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                    <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">&times;</button>
                    <div className="text-center text-gray-400">Ładowanie faktur...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">&times;</button>
                
                <h2 className="text-xl font-bold text-white mb-4">Wybierz fakturę</h2>
                
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Szukaj faktur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {paginated.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            {search ? 'Nie znaleziono faktur pasujących do wyszukiwania.' : 'Brak dostępnych faktur.'}
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {paginated.map((invoice) => (
                                <li key={invoice.id}>
                                    <button
                                        onClick={() => onSelect(invoice)}
                                        className="w-full p-3 rounded bg-gray-700 hover:bg-gray-600 text-left transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="font-semibold text-white">
                                                    {invoice.invoiceNumber}
                                                </div>
                                                {invoice.customerName && (
                                                    <div className="text-sm text-gray-300">
                                                        Klient: {invoice.customerName}
                                                    </div>
                                                )}
                                                {invoice.issuedAt && (
                                                    <div className="text-sm text-gray-400">
                                                        Data wystawienia: {new Date(invoice.issuedAt).toLocaleDateString('pl-PL')}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="font-bold text-white">
                                                    {invoice.totalAmount.toFixed(2)} PLN
                                                </div>
                                                <div className={`text-xs px-2 py-1 rounded ${
                                                    invoice.isPaid 
                                                        ? 'bg-green-600 text-white' 
                                                        : 'bg-yellow-600 text-white'
                                                }`}>
                                                    {invoice.isPaid ? 'Opłacona' : 'Nieopłacona'}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <button
                            className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            &lt;
                        </button>
                        <span className="text-white">{page} / {totalPages}</span>
                        <button
                            className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceSelectModal;
