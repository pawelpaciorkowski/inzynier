// Import biblioteki axios do wykonywania zapytań HTTP
import axios from 'axios';

// Bazowy URL API dla wszystkich zapytań dotyczących faktur
const API_URL = '/api'; 

// Interface definiujący strukturę elementu listy faktur (skrócone dane)
export interface InvoiceListItemDto {
    // Unikalny identyfikator faktury
    id: number;
    // Numer faktury (np. FV/2024/001)
    invoiceNumber: string;
    // Data wystawienia faktury w formacie ISO string
    issuedAt: string; 
    // Całkowita kwota faktury
    totalAmount: number;
    // Nazwa klienta dla którego wystawiono fakturę
    customerName: string;
}

// Interface definiujący strukturę pozycji na fakturze
export interface InvoiceItemDto {
    // Unikalny identyfikator pozycji
    id: number;
    // Opis usługi/produktu na fakturze
    description: string;
    // Ilość jednostek
    quantity: number;
    // Cena jednostkowa (netto)
    unitPrice: number;
    // Kwota netto (quantity * unitPrice)
    netAmount: number;
    // Kwota brutto (z VAT)
    grossAmount: number;
}

// Interface definiujący pełne szczegóły faktury (rozszerza podstawowy element listy)
export interface InvoiceDetailsDto extends InvoiceListItemDto {
    // Data płatności faktury
    dueDate: string;
    // Lista pozycji na fakturze (w formacie $values z backendu .NET)
    items: {
        $values: InvoiceItemDto[];
    };
}

// DTO do tworzenia nowej pozycji na fakturze
export interface CreateInvoiceItemDto {
    // ID usługi z katalogu usług
    serviceId: number;
    // Ilość jednostek usługi
    quantity: number;
}

// DTO do tworzenia nowej faktury
export interface CreateInvoiceDto {
    // ID klienta dla którego wystawiana jest faktura
    customerId: number;
    // Numer faktury
    invoiceNumber: string;
    // Lista pozycji do dodania na fakturę
    items: CreateInvoiceItemDto[];
}

// --- Funkcje serwisu faktur ---

// Funkcja pomocnicza do tworzenia nagłówków autoryzacyjnych
const getAuthHeaders = () => {
    // Pobieramy token JWT z localStorage przeglądarki
    const token = localStorage.getItem('token');
    // Sprawdzamy czy token istnieje, jeśli nie - rzucamy błąd
    if (!token) throw new Error('Brak autoryzacji');
    // Zwracamy nagłówek Authorization z tokenem Bearer
    return { Authorization: `Bearer ${token}` };
};

// Funkcja pobierająca listę wszystkich faktur z serwera
export const getInvoices = async (): Promise<InvoiceListItemDto[]> => {
    try {
        // Wykonujemy zapytanie GET do endpointa /api/invoices z nagłówkami autoryzacyjnymi
        const response = await axios.get(`${API_URL}/invoices`, { headers: getAuthHeaders() });
        // Obsługa formatu .$values z backendu .NET - jeśli API zwraca dane w tym formacie
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (response.data as any).$values || response.data;
    } catch (error) {
        // Logujemy błąd do konsoli dla celów debugowania
        console.error('Błąd podczas pobierania faktur:', error);
        // Przekazujemy błąd dalej dla obsługi w komponencie
        throw error; 
    }
};

// Funkcja pobierająca szczegóły pojedynczej faktury na podstawie ID
export const getInvoiceById = async (id: number): Promise<InvoiceDetailsDto> => {
    try {
        // Wykonujemy zapytanie GET do endpointa /api/invoices/{id}
        const response = await axios.get(`${API_URL}/invoices/${id}`, { headers: getAuthHeaders() });
        // Zwracamy dane faktury z odpowiedzi
        return response.data;
    } catch (error) {
        // Logujemy błąd z ID faktury dla łatwiejszego debugowania
        console.error(`Błąd podczas pobierania faktury o ID ${id}:`, error);
        // Przekazujemy błąd dalej
        throw error;
    }
};

// Funkcja tworząca nową fakturę w systemie
export const createInvoice = async (invoiceData: CreateInvoiceDto) => {
    try {
        // Wykonujemy zapytanie POST z danymi faktury do endpointa /api/invoices
        const response = await axios.post(`${API_URL}/invoices`, invoiceData, { headers: getAuthHeaders() });
        // Zwracamy odpowiedź z serwera (ID nowej faktury, itp.)
        return response.data;
    } catch (error) {
        // Logujemy błąd tworzenia faktury
        console.error('Błąd podczas tworzenia faktury:', error);
        // Przekazujemy błąd dalej
        throw error;
    }
};

// Funkcja usuwająca fakturę z systemu
export const deleteInvoice = async (id: number): Promise<void> => {
    try {
        // Wykonujemy zapytanie DELETE do endpointa /api/invoices/{id}
        await axios.delete(`${API_URL}/invoices/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        // Logujemy błąd usuwania z ID faktury
        console.error(`Błąd podczas usuwania faktury o ID ${id}:`, error);
        // Przekazujemy błąd dalej
        throw error;
    }
};