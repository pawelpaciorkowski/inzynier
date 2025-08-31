// Import głównej biblioteki React
import React, { useState, useMemo } from 'react';

// Interface definiujący props komponentu InvoiceSelectModal
export interface InvoiceSelectModalProps {
    // Lista faktur dostępnych do wyboru
    invoices: Array<{
        id: number; // Unikalny identyfikator faktury
        invoiceNumber: string; // Numer faktury
        totalAmount: number; // Całkowita kwota faktury
        isPaid: boolean; // Flaga określająca czy faktura jest opłacona
        customerName?: string; // Opcjonalna nazwa klienta
        issuedAt?: string; // Opcjonalna data wystawienia faktury
    }>;
    // Funkcja callback wywoływana gdy użytkownik wybiera fakturę
    onSelect: (invoice: {
        id: number;
        invoiceNumber: string;
        totalAmount: number;
        isPaid: boolean;
        customerName?: string;
        issuedAt?: string;
    }) => void;
    // Funkcja callback wywoływana gdy użytkownik zamyka modal
    onClose: () => void;
}

// Stała określająca liczbę faktur wyświetlanych na jednej stronie
const RESULTS_PER_PAGE = 10;

// Komponent modala do wyboru faktury - renderuje listę faktur z wyszukiwaniem i paginacją
const InvoiceSelectModal: React.FC<InvoiceSelectModalProps> = ({ invoices, onSelect, onClose }) => {
    // Stan przechowujący tekst wyszukiwania
    const [search, setSearch] = useState('');
    // Stan przechowujący numer aktualnej strony
    const [page, setPage] = useState(1);

    // Memoizowana lista ważnych faktur - filtruje nieprawidłowe dane
    const validInvoices = useMemo(() => {
        // Sprawdza czy invoices istnieje i jest tablicą
        if (!invoices || !Array.isArray(invoices)) {
            return []; // Zwraca pustą tablicę jeśli dane są nieprawidłowe
        }
        // Filtruje faktury, sprawdzając czy mają wszystkie wymagane pola
        const filtered = invoices.filter(invoice =>
            invoice && // Sprawdza czy faktura istnieje
            typeof invoice === 'object' && // Sprawdza czy to obiekt
            typeof invoice.id === 'number' && // Sprawdza czy ID jest liczbą
            typeof invoice.invoiceNumber === 'string' && // Sprawdza czy numer faktury jest stringiem
            invoice.invoiceNumber.trim() !== '' // Sprawdza czy numer faktury nie jest pusty
        );
        return filtered; // Zwraca przefiltrowaną listę
    }, [invoices]); // Zależność - recalculates gdy invoices się zmienia

    // Memoizowana lista faktur przefiltrowana według wyszukiwania
    const filtered = useMemo(() =>
        validInvoices.filter(inv =>
            // Wyszukuje w numerze faktury (ignoruje wielkość liter)
            inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            // Wyszukuje w nazwie klienta (jeśli istnieje)
            (inv.customerName && inv.customerName.toLowerCase().includes(search.toLowerCase())) ||
            // Wyszukuje w kwocie faktury
            inv.totalAmount.toString().includes(search)
        ),
        [validInvoices, search] // Zależności - recalculates gdy validInvoices lub search się zmienia
    );

    // Oblicza całkowitą liczbę stron na podstawie przefiltrowanych faktur
    const totalPages = Math.ceil(filtered.length / RESULTS_PER_PAGE);
    // Wycina faktury dla aktualnej strony (paginacja)
    const paginated = filtered.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE);

    // Sprawdza czy dane faktur są prawidłowe - jeśli nie, wyświetla komunikat ładowania
    if (!invoices || !Array.isArray(invoices)) {
        return (
            // Modal z tłem i wyśrodkowanym kontenerem
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                {/* Główny kontener modala */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                    {/* Przycisk zamknięcia modala */}
                    <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">&times;</button>
                    {/* Komunikat ładowania */}
                    <div className="text-center text-gray-400">Ładowanie faktur...</div>
                </div>
            </div>
        );
    }

    return (
        // Modal z tłem i wyśrodkowanym kontenerem
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            {/* Główny kontener modala */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
                {/* Przycisk zamknięcia modala */}
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">&times;</button>

                {/* Tytuł modala */}
                <h2 className="text-xl font-bold text-white mb-4">Wybierz fakturę</h2>

                {/* Pole wyszukiwania */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Szukaj faktur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)} // Aktualizuje stan wyszukiwania
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                </div>

                {/* Lista faktur z przewijaniem */}
                <div className="max-h-96 overflow-y-auto">
                    {paginated.length === 0 ? (
                        // Komunikat gdy nie ma faktur do wyświetlenia
                        <div className="text-center text-gray-400 py-8">
                            {search ? 'Nie znaleziono faktur pasujących do wyszukiwania.' : 'Brak dostępnych faktur.'}
                        </div>
                    ) : (
                        // Lista faktur
                        <ul className="space-y-2">
                            {paginated.map((invoice) => (
                                <li key={invoice.id}>
                                    {/* Przycisk wyboru faktury */}
                                    <button
                                        onClick={() => onSelect(invoice)} // Wywołuje callback z wybraną fakturą
                                        className="w-full p-3 rounded bg-gray-700 hover:bg-gray-600 text-left transition-colors"
                                    >
                                        {/* Kontener z informacjami o fakturze */}
                                        <div className="flex justify-between items-start">
                                            {/* Lewa strona - informacje o fakturze */}
                                            <div className="flex-1">
                                                {/* Numer faktury */}
                                                <div className="font-semibold text-white">
                                                    {invoice.invoiceNumber}
                                                </div>
                                                {/* Nazwa klienta (jeśli istnieje) */}
                                                {invoice.customerName && (
                                                    <div className="text-sm text-gray-300">
                                                        Klient: {invoice.customerName}
                                                    </div>
                                                )}
                                                {/* Data wystawienia (jeśli istnieje) */}
                                                {invoice.issuedAt && (
                                                    <div className="text-sm text-gray-400">
                                                        Data wystawienia: {new Date(invoice.issuedAt).toLocaleDateString('pl-PL')}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Prawa strona - kwota i status */}
                                            <div className="text-right ml-4">
                                                {/* Kwota faktury */}
                                                <div className="font-bold text-white">
                                                    {invoice.totalAmount.toFixed(2)} PLN
                                                </div>
                                                {/* Status płatności z kolorowym oznaczeniem */}
                                                <div className={`text-xs px-2 py-1 rounded ${invoice.isPaid
                                                    ? 'bg-green-600 text-white' // Zielone tło dla opłaconych
                                                    : 'bg-yellow-600 text-white' // Żółte tło dla nieopłaconych
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

                {/* Paginacja - wyświetlana tylko gdy jest więcej niż jedna strona */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                        {/* Przycisk poprzedniej strony */}
                        <button
                            className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                            onClick={() => setPage(p => Math.max(1, p - 1))} // Przechodzi do poprzedniej strony
                            disabled={page === 1} // Wyłącza gdy jesteśmy na pierwszej stronie
                        >
                            &lt;
                        </button>
                        {/* Informacja o aktualnej stronie */}
                        <span className="text-white">{page} / {totalPages}</span>
                        {/* Przycisk następnej strony */}
                        <button
                            className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))} // Przechodzi do następnej strony
                            disabled={page === totalPages} // Wyłącza gdy jesteśmy na ostatniej stronie
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Eksport domyślny komponentu InvoiceSelectModal
export default InvoiceSelectModal;
